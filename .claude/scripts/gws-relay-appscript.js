/**
 * Google Apps Script — Workspace API Relay
 *
 * Deploy this as a web app in Google Apps Script to relay Google Workspace
 * API calls from environments where direct API access is blocked (e.g.,
 * Claude Code sandboxes behind TLS-inspecting egress proxies).
 *
 * Deployment steps:
 *   1. Go to https://script.google.com → New Project
 *   2. Replace Code.gs contents with this file
 *   3. Click Deploy → New deployment → Web app
 *      - Execute as: Me
 *      - Who has access: Anyone (or Anyone with Google account)
 *   4. Copy the deployment URL (https://script.google.com/macros/s/.../exec)
 *   5. Set GWS_RELAY_URL=<url> in your Claude Code environment variables
 *
 * Usage from the sandbox:
 *   curl "$GWS_RELAY_URL?service=drive&version=v3&resource=files&method=list&pageSize=1"
 */

/* ---------- helpers ---------- */

/** Return a JSON response with the given status and body. */
function jsonResponse(body, statusCode) {
  return ContentService.createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Build the full API URL from the request parameters. */
function buildApiUrl(params) {
  var service   = params.service   || 'drive';
  var version   = params.version   || 'v3';
  var resource  = params.resource  || '';
  var sub       = params.sub       || '';
  var method    = params.method    || 'list';
  var apiPath   = params.apiPath   || '';

  // If a full apiPath is provided, use it directly.
  if (apiPath) {
    return 'https://www.googleapis.com/' + apiPath;
  }

  // Build from structured params.
  var base = 'https://www.googleapis.com/' + service + '/' + version;
  if (resource) base += '/' + resource;
  if (sub)      base += '/' + sub;
  return base;
}

/** Extract query parameters that should be forwarded to the Google API. */
function extractApiParams(params) {
  var reserved = ['service', 'version', 'resource', 'sub', 'method', 'apiPath', 'httpMethod', 'body'];
  var apiParams = {};
  for (var key in params) {
    if (reserved.indexOf(key) === -1) {
      apiParams[key] = params[key];
    }
  }
  return apiParams;
}

/* ---------- main handlers ---------- */

function doGet(e) {
  return handleRequest(e, 'GET');
}

function doPost(e) {
  return handleRequest(e, 'POST');
}

function handleRequest(e, defaultMethod) {
  try {
    var params     = e.parameter || {};
    var httpMethod = (params.httpMethod || defaultMethod).toUpperCase();
    var url        = buildApiUrl(params);
    var apiParams  = extractApiParams(params);

    // Append API query parameters.
    var qs = [];
    for (var k in apiParams) {
      qs.push(encodeURIComponent(k) + '=' + encodeURIComponent(apiParams[k]));
    }
    if (qs.length > 0) url += '?' + qs.join('&');

    var token = ScriptApp.getOAuthToken();
    var options = {
      method: httpMethod,
      headers: { 'Authorization': 'Bearer ' + token },
      muteHttpExceptions: true
    };

    // Forward POST body if present.
    if (httpMethod !== 'GET' && e.postData && e.postData.contents) {
      options.payload     = e.postData.contents;
      options.contentType = e.postData.type || 'application/json';
    }

    var response = UrlFetchApp.fetch(url, options);

    return jsonResponse({
      status:  response.getResponseCode(),
      headers: response.getHeaders(),
      body:    JSON.parse(response.getContentText())
    });

  } catch (err) {
    return jsonResponse({ error: err.message }, 500);
  }
}

/*
 * Scopes required — these are automatically granted when the script owner
 * authorizes the web app.  Listing them here ensures the OAuth consent
 * screen requests the right permissions.
 *
 * @OnlyCurrentDoc  (remove this line to access any document)
 */

// Force Drive scope so ScriptApp.getOAuthToken() includes it.
function _driveScope() { DriveApp.getRootFolder(); }
