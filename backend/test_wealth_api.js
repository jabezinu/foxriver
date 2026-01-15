const axios = require('axios');

async function testWealthAPI() {
    try {
        console.log('Testing Wealth API endpoint...\n');
        
        // You'll need to replace this with a valid token
        const token = process.argv[2];
        
        if (!token) {
            console.log('❌ No token provided');
            console.log('Usage: node test_wealth_api.js YOUR_TOKEN');
            console.log('\nTo get a token:');
            console.log('1. Login to the client app');
            console.log('2. Open browser console');
            console.log('3. Run: localStorage.getItem("foxriver_token")');
            console.log('4. Copy the token and run this script again\n');
            process.exit(1);
        }
        
        const response = await axios.get('http://localhost:5002/api/wealth/funds', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('✅ API Response Status:', response.status);
        console.log('✅ Success:', response.data.success);
        console.log('✅ Funds returned:', response.data.data.length);
        console.log('\nFunds data:');
        console.log(JSON.stringify(response.data.data, null, 2));
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        if (error.response?.status === 401) {
            console.log('\n⚠️  Token is invalid or expired. Please get a new token.');
        }
    }
}

testWealthAPI();
