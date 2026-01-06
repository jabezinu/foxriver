const axios = require('axios');

const API_URL = 'http://localhost:5002/api';

async function verify() {
    console.log('--- Verifying Bank API ---');
    try {
        const res = await axios.get(`${API_URL}/bank`);
        console.log('GET /api/bank success:', res.data.success);
        console.log('Bank Count:', res.data.count);
    } catch (error) {
        console.error('GET /api/bank failed:', error.message);
    }
}

verify();
