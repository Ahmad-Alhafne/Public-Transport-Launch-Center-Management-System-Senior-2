# OWASP ZAP Testing Guide

This document describes how to test the Departure Center System using OWASP ZAP.
It covers local setup, scanning the API gateway, and validating authenticated endpoint behavior.

## Prerequisites

- Docker installed, or OWASP ZAP Desktop installed locally
- The project running locally via Docker Compose
- The API gateway available at `http://localhost:3000`

## Recommended Local Startup

From the project root:

```powershell
docker compose up --build
```

Wait until all backend services are healthy and the gateway is reachable at:

```text
http://localhost:3000
```

## ZAP Scan Approaches

### Option 1: ZAP Desktop (manual scan)

1. Open OWASP ZAP Desktop.
2. Configure your browser to use ZAP as an HTTP proxy.
   - Default ZAP proxy: `localhost:8080`
3. In ZAP, create a new session.
4. Visit the site in your browser through the proxy:
   - `http://localhost:3000`
5. Use the ZAP Spider to crawl the gateway.
   - Right-click the target site in the Sites tree.
   - Choose `Attack > Spider...`.
6. Run an active scan on the discovered URLs.
   - Right-click the target site again.
   - Choose `Attack > Active Scan...`.
7. Review alerts and report findings.

### Option 2: ZAP Docker baseline scan

For a quick automated scan against the gateway, use the ZAP baseline script.
This is useful for a quick health check and basic vulnerability report.

```powershell
docker run --rm -v ${PWD}:/zap/wrk/:rw -t owasp/zap2docker-stable \
  zap-baseline.py -t http://localhost:3000 \
  -r zap_baseline_report.html \
  -j -I
```

- `-t` sets the target URL.
- `-r` writes a local HTML report.
- `-j` enables AJAX spidering.
- `-I` ignores informational alerts.

Open `zap_baseline_report.html` after the scan completes.

### Option 3: ZAP Docker full scan

For a stronger scan, run the full Active Scan.

```powershell
docker run --rm -v ${PWD}:/zap/wrk/:rw -t owasp/zap2docker-stable \
  zap-full-scan.py -t http://localhost:3000 \
  -r zap_full_report.html \
  -j -I
```

## Testing Authenticated API Endpoints

The project exposes an auth API at `http://localhost:3000/api/auth/login`.
To scan authenticated endpoints safely, use a ZAP context and login script.

### Seeded authentication credentials

The local AuthService seeder includes these users:

- admin: `admin@system.com` / `Admin123!`
- driver: `driver@system.com` / `Driver123!`
- citizen: `citizen@system.com` / `Citizen123!`

### Configure a ZAP context

1. In ZAP, open the `Contexts` tab.
2. Create a new context for `localhost`.
3. Include `http://localhost:3000/.*`.
4. Set up authentication using "Script-based Authentication" or "Form-based Authentication".
   - The login endpoint is `http://localhost:3000/api/auth/login`.
   - Request body (JSON):

```json
{
  "email": "admin@system.com",
  "password": "Admin123!"
}
```

5. Add a user for the context and enable the user.
6. Use `Forced User` mode to scan as that authenticated user.

## Recommended API targets

Since the gateway sits in front of all services, scan the gateway URL:

- `http://localhost:3000/api/auth/login`
- `http://localhost:3000/api/route`
- `http://localhost:3000/api/trip`
- `http://localhost:3000/api/booking`
- `http://localhost:3000/api/complaint`
- `http://localhost:3000/api/notification`
- `http://localhost:3000/api/vehicle`
- `http://localhost:3000/api/admin/trips/{id}/details`

## Tips for best results

- Use the gateway hostname `localhost:3000` rather than individual internal service addresses.
- Run ZAP while the full stack is active in Docker Compose.
- If scanning API endpoints, consider disabling heavy JavaScript scans and focus on API paths.
- Save reports as HTML for easy review.

## Troubleshooting

- If ZAP cannot reach `http://localhost:3000`, confirm Docker Compose is running and ports are correct.
- If the login fails, verify the seeded credentials and the gateway auth endpoint.
- For large scans, increase ZAP’s timeout and memory limits if needed.

## Notes

This guide is focused on local security testing only. Do not run ZAP active scans against production systems without proper authorization.
