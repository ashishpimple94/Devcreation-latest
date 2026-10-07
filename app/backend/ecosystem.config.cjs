/**
 * Dev Creation Backend — PM2 Production Ecosystem Configuration
 * Usage:
 *   pm2 start ecosystem.config.cjs
 *   pm2 restart devcreation-backend
 *   pm2 logs devcreation-backend
 *   pm2 save
 */

module.exports = {
  apps: [
    {
      name: 'devcreation-backend',
      script: './dist/server.js',
      instances: 1, // Single instance for Socket.IO stability without requiring Redis cluster
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 4000,
      },
    },
  ],
};
