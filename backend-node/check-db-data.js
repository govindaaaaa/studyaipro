import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Session from './models/Session.js';

dotenv.config();

async function checkData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('✅ Connected!\n');

    // Check users
    const users = await User.find({}).select('email name createdAt');
    console.log('=== USERS ===');
    console.log('Total users:', users.length);
    users.forEach(u => {
      console.log(`- ${u.email} (${u.name}) - ID: ${u._id}`);
    });

    // Check sessions
    console.log('\n=== DOCUMENTS/SESSIONS ===');
    const sessions = await Session.find({}).populate('user_id', 'email');
    console.log('Total documents:', sessions.length);
    sessions.forEach(s => {
      console.log(`- ${s.filename} (${s.session_id.substring(0, 8)}...)`);
      console.log(`  Owner: ${s.user_id?.email || 'Unknown'}`);
      console.log(`  Created: ${s.created_at}`);
    });

    if (sessions.length === 0) {
      console.log('\n⚠️ NO DOCUMENTS IN DATABASE!');
      console.log('This means all uploads were lost or never saved.');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkData();
