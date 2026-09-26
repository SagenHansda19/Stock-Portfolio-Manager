import http from 'k6/http';
import { check } from 'k6';
import exec from 'k6/execution'; // Import the new execution module

export const options = {
    vus: 10,
    duration: '5s',
};

// Keep your 10 actual JWTs here
const TOKENS = [
    'JWT_USER_1',
    'JWT_USER_2',
    'JWT_USER_3',
    'JWT_USER_4',
    'JWT_USER_5',
    'JWT_USER_6',
    'JWT_USER_7',
    'JWT_USER_8',
    'JWT_USER_9',
    'JWT_USER_10',
];

export default function () {
    // Fetch the Virtual User ID safely
    const vuId = exec.vu.idInTest;
    const token = TOKENS[(vuId - 1) % TOKENS.length];

    const params = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    const res = http.get('http://localhost:8080/api/portfolio/analyze', params);

    check(res, {
        'status is 200': (r) => r.status === 200,
    });
}