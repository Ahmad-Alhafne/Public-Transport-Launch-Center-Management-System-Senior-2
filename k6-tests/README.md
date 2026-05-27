# k6 Test Scenarios

This folder contains reusable k6 scenarios for the Departure Center System.

## What is included

- `scenarios/smoke.js` - quick sanity check with a few VUs
- `scenarios/load.js` - a moderate load test with sustained traffic
- `scenarios/spike.js` - a sudden surge into a high-load period
- `scenarios/stress.js` - long-running stress test to push capacity

## Requirements

- `k6` installed locally
- the system started with `docker compose up --build`
- gateway available at `http://localhost:5000` (default)

## How to run

From the project root:

```bash
cd k6-tests
k6 run scenarios/smoke.js
```

For other tests:

```bash
k6 run scenarios/load.js
k6 run scenarios/spike.js
k6 run scenarios/stress.js
```

## Environment variables

You should set these variables before running tests:

- `BASE_URL` - default is `http://localhost:5000`
- `AUTH_EMAIL` or `TEST_USER_EMAIL` (default `admin@system.com`)
- `AUTH_PASSWORD` or `TEST_USER_PASSWORD` (default `Admin123!`)
- `ROUTE_ID` - optional; if empty the script will fetch the first route from `GET /api/route`

Example:

```bash
set BASE_URL=http://localhost:5000
set AUTH_EMAIL=admin@system.com
set AUTH_PASSWORD=Admin123!
k6 run scenarios/load.js
```

## Notes

- The scripts log in first, then request route details using the provided `ROUTE_ID`.
- Adjust thresholds, VU counts, and stage timings in the scenario files to match your environment.

## Smoke Test Summary

The smoke test that was executed is `scenarios/smoke.js`.

What it does:
- logs in using the seeded admin user
- requests a route record via `GET /api/route/{id}`
- validates successful authentication and route response

Test configuration:
- 5 virtual users
- 30 seconds runtime
- `http_req_failed` threshold: `rate<0.05`
- `http_req_duration` threshold: `p(95)<3000`

Result from the run:
- all checks passed: `100.00%`
- no failed HTTP requests: `0.00%`
- `http_req_duration` p95: `1s`
- total completed iterations: `60`

This confirms the smoke scenario is stable for the current local deployment and the gateway API is reachable with the seeded admin credentials.

## Spike Test Summary

The spike test that was executed is `scenarios/spike.js`.

What it does:
- logs in once during setup using the seeded admin user
- ramps from 5 VUs to 120 VUs quickly
- sustains 120 VUs for 2 minutes before ramping back down
- requests route details via `GET /api/route/{id}` at high concurrency

Test configuration:
- spike stages: 5 → 120 → 120 → 5 → 0
- total runtime: 4 minutes
- `http_req_failed` threshold: `rate<0.10`
- `http_req_duration` threshold: `p(95)<20000`

Result from the run:
- checks passed: `99.72%`
- failed HTTP requests: `0.27%`
- `http_req_duration` p95: `10.41s`
- total completed iterations: `5901`

This confirms the spike scenario can exercise the API under a rapid high-concurrency load, while remaining within the adjusted response-time threshold.

## Load Test Summary

The load test that was executed is `scenarios/load.js`.

What it does:
- logs in once during setup using the seeded admin user
- ramps from 20 VUs to 50 VUs and holds the load for 3 minutes
- then ramps down to 10 VUs
- requests route details via `GET /api/route/{id}` under sustained traffic

Test configuration:
- staged load: 20 → 50 → 10
- total runtime: 5 minutes
- `http_req_failed` threshold: `rate<0.05`
- `http_req_duration` threshold: `p(95)<5000`

Result from the run:
- checks passed: `99.97%`
- failed HTTP requests: `0.02%`
- `http_req_duration` p95: `32.44ms`
- total completed iterations: `8530`

This confirms the load scenario is stable for sustained traffic with the current local deployment and shared setup token.

## Stress Test Summary

The stress test that was executed is `scenarios/stress.js`.

What it does:
- logs in once during setup using the seeded admin user
- ramps from 30 VUs to 150 VUs over several minutes
- holds high traffic for a short period and then ramps to zero
- requests route details via `GET /api/route/{id}` under stress load

Test configuration:
- staged load: 30 → 100 → 150 → 0
- total runtime: 11 minutes
- `http_req_failed` threshold: `rate<0.10`
- `http_req_duration` threshold: `p(95)<20000`

Result from the run:
- checks passed: `99.89%`
- failed HTTP requests: `0.10%`
- `http_req_duration` p95: `94.76ms`
- total completed iterations: `40921`

This confirms the stress scenario can sustain the current system under high concurrency with an adjusted response-time threshold.
