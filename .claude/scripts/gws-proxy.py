#!/usr/bin/env python3
"""
gws-proxy — Local reverse proxy that relays Google Workspace API calls
through a Google Apps Script Web App relay.

This solves the problem where Claude Code sandbox's TLS-inspecting egress
proxy blocks direct access to Google Workspace data APIs (Drive, Gmail,
Calendar, etc.) while allowing auth endpoints and non-Google domains.

Architecture:
  gws CLI → localhost:8080 → script.google.com/macros/s/.../exec → Google APIs

Usage:
  1. Deploy the Apps Script relay (see gws-relay-appscript.js)
  2. Set GWS_RELAY_URL to the deployed script URL
  3. Run: python3 gws-proxy.py &
  4. Run gws with modified discovery doc pointing to localhost:8080

Environment Variables:
  GWS_RELAY_URL    — The deployed Google Apps Script web app URL (required)
  GWS_PROXY_PORT   — Local proxy port (default: 8080)
  GWS_DEBUG        — Set to "1" for verbose logging
"""

import http.server
import json
import os
import subprocess
import sys
import urllib.parse
from http import HTTPStatus

RELAY_URL = os.environ.get("GWS_RELAY_URL", "")
PROXY_PORT = int(os.environ.get("GWS_PROXY_PORT", "8080"))
DEBUG = os.environ.get("GWS_DEBUG", "") == "1"


def log(msg):
    if DEBUG:
        print(f"[gws-proxy] {msg}", file=sys.stderr)


class GWSProxyHandler(http.server.BaseHTTPRequestHandler):
    """
    Handles requests from gws (or any HTTP client) and relays them
    through the Google Apps Script web app.
    """

    def do_GET(self):
        self._proxy("GET")

    def do_POST(self):
        self._proxy("POST")

    def do_PUT(self):
        self._proxy("PUT")

    def do_PATCH(self):
        self._proxy("PATCH")

    def do_DELETE(self):
        self._proxy("DELETE")

    def _proxy(self, method):
        if not RELAY_URL:
            self._send_error(500, "GWS_RELAY_URL not set")
            return

        # Parse the incoming request path: /<service>/<version>/<resource>[/...]?params
        parsed = urllib.parse.urlparse(self.path)
        api_path = parsed.path.lstrip("/")
        query = parsed.query

        # Build relay URL with the apiPath parameter
        relay_params = {
            "apiPath": api_path,
            "httpMethod": method,
        }

        # Forward original query parameters
        if query:
            for k, v in urllib.parse.parse_qsl(query):
                relay_params[k] = v

        relay_qs = urllib.parse.urlencode(relay_params)
        full_relay_url = f"{RELAY_URL}?{relay_qs}"

        log(f"{method} {self.path} → {full_relay_url}")

        # Read POST body if present
        body = None
        content_length = self.headers.get("Content-Length")
        if content_length:
            body = self.rfile.read(int(content_length))

        # Use curl to call the relay (curl handles the egress proxy correctly)
        cmd = [
            "curl", "-s", "--noproxy", "",
            "-X", "GET",  # Apps Script web apps use GET/POST
            "-L",  # Follow redirects
            "--connect-timeout", "30",
            "--max-time", "60",
            full_relay_url,
        ]

        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=65,
            )

            if result.returncode != 0:
                log(f"curl failed: {result.stderr}")
                self._send_error(502, f"Relay error: {result.stderr}")
                return

            # Parse the relay response
            try:
                relay_response = json.loads(result.stdout)
            except json.JSONDecodeError:
                log(f"Invalid relay response: {result.stdout[:200]}")
                self._send_error(502, "Invalid relay response")
                return

            # Extract the actual API response
            status = relay_response.get("status", 200)
            api_body = relay_response.get("body", relay_response)

            # Send the response back to gws
            response_bytes = json.dumps(api_body).encode("utf-8")
            self.send_response(status)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(response_bytes)))
            self.end_headers()
            self.wfile.write(response_bytes)

        except subprocess.TimeoutExpired:
            self._send_error(504, "Relay timeout")
        except Exception as e:
            log(f"Error: {e}")
            self._send_error(500, str(e))

    def _send_error(self, code, message):
        body = json.dumps({"error": {"code": code, "message": message}}).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format, *args):
        if DEBUG:
            super().log_message(format, *args)


def main():
    if not RELAY_URL:
        print("ERROR: GWS_RELAY_URL environment variable must be set.", file=sys.stderr)
        print("Deploy the Apps Script relay first (see gws-relay-appscript.js)", file=sys.stderr)
        sys.exit(1)

    server = http.server.HTTPServer(("127.0.0.1", PROXY_PORT), GWSProxyHandler)
    print(f"gws-proxy listening on http://127.0.0.1:{PROXY_PORT}", file=sys.stderr)
    print(f"Relay URL: {RELAY_URL}", file=sys.stderr)

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down.", file=sys.stderr)
        server.server_close()


if __name__ == "__main__":
    main()
