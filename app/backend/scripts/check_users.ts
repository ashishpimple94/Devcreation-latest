import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const uri = process.env.MONGODB_URI || '';

async function run() {
  await mongoose.connect(uri);
  const users = await mongoose.connection.collection('users').find({}, { projection: { name: 1, email: 1, role: 1, phone: 1, isActive: 1 } }).toArray();
  console.log('Total users in DB:', users.length);
  console.log(JSON.stringify(users, null, 2));
  await mongoose.disconnect();
}

run();
