import { sleep } from 'k6';
import { smokeFlow } from '../utils/helper.js';

export const options = {
  vus: 5,
  duration: '30s',
  thresholds: {
    'http_req_failed': ['rate<0.05'],
    'http_req_duration': ['p(95)<3000'],
  },
};

export default function () {
  smokeFlow();
  sleep(1);
}
