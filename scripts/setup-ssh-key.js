const fs = require('fs');
const path = require('path');

function sanitizeKey() {
  let key = process.env.SSH_PRIVATE_KEY || '';
  key = key.trim();

  if (!key) {
    console.error('❌ ERROR: SSH_PRIVATE_KEY is empty!');
    process.exit(1);
  }

  // Strip wrapping quotes if user pasted with quotes
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1).trim();
  }

  // Handle Base64-encoded keys
  if (!key.includes('BEGIN') && key.length > 50) {
    try {
      const decoded = Buffer.from(key, 'base64').toString('utf-8');
      if (decoded.includes('BEGIN')) {
        console.log('  ✔ Detected Base64-encoded key, successfully decoded.');
        key = decoded.trim();
      }
    } catch (e) {}
  }

  // Replace literal '\n' and '\r\n' (escaped newlines)
  key = key.replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n').replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Check if user accidentally pasted public key
  if (key.startsWith('ssh-rsa') || key.startsWith('ssh-ed25519')) {
    console.error('❌ ERROR: You pasted an SSH PUBLIC KEY instead of a PRIVATE KEY!');
    console.error('An SSH Private Key must begin with "-----BEGIN ... PRIVATE KEY-----".');
    process.exit(1);
  }

  // Handle keys flattened into a single line with spaces
  if (!key.includes('\n') && key.includes('BEGIN') && key.includes('END')) {
    console.log('  ✔ Flattened single-line key detected. Reformatting PEM chunks...');
    const match = key.match(/(-----BEGIN[^-]+-----)(.*?)(-----END[^-]+-----)/);
    if (match) {
      const header = match[1].trim();
      const body = match[2].replace(/\s+/g, '');
      const footer = match[3].trim();
      const chunks = body.match(/.{1,64}/g) || [];
      key = header + '\n' + chunks.join('\n') + '\n' + footer;
    }
  }

  // Ensure trailing newline
  key = key.trim() + '\n';

  const sshDir = path.join(process.env.HOME || '/home/runner', '.ssh');
  if (!fs.existsSync(sshDir)) {
    fs.mkdirSync(sshDir, { recursive: true, mode: 0o700 });
  }

  const keyPath = path.join(sshDir, 'ec2_key');
  fs.writeFileSync(keyPath, key, { mode: 0o600 });
  fs.chmodSync(keyPath, 0o600);

  console.log('  ✔ SSH Private Key successfully formatted and written to:', keyPath);
  console.log('  ✔ Key character count:', key.length, '| Lines:', key.split('\n').length);
}

try {
  sanitizeKey();
} catch (err) {
  console.error('❌ Failed to setup SSH key:', err.message);
  process.exit(1);
}
