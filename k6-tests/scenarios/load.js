import { sleep } from 'k6';
import { login, getFirstRouteId, getRouteById } from '../utils/helper.js';
import { ROUTE_ID } from '../utils/config.js';

export const options = {
  stages: [
    { duration: '1m', target: 20 },
    { duration: '3m', target: 50 },
    { duration: '1m', target: 10 },
  ],
  thresholds: {
    'http_req_failed': ['rate<0.05'],
    'http_req_duration': ['p(95)<5000'],
  },
};

export function setup() {
  const token = login();
  if (!token) {
    return { token: null, routeId: null };
  }

  const routeId = ROUTE_ID || getFirstRouteId(token);
  return { token, routeId };
}

export default function (data) {
  if (!data.token || !data.routeId) {
    return;
  }

  getRouteById(data.routeId, data.token);
  sleep(1);
}
