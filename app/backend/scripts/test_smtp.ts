import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const host = process.env.SMTP_HOST || 'smtp.hostinger.com';
const user = process.env.SMTP_USER || 'support@devcreation24.in';
const pass = process.env.SMTP_PASS || 'Devcreation@890*';

console.log('Testing SMTP credentials:');
console.log('Host:', host);
console.log('User:', user);
console.log('Pass length:', pass ? pass.length : 0);

async function test() {
  console.log('\n--- Testing Port 465 SSL ---');
  const t465 = nodemailer.createTransport({
    host,
    port: 465,
    secure: true,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  try {
    await t465.verify();
    console.log('SUCCESS: Port 465 verified!');
  } catch (err: any) {
    console.error('FAILED 465:', err.message, err.code, err.response);
  }

  console.log('\n--- Testing Port 587 STARTTLS ---');
  const t587 = nodemailer.createTransport({
    host,
    port: 587,
    secure: false,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  try {
    await t587.verify();
    console.log('SUCCESS: Port 587 verified!');
  } catch (err: any) {
    console.error('FAILED 587:', err.message, err.code, err.response);
  }
}

test();
