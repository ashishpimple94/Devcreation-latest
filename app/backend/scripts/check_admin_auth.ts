import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const uri = process.env.MONGODB_URI || '';

async function run() {
  await mongoose.connect(uri);
  const admins = await mongoose.connection.collection('users').find({ role: { $in: ['super_admin', 'admin', 'manager'] } }).toArray();
  console.log('Found staff accounts:');
  for (const a of admins) {
    const isDefaultPass = await bcrypt.compare('Admin@12345', a.password || '');
    const isDevcreationPass = await bcrypt.compare('Devcreation@890*', a.password || '');
    console.log(`- Email: ${a.email}, Name: ${a.name}, Role: ${a.role}, Has Admin@12345: ${isDefaultPass}, Has Devcreation@890*: ${isDevcreationPass}`);
  }
  await mongoose.disconnect();
}

run();
