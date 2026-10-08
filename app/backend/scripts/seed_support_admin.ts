import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const uri = process.env.MONGODB_URI || '';

async function run() {
  await mongoose.connect(uri);
  const usersCol = mongoose.connection.collection('users');

  const hashedPassword = await bcrypt.hash('Devcreation@890*', 10);

  const existing = await usersCol.findOne({ email: 'support@devcreation24.in' });
  if (existing) {
    await usersCol.updateOne(
      { _id: existing._id },
      { $set: { role: 'super_admin', isActive: true, password: hashedPassword } }
    );
    console.log('Updated existing support@devcreation24.in to super_admin with Devcreation@890*');
  } else {
    await usersCol.insertOne({
      name: 'Dev Creation Admin',
      email: 'support@devcreation24.in',
      password: hashedPassword,
      role: 'super_admin',
      isActive: true,
      wishlist: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('Created new super_admin account for support@devcreation24.in with Devcreation@890*');
  }

  // Also make sure admin@devcreation.com and admin@devcreation.example have known passwords
  const adminComPass = await bcrypt.hash('Admin@12345', 10);
  await usersCol.updateOne({ email: 'admin@devcreation.com' }, { $set: { password: adminComPass, role: 'super_admin', isActive: true } });
  await usersCol.updateOne({ email: 'admin@devcreation.example' }, { $set: { password: adminComPass, role: 'super_admin', isActive: true } });

  console.log('All admin accounts verified and synced in database!');
  await mongoose.disconnect();
}

run();
