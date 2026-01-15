const { WealthFund } = require('./models');
const { sequelize } = require('./config/database');

async function checkFunds() {
    try {
        await sequelize.authenticate();
        console.log('Database connected successfully\n');
        
        const funds = await WealthFund.findAll();
        console.log(`Total wealth funds in database: ${funds.length}\n`);
        
        if (funds.length === 0) {
            console.log('❌ NO WEALTH FUNDS FOUND IN DATABASE');
            console.log('This is why nothing shows on the client side!\n');
            console.log('Solution: Create wealth funds in the admin panel first.');
        } else {
            console.log('Wealth Funds Details:');
            console.log('='.repeat(80));
            funds.forEach(fund => {
                console.log(`\nID: ${fund.id}`);
                console.log(`Name: ${fund.name}`);
                console.log(`Active: ${fund.isActive ? '✅ YES' : '❌ NO'}`);
                console.log(`Image: ${fund.image}`);
                console.log(`Days: ${fund.days}`);
                console.log(`Daily Profit: ${fund.dailyProfit} (${fund.profitType})`);
                console.log(`Min Deposit: ${fund.minimumDeposit}`);
                console.log('-'.repeat(80));
            });
            
            const activeFunds = funds.filter(f => f.isActive);
            console.log(`\n✅ Active funds (visible to users): ${activeFunds.length}`);
            console.log(`❌ Inactive funds (hidden from users): ${funds.length - activeFunds.length}`);
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkFunds();
