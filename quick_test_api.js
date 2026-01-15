// Quick test to see what the API returns without authentication
const axios = require('axios');

async function quickTest() {
    console.log('Testing Wealth API...\n');
    
    try {
        // Test without auth to see the error
        const response = await axios.get('http://localhost:5002/api/wealth/funds');
        console.log('Response:', response.data);
    } catch (error) {
        if (error.response?.status === 401) {
            console.log('✅ API is working (requires authentication)');
            console.log('Status:', error.response.status);
            console.log('Message:', error.response.data.message);
            console.log('\n📝 This is expected - the endpoint requires a valid user token.');
            console.log('The client should work once you:');
            console.log('1. Restart the client dev server');
            console.log('2. Login to get a valid token');
            console.log('3. Navigate to /wealth page');
        } else {
            console.log('❌ Unexpected error:', error.message);
        }
    }
}

quickTest();
