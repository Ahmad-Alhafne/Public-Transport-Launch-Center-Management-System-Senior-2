import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, AUTH_EMAIL, AUTH_PASSWORD, ROUTE_ID, DEFAULT_HEADERS } from './config.js';

export function login() {
  const loginUrl = `${BASE_URL}/api/auth/login`;
  const payload = JSON.stringify({
    email: AUTH_EMAIL,
    password: AUTH_PASSWORD,
  });

  const res = http.post(loginUrl, payload, { headers: DEFAULT_HEADERS });

  check(res, {
    'login succeeded': (r) => r.status === 200,
    'received token': (r) => r.json('token') !== undefined && r.json('token') !== null,
  });

  if (res.status !== 200) {
    return null;
  }

  return `Bearer ${res.json('token')}`;
}

export function getRouteById(routeId, authHeader = null) {
  const url = `${BASE_URL}/api/route/${routeId}`;
  const headers = { ...DEFAULT_HEADERS };

  if (authHeader) {
    headers.Authorization = authHeader;
  }

  const res = http.get(url, { headers });

  check(res, {
    'route status 200': (r) => r.status === 200,
    'route has id': (r) => r.json('id') !== undefined,
  });

  return res;
}

export function getFirstRouteId(authHeader) {
  const url = `${BASE_URL}/api/route`;
  const headers = {
    ...DEFAULT_HEADERS,
    Authorization: authHeader,
  };

  const res = http.get(url, { headers });

  check(res, {
    'route list status 200': (r) => r.status === 200,
    'route list is array': (r) => Array.isArray(r.json()),
  });

  if (res.status !== 200) {
    return null;
  }

  const routes = res.json();
  return Array.isArray(routes) && routes.length > 0 ? routes[0].id : null;
}

export function smokeFlow() {
  const token = login();
  if (!token) {
    return;
  }

  const routeId = ROUTE_ID || getFirstRouteId(token);
  if (!routeId) {
    return;
  }

  getRouteById(routeId, token);
  sleep(1);
}
