# GWS Tool Verification Report — 2026-03-23

## Installation Status: PASS

| Check              | Result                              |
|--------------------|-------------------------------------|
| Binary location    | `/usr/local/bin/gws`                |
| Version            | `0.18.1`                            |
| Config directory   | `~/.config/gws/` (exists)           |
| Credentials file   | `~/.config/gws/credentials.json`    |
| GWS_CREDENTIALS    | Set via environment variable        |
| Credential type    | `authorized_user` (OAuth)           |

## Authentication Status: PARTIAL (OAuth works, API calls blocked)

### OAuth Token Refresh: PASS

Token refresh via `oauth2.googleapis.com` succeeds. Granted scopes:

- `https://www.googleapis.com/auth/drive`
- `https://www.googleapis.com/auth/gmail.modify`
- `https://www.googleapis.com/auth/calendar`
- `https://www.googleapis.com/auth/spreadsheets`
- `https://www.googleapis.com/auth/documents`
- `https://www.googleapis.com/auth/presentations`
- `https://www.googleapis.com/auth/tasks`
- `https://www.googleapis.com/auth/cloud-platform`

### API Calls: FAIL

All `gws` commands fail with:

```
error[discovery]: Failed to fetch Discovery Document for <service>: HTTP 403/404
```

Direct API calls with a valid Bearer token also return 403.

### Network Reachability

| Domain                      | Status | Notes                        |
|-----------------------------|--------|------------------------------|
| `oauth2.googleapis.com`     | OK     | Token refresh works (400/200)|
| `www.googleapis.com`        | 403    | Blocked — Discovery + APIs   |
| `sheets.googleapis.com`     | 403    | Blocked                      |
| `gmail.googleapis.com`      | 403    | Blocked                      |
| `content.googleapis.com`    | 403    | Blocked                      |

### Root Cause

The container's egress proxy allowlists `oauth2.googleapis.com` but blocks the actual Google API endpoints (`www.googleapis.com`, `sheets.googleapis.com`, `gmail.googleapis.com`, etc.). Both direct and proxy-routed requests return 403, confirming this is an **infrastructure-level network restriction**, not a credential or proxy-bypass issue.

### Available Services (per gws help)

drive, sheets, gmail, calendar, admin-reports, reports, docs, slides, tasks, people, chat, classroom, forms, keep, meet, events, modelarmor, workflow, wf

### Recommended Fix

Add the following domains to the egress proxy's allowlist:

- `www.googleapis.com` (Discovery Documents + legacy API endpoints)
- `*.googleapis.com` (service-specific endpoints like sheets, gmail, etc.)
- `*.google.com` (optional, for additional Google services)
