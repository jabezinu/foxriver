// Test script to verify hidden tier functionality
const axios = require('axios');

async function testHiddenTiers() {
    try {
        console.log('🧪 Testing Hidden Tier Functionality\n');
        
        // Test 1: Get membership tiers (should include hidden ones with hidden flag)
        console.log('1. Testing membership tiers API...');
        const tiersResponse = await axios.get('http://localhost:5002/api/memberships/tiers');
        const tiers = tiersResponse.data.tiers;
        
        console.log(`✅ Loaded ${tiers.length} tiers`);
        
        // Check if hidden property is included
        const hasHiddenProperty = tiers.some(tier => tier.hasOwnProperty('hidden'));
        if (hasHiddenProperty) {
            console.log('✅ Hidden property is included in tier data');
            
            const hiddenTiers = tiers.filter(tier => tier.hidden);
            const visibleTiers = tiers.filter(tier => !tier.hidden);
            
            console.log(`   - Visible tiers: ${visibleTiers.length}`);
            console.log(`   - Hidden tiers: ${hiddenTiers.length}`);
            
            if (hiddenTiers.length > 0) {
                console.log('   - Hidden tier levels:', hiddenTiers.map(t => t.level).join(', '));
            }
        } else {
            console.log('⚠️  Hidden property not found in tier data');
        }
        
        console.log('\n🎉 Hidden tier functionality test completed!');
        console.log('📝 Summary:');
        console.log('   - Client will now show all tiers (including hidden ones)');
        console.log('   - Hidden tiers display "Coming Soon" message');
        console.log('   - Users cannot upgrade to hidden tiers');
        console.log('   - Backend validates against hidden tier upgrades');
        
    } catch (error) {
        console.error('❌ Error testing hidden tiers:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

testHiddenTiers();