# Hostinger VPS Deployment Guide

This guide deploys ExcelHub on a Hostinger VPS with PostgreSQL, PM2, Nginx, and SSL.

## 1. Server Packages

```bash
sudo apt update
sudo apt install -y nginx postgresql postgresql-contrib certbot python3-certbot-nginx
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

## 2. PostgreSQL Setup

```bash
sudo -u postgres psql
```

```sql
CREATE DATABASE excelhub;
CREATE USER excelhub_user WITH ENCRYPTED PASSWORD 'strong_password_here';
GRANT ALL PRIVILEGES ON DATABASE excelhub TO excelhub_user;
\q
```

Use:

```env
DATABASE_URL="postgresql://excelhub_user:strong_password_here@localhost:5432/excelhub?schema=public"
```

## 3. Environment Variables

Create `.env` in the project root:

```env
DATABASE_URL="postgresql://excelhub_user:strong_password_here@localhost:5432/excelhub?schema=public"
NEXTAUTH_SECRET="generate-a-long-random-secret"
NEXTAUTH_URL="https://yourdomain.com"
SITE_URL="https://yourdomain.com"
ADMIN_EMAIL="admin@yourdomain.com"
ADMIN_PASSWORD="change-this-before-seeding"
UPLOAD_DIR="./public/uploads"
```

Generate a secret:

```bash
openssl rand -base64 32
```

## 4. Install and Build

```bash
npm install
npm run db:push
npm run db:seed
npm run build
```

For mature production change management, create Prisma migrations locally with `npx prisma migrate dev`, commit the generated `prisma/migrations` folder, then use `npx prisma migrate deploy` on the server.

## 5. PM2 Configuration

Create `ecosystem.config.js`:

```js
module.exports = {
  apps: [
    {
      name: "excelhub",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      cwd: "/var/www/excelhub",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
```

Start:

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 6. Nginx Configuration

Create `/etc/nginx/sites-available/excelhub`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    client_max_body_size 20M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable:

```bash
sudo ln -s /etc/nginx/sites-available/excelhub /etc/nginx/sites-enabled/excelhub
sudo nginx -t
sudo systemctl reload nginx
```

## 7. SSL Setup

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
sudo certbot renew --dry-run
```

Update `.env`:

```env
NEXTAUTH_URL="https://yourdomain.com"
SITE_URL="https://yourdomain.com"
```

Restart:

```bash
pm2 restart excelhub
```

## 8. Production Commands

```bash
npm install
npm run db:push
npm run db:seed
npm run build
pm2 restart excelhub
```

## 9. File Storage

MVP uploads use `public/uploads`. For AWS S3 or Cloudflare R2, implement another provider in `src/services/storage-service.ts` and swap the exported `storage` instance.

## 10. SEO Checks

After deploy, verify:

- `https://yourdomain.com/sitemap.xml`
- `https://yourdomain.com/robots.txt`
- Template canonical URLs
- OpenGraph previews
- JSON-LD in template and blog pages
