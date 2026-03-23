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

## Authentication Status: FAIL

### Symptom

All `gws` commands fail with:

```
error[discovery]: Failed to fetch Discovery Document for <service>: HTTP 403 Forbidden
```

### Root Cause

The `NO_PROXY` / `no_proxy` environment variables include `*.googleapis.com` and `*.google.com`. This causes `gws` HTTP requests to bypass the container's egress proxy and attempt direct network access, which is blocked by the environment's firewall (returns 403).

### Available Services (per gws help)

drive, sheets, gmail, calendar, admin-reports, reports, docs, slides, tasks, people, chat, classroom, forms, keep, meet, events, modelarmor, workflow, wf

### Recommended Fix

Remove `*.googleapis.com` and `*.google.com` from the `NO_PROXY` and `no_proxy` environment variables at the container/deployment configuration level so that Google API traffic routes through the authorized egress proxy.
