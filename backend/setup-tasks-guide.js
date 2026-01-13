require('dotenv').config();
const mongoose = require('mongoose');
const VideoPool = require('./models/VideoPool');
const Task = require('./models/Task');
const Playlist = require('./models/Playlist');

async function setupGuide() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        console.log('═══════════════════════════════════════════════════════');
        console.log('         TASKS SYSTEM SETUP & TROUBLESHOOTING         ');
        console.log('═══════════════════════════════════════════════════════\n');

        // Check current state
        const playlists = await Playlist.find();
        const videos = await VideoPool.find();
        const allTasks = await Task.find({ status: 'active' });
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const todayTasks = await Task.find({
            createdAt: { $gte: today, $lt: tomorrow },
            status: 'active'
        });

        console.log('📊 CURRENT STATUS:\n');
        console.log(`   Playlists Added: ${playlists.length}`);
        console.log(`   Video Pool Size: ${videos.length} videos`);
        console.log(`   All Active Tasks: ${allTasks.length}`);
        console.log(`   Today's Tasks: ${todayTasks.length}\n`);

        // Diagnosis
        console.log('🔍 DIAGNOSIS:\n');
        
        if (playlists.length === 0) {
            console.log('   ❌ PROBLEM: No playlists have been added!');
            console.log('      Without playlists, the system cannot auto-generate tasks.\n');
        } else {
            console.log(`   ✅ ${playlists.length} playlist(s) configured`);
            playlists.forEach(p => {
                console.log(`      - ${p.title} (${p.status})`);
            });
            console.log('');
        }

        if (videos.length === 0) {
            console.log('   ❌ PROBLEM: Video Pool is empty!');
            console.log('      Even if playlists exist, videos need to be synced.\n');
        } else {
            console.log(`   ✅ ${videos.length} video(s) in the pool`);
            console.log('      Sample videos:');
            videos.slice(0, 3).forEach(v => {
                console.log(`      - ${v.title.substring(0, 50)}...`);
            });
            console.log('');
        }

        if (todayTasks.length === 0 && videos.length === 0) {
            console.log('   ❌ PROBLEM: No tasks for today AND no videos to generate from!');
            console.log('      Users will see 0 tasks on the client side.\n');
        } else if (todayTasks.length === 0 && videos.length > 0) {
            console.log('   ⚠️  WARNING: No tasks created today, but videos are available.');
            console.log('      System should auto-generate 4 tasks when users request them.\n');
        } else if (todayTasks.length > 0) {
            console.log(`   ✅ ${todayTasks.length} task(s) available for today`);
            todayTasks.forEach(t => {
                console.log(`      - ${t.title}`);
            });
            console.log('');
        }

        // Solutions
        console.log('═══════════════════════════════════════════════════════');
        console.log('                    SOLUTIONS                          ');
        console.log('═══════════════════════════════════════════════════════\n');

        if (playlists.length === 0 || videos.length === 0) {
            console.log('📝 STEP-BY-STEP FIX:\n');
            console.log('1. Login to Admin Panel');
            console.log('   → Go to: http://localhost:5173/admin\n');
            
            console.log('2. Navigate to Tasks Page');
            console.log('   → Click on "Tasks" in the sidebar\n');
            
            console.log('3. Switch to "Auto-Rotation Playlists" Tab');
            console.log('   → Click the tab at the top of the page\n');
            
            console.log('4. Add a YouTube Playlist');
            console.log('   → Paste a YouTube playlist URL');
            console.log('   → Example: https://www.youtube.com/playlist?list=PLxxxxxx');
            console.log('   → Click "Add to Rotation Pool"\n');
            
            console.log('5. Sync Videos');
            console.log('   → Click the sync/refresh button (circular arrow icon)');
            console.log('   → This will extract all videos from the playlist\n');
            
            console.log('6. Verify');
            console.log('   → Check that "Video Pool Size" shows a number > 0');
            console.log('   → Run this script again to verify\n');
        } else {
            console.log('✅ System is properly configured!\n');
            console.log('   Users should see tasks when they visit the Tasks page.');
            console.log('   If they still don\'t see tasks, check:\n');
            console.log('   1. Is today Sunday? (Tasks are disabled on Sundays)');
            console.log('   2. Are they logged in properly?');
            console.log('   3. Check browser console for API errors\n');
        }

        console.log('═══════════════════════════════════════════════════════');
        console.log('              HOW THE SYSTEM WORKS                     ');
        console.log('═══════════════════════════════════════════════════════\n');
        
        console.log('📌 Task Generation Logic:\n');
        console.log('   1. When a user visits the Tasks page, the system checks:');
        console.log('      → Are there manual tasks created TODAY?');
        console.log('      → If YES: Show those tasks');
        console.log('      → If NO: Generate 4 random tasks from Video Pool\n');
        
        console.log('   2. Auto-Generation Rules:');
        console.log('      → Selects 4 random videos from the pool');
        console.log('      → Avoids videos used yesterday (if possible)');
        console.log('      → Creates Task records automatically');
        console.log('      → Marks videos as "lastUsed: today"\n');
        
        console.log('   3. Daily Reset:');
        console.log('      → Tasks reset at midnight (00:00)');
        console.log('      → New tasks are generated on first user request');
        console.log('      → No tasks on Sundays (rest day)\n');

        console.log('═══════════════════════════════════════════════════════\n');

        await mongoose.connection.close();
        console.log('✅ Analysis complete!\n');
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

setupGuide();
