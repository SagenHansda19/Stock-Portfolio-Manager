import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    // Ramp up 50 concurrent virtual users over 5s, hold for 10s, ramp down
    stages: [
        { duration: '5s', target: 50 },
        { duration: '10s', target: 50 },
        { duration: '3s', target: 0 },
    ],
    thresholds: {
        // We expect requests to finish under 500ms on local machine
        http_req_duration: ['p(95)<500'],
    },
};

const BASE_URL = 'http://localhost:8080';
const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzYWdlbkBleGFtcGxlLmNvbSIsImlhdCI6MTc5MDQwNDM1MCwiZXhwIjoxNzkwNDkwNzUwfQ.ZOUVw8f96iMA5FpbFaHnLs321_Qztwt7IFpckJo72DA';

export default function () {
    const payload = JSON.stringify({
        ticker: 'AAPL',
        quantity: 1,
        action: 'BUY',
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${JWT_TOKEN}`,
        },
    };

    const res = http.post(`${BASE_URL}/api/trade`, payload, params);

    // Status 200: Successful trade execution
    // Status 409: Optimistic locking version collision (proves @Version works!)
    check(res, {
        'status is 200 or 409': (r) => r.status === 200 || r.status === 409,
        'handled gracefully (no 500)': (r) => r.status !== 500,
    });

    sleep(0.05); // Tiny sleep between concurrent user actions
}