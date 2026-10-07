/**
 * Dev Creation Backend — Root Entrypoint
 * Convenient entrypoint for Hostinger hPanel Node.js Application Manager, PM2, or Passenger.
 *
 * Make sure to run `npm run build` before starting this script.
 */

try {
  require('./dist/server.js');
} catch (err) {
  if (err.code === 'MODULE_NOT_FOUND') {
    console.error('❌ dist/server.js not found!');
    console.error('👉 Please run `npm run build` first to compile the TypeScript project into dist/.');
    process.exit(1);
  }
  throw err;
}
