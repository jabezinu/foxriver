require('dotenv').config();
const mongoose = require('mongoose');
const VideoPool = require('./models/VideoPool');
const Task = require('./models/Task');
const Playlist = require('./models/Playlist');

async function quickFix() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        console.log('🔧 QUICK FIX: Creating sample playlist and videos...\n');

        // Check if playlist already exists
        let playlist = await Playlist.findOne({ title: 'Sample Playlist' });
        
        if (!playlist) {
            // Create a sample playlist
            playlist = await Playlist.create({
                url: 'https://www.youtube.com/playlist?list=PLsample123',
                title: 'Sample Playlist',
                status: 'active'
            });
            console.log('✅ Created sample playlist\n');
        } else {
            console.log('ℹ️  Sample playlist already exists\n');
        }

        // Check if videos exist
        const existingVideos = await VideoPool.countDocuments();
        
        if (existingVideos === 0) {
            // Create sample videos
            const sampleVideos = [
                {
                    videoId: 'dQw4w9WgXcQ',
                    title: 'Sample Video 1 - Introduction',
                    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                    playlist: playlist._id
                },
                {
                    videoId: 'jNQXAC9IVRw',
                    title: 'Sample Video 2 - Tutorial',
                    videoUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
                    playlist: playlist._id
                },
                {
                    videoId: 'kJQP7kiw5Fk',
                    title: 'Sample Video 3 - Advanced Tips',
                    videoUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
                    playlist: playlist._id
                },
                {
                    videoId: '9bZkp7q19f0',
                    title: 'Sample Video 4 - Best Practices',
                    videoUrl: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
                    playlist: playlist._id
                },
                {
                    videoId: 'L_jWHffIx5E',
                    title: 'Sample Video 5 - Expert Guide',
                    videoUrl: 'https://www.youtube.com/watch?v=L_jWHffIx5E',
                    playlist: playlist._id
                },
                {
                    videoId: 'fJ9rUzIMcZQ',
                    title: 'Sample Video 6 - Pro Techniques',
                    videoUrl: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
                    playlist: playlist._id
                }
            ];

            await VideoPool.insertMany(sampleVideos);
            console.log(`✅ Created ${sampleVideos.length} sample videos in the pool\n`);
        } else {
            console.log(`ℹ️  Video pool already has ${existingVideos} videos\n`);
        }

        // Verify
        const playlists = await Playlist.countDocuments();
        const videos = await VideoPool.countDocuments();
        
        console.log('═══════════════════════════════════════════════════════');
        console.log('                  VERIFICATION                         ');
        console.log('═══════════════════════════════════════════════════════\n');
        console.log(`   ✅ Playlists: ${playlists}`);
        console.log(`   ✅ Video Pool: ${videos} videos\n`);
        
        console.log('🎉 Quick fix complete!\n');
        console.log('📝 NEXT STEPS:\n');
        console.log('   1. Restart your backend server (if running)');
        console.log('   2. Visit the client Tasks page');
        console.log('   3. You should now see 4 tasks auto-generated\n');
        console.log('   OR\n');
        console.log('   1. Go to Admin Panel → Tasks → Auto-Rotation Playlists');
        console.log('   2. Add a REAL YouTube playlist URL');
        console.log('   3. Click the Sync button to get real videos\n');

        await mongoose.connection.close();
        console.log('✅ Done!\n');
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

quickFix();
