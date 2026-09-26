import http from 'k6/http';
import { check } from 'k6';

export const options = {
    vus: 100,
    duration: '10s',
};

const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzYWdlbkBleGFtcGxlLmNvbSIsImlhdCI6MTc5MDQwNDM1MCwiZXhwIjoxNzkwNDkwNzUwfQ.ZOUVw8f96iMA5FpbFaHnLs321_Qztwt7IFpckJo72DA';

export default function () {
    const params = {
        headers: {
            'Authorization': `Bearer ${JWT_TOKEN}`,
        },
    };

    const res = http.get('http://localhost:8080/api/portfolio/analyze', params);

    check(res, {
        'status is 200': (r) => r.status === 200,
    });
}