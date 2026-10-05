#!/usr/bin/env bash
# ============================================================
# Dev Creation — AWS EC2 Automated Provisioning Script
# Target OS: Ubuntu 22.04 LTS / Ubuntu 24.04 LTS (x86_64 or arm64)
# Run as root or with sudo:
#   chmod +x ec2-setup.sh && sudo ./ec2-setup.sh
# ============================================================

set -euo pipefail

echo "============================================================"
echo "  🚀 Starting AWS EC2 Setup for Dev Creation Platform"
echo "============================================================"

# Ensure script is executed as root
if [ "$EUID" -ne 0 ]; then
  echo "❌ Error: Please run as root (use: sudo ./ec2-setup.sh)"
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive

echo "==> [1/6] Updating APT repositories & installing base tools..."
apt-get update -y
apt-get upgrade -y
apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    ufw \
    htop \
    wget \
    certbot \
    python3-certbot-nginx

echo "==> [2/6] Configuring 2GB Swap Space (prevents OOM crashes)..."
if [ ! -f /swapfile ]; then
    fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    # Optimize swappiness for server workloads
    sysctl vm.swappiness=10
    echo 'vm.swappiness=10' >> /etc/sysctl.conf
    echo "✅ 2GB Swap file activated."
else
    echo "ℹ️ Swap file already exists, skipping."
fi

echo "==> [3/6] Installing official Docker Engine & Docker Compose..."
# Remove old distro versions if present
apt-get remove -y docker docker-engine docker.io containerd runc || true

# Add Docker's official GPG key & repo
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg --yes
chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Enable and start Docker
systemctl enable docker
systemctl start docker

# Add default ubuntu user to docker group
if id -u ubuntu >/dev/null 2>&1; then
    usermod -aG docker ubuntu
    echo "✅ User 'ubuntu' added to docker group."
fi

echo "==> [4/6] Configuring UFW Firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'
ufw allow 3001/tcp comment 'Admin Panel'
ufw --force enable
echo "✅ UFW firewall configured & enabled."

echo "==> [5/6] Verifying Docker installation..."
docker --version
docker compose version

echo "============================================================"
echo "  🎉 AWS EC2 Instance Provisioning Complete!"
echo "============================================================"
echo "Next steps:"
echo "  1. If logged in as 'ubuntu', log out and log back in (or run 'newgrp docker')"
echo "  2. Clone your repository:"
echo "     git clone https://github.com/ashishpimple94/Devcreation-latest.git"
echo "     cd Devcreation-latest"
echo "  3. Configure your production environment:"
echo "     cp .env.production.example .env.production"
echo "     nano .env.production"
echo "  4. Launch the application:"
echo "     chmod +x deploy.sh"
echo "     ./deploy.sh"
echo "============================================================"
