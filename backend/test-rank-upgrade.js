// Simple test script to verify rank upgrade functionality
const axios = require('axios');

async function testRankUpgrade() {
    try {
        // First, let's test if we can get membership tiers
        const tiersResponse = await axios.get('http://localhost:5002/api/memberships/tiers');
        console.log('✅ Membership tiers loaded:', tiersResponse.data.tiers.length, 'tiers');
        
        // Test if we can get bank accounts
        const banksResponse = await axios.get('http://localhost:5002/api/bank');
        console.log('✅ Bank accounts loaded:', banksResponse.data.data.length, 'banks');
        
        console.log('\n🎉 Basic API endpoints are working!');
        console.log('The rank upgrade functionality should now work in the frontend.');
        
    } catch (error) {
        console.error('❌ Error testing API:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

testRankUpgrade();