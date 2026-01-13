require('dotenv').config();
const mongoose = require('mongoose');
const Task = require('./models/Task');

async function testAutoGeneration() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        console.log('🧪 TESTING AUTO-GENERATION\n');
        console.log('This simulates what happens when users visit the Tasks page\n');
        console.log('═══════════════════════════════════════════════════════\n');

        // Delete today's manual tasks to force auto-generation
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const deletedCount = await Task.deleteMany({
            createdAt: { $gte: today, $lt: tomorrow }
        });

        console.log(`🗑️  Deleted ${deletedCount.deletedCount} manual task(s) from today`);
        console.log('   (This forces the system to auto-generate from Video Pool)\n');

        console.log('📝 Now when a user visits the Tasks page:');
        console.log('   1. System checks for manual tasks → finds none');
        console.log('   2. System queries Video Pool for available videos');
        console.log('   3. System randomly selects 4 videos');
        console.log('   4. System creates 4 Task records automatically');
        console.log('   5. User sees 4 tasks\n');

        console.log('✅ Test setup complete!\n');
        console.log('📱 NEXT STEP: Visit the client Tasks page');
        console.log('   → The system will auto-generate 4 tasks from the Video Pool\n');

        await mongoose.connection.close();
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

testAutoGeneration();
