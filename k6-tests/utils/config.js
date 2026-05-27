export const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';
export const AUTH_EMAIL = __ENV.AUTH_EMAIL || __ENV.TEST_USER_EMAIL || 'admin@system.com';
export const AUTH_PASSWORD = __ENV.AUTH_PASSWORD || __ENV.TEST_USER_PASSWORD || 'Admin123!';
export const ROUTE_ID = __ENV.ROUTE_ID || __ENV.PUBLIC_ROUTE_ID || '0a801ecc-30f0-48aa-bb31-3a8fb45e88f9';
export const TEST_USER_ROLE = __ENV.TEST_USER_ROLE || 'Admin';
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json'
};
