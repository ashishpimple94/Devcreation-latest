# Hostinger Backend Deployment Guide

This guide explains how to deploy the **Dev Creation Backend API** on Hostinger.

---

## 🚀 Option 1: Hostinger VPS with Docker Compose (Recommended - Fastest)

If you have a **Hostinger VPS (Ubuntu 22.04 / 24.04)**, Docker Compose provides an isolated, reliable setup with Redis and automatic restarts.

### 1. Connect to your Hostinger VPS via SSH
```bash
ssh root@YOUR_SERVER_IP
```

### 2. Install Docker & Docker Compose (if not already installed)
```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

### 3. Clone the Backend Repository
```bash
git clone https://github.com/ashishpimple94/Devcreation-Backend.git backend
cd backend
```

### 4. Create your Production `.env`
```bash
cp .env.production.example .env
nano .env
```
*Update `CORS_ORIGIN`, `PUBLIC_ASSET_BASE`, and `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`.*

### 5. Start the Services
```bash
docker compose up -d --build
```

### 6. Run the Database Seed (Create Admin & Default Products)
```bash
docker compose exec backend npm run seed:prod
```

### 7. Verify Healthcheck
```bash
curl http://localhost:4000/api/health
```
You should receive: `{"success":true,"message":"OK","data":{"uptime":...}}`.

---

## ⚡ Option 2: Hostinger VPS with Node.js & PM2 (Standard Linux)

### 1. Install Node.js 20 & PM2
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git
sudo npm install -g pm2
```

### 2. Clone and Install Dependencies
```bash
git clone https://github.com/ashishpimple94/Devcreation-Backend.git backend
cd backend
npm install
```

### 3. Build the Application
```bash
npm run build
```

### 4. Setup `.env`
```bash
cp .env.production.example .env
nano .env
```

### 5. Seed the Database
```bash
npm run seed:prod
```

### 6. Start with PM2 Process Manager
```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```
*(Copy and run the `pm2 startup` command output if prompted).*

### 7. Configure Nginx Reverse Proxy & SSL
Copy the provided [nginx.conf.example](nginx.conf.example):
```bash
sudo apt install -y nginx certbot python3-certbot-nginx
sudo cp nginx.conf.example /etc/nginx/sites-available/backend.conf
sudo nano /etc/nginx/sites-available/backend.conf # Replace server_name with your domain
sudo ln -s /etc/nginx/sites-available/backend.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d api.yourdomain.com
```

---

## 🌐 Option 3: Hostinger Cloud / Web Hosting (hPanel Node.js App)

If using Hostinger Web/Cloud hosting with the **Node.js Application Manager** in hPanel:

1. In **Hostinger hPanel**, go to **Websites** → **Manage** → search for **Node.js**.
2. Click **Create Application**:
   - **Node.js version**: Choose `20.x` (or `18.x`+)
   - **Application mode**: `Production`
   - **Application root**: `backend` (or your subdomain directory)
   - **Application startup file**: `server.js` or `dist/server.js`
3. Upload or clone the repository into that directory:
   ```bash
   git clone https://github.com/ashishpimple94/Devcreation-Backend.git .
   ```
4. Create `.env` file in the application directory with your values.
5. In the hPanel terminal or SSH:
   ```bash
   npm install
   npm run build
   npm run seed:prod
   ```
6. Click **Restart Application** in hPanel.

---

## 🔑 Crucial Environment Variables Summary

| Variable | Description | Example |
| :--- | :--- | :--- |
| `NODE_ENV` | Application mode | `production` |
| `PORT` | HTTP port | `4000` (or assigned by host) |
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://...` |
| `CORS_ORIGIN` | Allowed domains for Storefront & Admin | `https://devcreation.com,https://admin.devcreation.com` |
| `PUBLIC_ASSET_BASE`| Domain used for public media URLs | `https://api.devcreation.com` |
| `JWT_ACCESS_SECRET`| Access token signing secret (min 32 chars) | `openssl rand -hex 32` |
| `JWT_REFRESH_SECRET`| Refresh token signing secret (min 32 chars)| `openssl rand -hex 32` |

---

## 🛠 Useful Maintenance Commands

- **Check logs (Docker)**: `docker compose logs -f backend`
- **Check logs (PM2)**: `pm2 logs devcreation-backend`
- **Restart (Docker)**: `docker compose restart backend`
- **Restart (PM2)**: `pm2 restart devcreation-backend`
- **Rebuild after git pull**:
  ```bash
  git pull
  npm install
  npm run build
  pm2 restart devcreation-backend
  ```
