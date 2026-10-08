import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const host = process.env.SMTP_HOST || 'smtp.hostinger.com';
const user = process.env.SMTP_USER || 'support@devcreation24.in';
const pass = process.env.SMTP_PASS || 'Devcreation@890*';

console.log('Sending test email via Port 465...');
const t465 = nodemailer.createTransport({
  host,
  port: 465,
  secure: true,
  auth: { user, pass },
  tls: { rejectUnauthorized: false },
});

async function run() {
  try {
    const info = await t465.sendMail({
      from: '"Dev Creation" <support@devcreation24.in>',
      to: 'support@devcreation24.in',
      subject: 'Dev Creation SMTP Test Email',
      text: 'This is a test email sent from Dev Creation SMTP verification script.',
    });
    console.log('PORT 465 SEND SUCCESS:', info.messageId, info.response);
  } catch (err: any) {
    console.error('PORT 465 SEND FAILED:', err.message, err.code, err.response);
    
    console.log('\nTrying Port 587 STARTTLS...');
    const t587 = nodemailer.createTransport({
      host,
      port: 587,
      secure: false,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
    });
    try {
      const info2 = await t587.sendMail({
        from: '"Dev Creation" <support@devcreation24.in>',
        to: 'support@devcreation24.in',
        subject: 'Dev Creation SMTP Test Email (587)',
        text: 'This is a test email sent from Dev Creation SMTP 587.',
      });
      console.log('PORT 587 SEND SUCCESS:', info2.messageId, info2.response);
    } catch (err2: any) {
      console.error('PORT 587 SEND FAILED:', err2.message, err2.code, err2.response);
    }
  }
}

run();
