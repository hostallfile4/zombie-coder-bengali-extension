# Deployment Guide

## Overview

This guide covers deploying ZombieCoder to production environments including cloud platforms, Docker, and Kubernetes.

## Prerequisites

- Node.js 16+ installed
- MySQL 8.0+ database
- Ollama installed (for local models)
- Domain name (optional)
- SSL certificate (recommended)

## Environment Setup

### Production Environment Variables

Create a `.env.production` file:

\`\`\`env
# Server Configuration
NODE_ENV=production
GATEWAY_PORT=8001
API_KEY=your-secure-api-key-here

# Database Configuration
DB_CONNECTION=mysql
DB_HOST=your-db-host
DB_PORT=3306
DB_DATABASE=zombiecoder
DB_USERNAME=zombiecoder_user
DB_PASSWORD=your-secure-password

# Ollama Configuration
OLLAMA_HOST=http://localhost:11434

# Agent Ports
BENGALI_NLP_PORT=8002
CODE_GEN_PORT=8003
CODE_REVIEW_PORT=8004
DOCUMENTATION_PORT=8005
TESTING_PORT=8006
DEPLOYMENT_PORT=8007
VOICE_PROCESSOR_PORT=8014

# Admin Panel
ADMIN_PORT=3000
ADMIN_SECRET=your-admin-secret
SESSION_SECRET=your-session-secret

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/zombiecoder/app.log

# Security
CORS_ORIGIN=https://yourdomain.com
RATE_LIMIT_MAX=1000
RATE_LIMIT_WINDOW=3600000
\`\`\`

## Docker Deployment

### Dockerfile

\`\`\`dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application files
COPY . .

# Build TypeScript
RUN npm run build

# Expose ports
EXPOSE 8001 3000

# Start application
CMD ["npm", "run", "start:prod"]
\`\`\`

### Docker Compose

\`\`\`yaml
version: '3.8'

services:
  gateway:
    build: .
    ports:
      - "8001:8001"
    environment:
      - NODE_ENV=production
      - DB_HOST=mysql
    depends_on:
      - mysql
      - ollama
    restart: unless-stopped

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_DATABASE: zombiecoder
    volumes:
      - mysql_data:/var/lib/mysql
      - ./scripts/init-database.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "3307:3306"
    restart: unless-stopped

  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    restart: unless-stopped

  admin:
    build:
      context: ./admin-panel
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=mysql
    depends_on:
      - mysql
    restart: unless-stopped

volumes:
  mysql_data:
  ollama_data:
\`\`\`

### Build and Run

\`\`\`bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
\`\`\`

## Kubernetes Deployment

### Deployment YAML

\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: zombiecoder-gateway
spec:
  replicas: 3
  selector:
    matchLabels:
      app: zombiecoder-gateway
  template:
    metadata:
      labels:
        app: zombiecoder-gateway
    spec:
      containers:
      - name: gateway
        image: zombiecoder/gateway:latest
        ports:
        - containerPort: 8001
        env:
        - name: NODE_ENV
          value: "production"
        - name: DB_HOST
          valueFrom:
            secretKeyRef:
              name: zombiecoder-secrets
              key: db-host
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8001
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: zombiecoder-gateway
spec:
  selector:
    app: zombiecoder-gateway
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8001
  type: LoadBalancer
\`\`\`

### Deploy to Kubernetes

\`\`\`bash
# Create secrets
kubectl create secret generic zombiecoder-secrets \
  --from-literal=db-host=mysql-service \
  --from-literal=db-password=your-password \
  --from-literal=api-key=your-api-key

# Apply deployment
kubectl apply -f k8s/deployment.yaml

# Check status
kubectl get pods
kubectl get services

# View logs
kubectl logs -f deployment/zombiecoder-gateway
\`\`\`

## Cloud Platform Deployment

### AWS EC2

1. **Launch EC2 Instance**
   - AMI: Ubuntu 22.04 LTS
   - Instance Type: t3.medium or larger
   - Security Group: Allow ports 22, 80, 443, 8001

2. **Install Dependencies**
   \`\`\`bash
   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs

   # Install MySQL
   sudo apt install -y mysql-server

   # Install Ollama
   curl -fsSL https://ollama.ai/install.sh | sh
   \`\`\`

3. **Deploy Application**
   \`\`\`bash
   # Clone repository
   git clone https://github.com/zombiecoder/bengali-extension.git
   cd bengali-extension

   # Install dependencies
   npm install

   # Build application
   npm run build

   # Start with PM2
   npm install -g pm2
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   \`\`\`

### DigitalOcean

1. **Create Droplet**
   - Image: Ubuntu 22.04
   - Size: 2 GB RAM / 2 vCPUs
   - Add SSH key

2. **Setup Application**
   \`\`\`bash
   # Use deployment script
   curl -fsSL https://raw.githubusercontent.com/zombiecoder/bengali-extension/main/scripts/deploy.sh | bash
   \`\`\`

### Vercel (Frontend Only)

Deploy the admin panel to Vercel:

\`\`\`bash
cd admin-panel
vercel --prod
\`\`\`

## Process Management

### PM2 Configuration

Create `ecosystem.config.js`:

\`\`\`javascript
module.exports = {
  apps: [
    {
      name: 'gateway',
      script: './dist/gateway/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 8001
      }
    },
    {
      name: 'admin',
      script: './dist/admin-panel/server.js',
      instances: 1,
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
\`\`\`

### PM2 Commands

\`\`\`bash
# Start all apps
pm2 start ecosystem.config.js

# Monitor
pm2 monit

# View logs
pm2 logs

# Restart
pm2 restart all

# Stop
pm2 stop all

# Delete
pm2 delete all
\`\`\`

## Nginx Configuration

### Reverse Proxy

Create `/etc/nginx/sites-available/zombiecoder`:

\`\`\`nginx
upstream gateway {
    server 127.0.0.1:8001;
}

upstream admin {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # API Gateway
    location /api {
        proxy_pass http://gateway;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Admin Panel
    location / {
        proxy_pass http://admin;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
\`\`\`

Enable site:

\`\`\`bash
sudo ln -s /etc/nginx/sites-available/zombiecoder /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
\`\`\`

## SSL Certificate

### Let's Encrypt

\`\`\`bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
\`\`\`

## Monitoring

### Health Checks

\`\`\`bash
# Gateway health
curl https://yourdomain.com/health

# Database health
mysql -h localhost -u root -p -e "SELECT 1"

# Ollama health
curl http://localhost:11434/api/tags
\`\`\`

### Logging

Configure centralized logging:

\`\`\`javascript
// logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
\`\`\`

## Backup Strategy

### Automated Backups

Create backup script:

\`\`\`bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/var/backups/zombiecoder"
DATE=$(date +%Y-%m-%d_%H-%M-%S)

# Database backup
mysqldump -u root -p$DB_PASSWORD zombiecoder > "$BACKUP_DIR/db_$DATE.sql"

# Application backup
tar -czf "$BACKUP_DIR/app_$DATE.tar.gz" /opt/zombiecoder

# Upload to S3 (optional)
aws s3 cp "$BACKUP_DIR/db_$DATE.sql" s3://your-bucket/backups/

# Clean old backups (keep last 7 days)
find $BACKUP_DIR -type f -mtime +7 -delete
\`\`\`

Schedule with cron:

\`\`\`bash
# Run daily at 2 AM
0 2 * * * /opt/zombiecoder/scripts/backup.sh
\`\`\`

## Security Checklist

- [ ] Change default passwords
- [ ] Enable firewall (UFW)
- [ ] Configure SSL/TLS
- [ ] Set up fail2ban
- [ ] Enable database encryption
- [ ] Use environment variables for secrets
- [ ] Implement rate limiting
- [ ] Enable CORS properly
- [ ] Regular security updates
- [ ] Monitor logs for suspicious activity

## Troubleshooting

### Service Won't Start

\`\`\`bash
# Check logs
pm2 logs gateway

# Check port availability
sudo netstat -tlnp | grep 8001

# Check environment variables
pm2 env gateway
\`\`\`

### Database Connection Issues

\`\`\`bash
# Test connection
mysql -h $DB_HOST -P $DB_PORT -u $DB_USERNAME -p

# Check MySQL status
sudo systemctl status mysql

# View MySQL logs
sudo tail -f /var/log/mysql/error.log
\`\`\`

### High Memory Usage

\`\`\`bash
# Check memory
free -h

# Check process memory
pm2 monit

# Restart services
pm2 restart all
\`\`\`

## Performance Optimization

1. **Enable Caching**: Use Redis for response caching
2. **Load Balancing**: Use multiple instances with PM2 cluster mode
3. **CDN**: Serve static assets via CDN
4. **Database Optimization**: Add indexes, optimize queries
5. **Compression**: Enable gzip in Nginx
6. **Connection Pooling**: Configure database connection pools

## Scaling

### Horizontal Scaling

1. Deploy multiple instances behind a load balancer
2. Use shared database and Redis
3. Implement session affinity if needed

### Vertical Scaling

1. Increase server resources (CPU, RAM)
2. Optimize database configuration
3. Tune Node.js memory limits

\`\`\`bash
# Increase Node.js memory
node --max-old-space-size=4096 server.js
