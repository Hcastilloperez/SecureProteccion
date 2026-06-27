# Plan de Despliegue - SOTER Security Management System

## Control de Versiones

| Fecha | Versión | Descripción |
|-------|---------|-------------|
| 2026-06-22 | 1.0 | Creación del documento |
| 2026-06-24 | 1.1 | Se eliminan instalaciones de PostgreSQL y Ollama (servidores externos) |

---

## 1. Arquitectura de Despliegue

```
┌─────────────────────────────────────────────────────────────┐
│                        Proxmox LXC                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    Ubuntu 22.04 LTS                   │   │
│  │                                                      │   │
│  │  ┌────────────┐  ┌─────────────────────────────┐   │   │
│  │  │   Nginx    │  │      PM2 (Process Manager)   │   │   │
│  │  │ (Reverse   │  │  ┌─────────────┐           │   │   │
│  │  │   Proxy)   │  │  │ soterBack  │           │   │   │
│  │  │ :443, :80  │  │  │  (Node.js) │           │   │   │
│  │  └─────┬──────┘  │  │   :3001    │           │   │   │
│  │        │          │  └─────────────┘           │   │   │
│  │        │          │  ┌─────────────┐           │   │   │
│  │        │          │  │soterFront  │           │   │   │
│  │        │          │  │   (Vite)   │           │   │   │
│  │        │          │  │   :4173    │           │   │   │
│  │        │          │  └─────────────┘           │   │   │
│  │        │          └─────────────────────────────┘   │   │
│  └────────┼────────────────────────────────────────────┘   │
└───────────┼───────────────────────────────────────────────┘
            │
    ┌───────┴───────┐
    │               │
┌───┴───┐     ┌────┴────┐
│ BD    │     │ Ollama  │
│Remote │     │ Remote  │
└───────┘     └─────────┘
```

**Nota:** PostgreSQL y Ollama son servidores externos. Configurar las URLs en las variables de entorno.

---

## 2. Requisitos del Sistema

### 2.1 LXC (Contenedor)

| Recurso | Mínimo | Recomendado |
|---------|--------|-------------|
| CPU | 2 cores | 4 cores |
| RAM | 2 GB | 4 GB |
| Disco | 20 GB | 40 GB |
| Ubuntu | 22.04 LTS | 22.04 LTS |

### 2.2 Software Requerido

- **Node.js** 18+ (con pnpm)
- **Nginx** 1.18+
- **PM2** (gestión de procesos)
- **SSL** (Let's Encrypt/Certbot)

---

## 3. Preparación del LXC

### 3.1 Actualización del Sistema

```bash
apt update && apt upgrade -y
apt install -y curl wget git unzip software-properties-common
```

### 3.2 Crear Usuario para Deployment

```bash
adduser deploy
usermod -aG sudo deploy
mkdir -p /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
```

---

## 4. Instalación de Node.js y pnpm

### 4.1 Instalar Node.js 20 LTS

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node --version
npm --version
```

### 4.2 Instalar pnpm

```bash
npm install -g pnpm
pnpm --version
```

---

## 5. Preparación del Proyecto

### 5.1 Clonar Repositorio

```bash
su - deploy
cd ~
git clone https://github.com/TU_USUARIO/secure-proteccion.git
cd secure-proteccion
```

### 5.2 Variables de Entorno Backend

```bash
cat > soterBack/.env << EOF
# Base
NODE_ENV=production
PORT=3001

# Database (servidor externo)
DATABASE_URL=postgresql://USER:PASSWORD@HOST_BD:5432/soter_db

# JWT
JWT_SECRET=TU_JWT_SECRET_MUY_FUERTE_256_BITS
JWT_EXPIRES_IN=24h

# Ollama (servidor externo)
OLLAMA_BASE_URL=http://HOST_OLLAMA:11434
OLLAMA_MODEL=llama3.2:latest

# Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=52428800

# Puerto frontend (para CORS)
FRONTEND_URL=http://tu-dominio.com
EOF
```

### 5.3 Variables de Entorno Frontend

```bash
cat > soterFront/.env.production << EOF
VITE_API_URL=https://tu-dominio.com/api
VITE_APP_NAME=SOTER
EOF
```

---

## 6. Build y Deployment

### 6.1 Instalar Dependencias

```bash
pnpm install
cd soterBack && pnpm install && cd ..
cd soterFront && pnpm install && cd ..
```

### 6.2 Generar Prisma Client

```bash
cd soterBack
pnpm prisma generate
```

### 6.3 Ejecutar Migraciones

```bash
cd soterBack
pnpm prisma migrate deploy
```

### 6.4 Build del Frontend

```bash
cd soterFront
pnpm build
```

### 6.5 Crear directorio de uploads

```bash
mkdir -p soterBack/uploads
chmod 755 soterBack/uploads
```

---

## 7. Configuración de PM2

### 7.1 Instalar PM2 Globalmente

```bash
sudo npm install -g pm2
```

### 7.2 Script de Arranque

```bash
cat > /home/deploy/secure-proteccion/ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'soter-back',
      cwd: './soterBack',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
    {
      name: 'soter-front',
      cwd: './soterFront',
      script: 'npm',
      args: 'run preview',
      env: {
        NODE_ENV: 'production',
        PORT: 4173,
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
    },
  ],
};
EOF
```

### 7.3 Iniciar Servicios con PM2

```bash
cd /home/deploy/secure-proteccion
pm2 start ecosystem.config.js
pm2 save
sudo env PATH=\$PATH:/usr/bin pm2 startup systemd -u deploy --hp /home/deploy
```

### 7.4 Comandos Útiles PM2

```bash
pm2 status              # Ver estado
pm2 logs                # Ver logs
pm2 logs soter-back     # Logs backend
pm2 restart all         # Reiniciar
pm2 stop all            # Detener
pm2 delete all          # Eliminar
```

---

## 8. Configuración de Nginx

### 8.1 Instalar Nginx

```bash
apt install -y nginx
```

### 8.2 Configurar Sitio

```bash
sudo cat > /etc/nginx/sites-available/soter << EOF
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tu-dominio.com www.tu-dominio.com;

    ssl_certificate /etc/letsencrypt/live/tu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tu-dominio.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    location / {
        proxy_pass http://localhost:4173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    location /uploads {
        alias /home/deploy/secure-proteccion/soterBack/uploads;
        expires 1d;
        add_header Cache-Control "public, immutable";
    }

    access_log /var/log/nginx/soter_access.log;
    error_log /var/log/nginx/soter_error.log;
}
EOF

ln -sf /etc/nginx/sites-available/soter /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

---

## 9. Configurar SSL con Let's Encrypt

### 9.1 Instalar Certbot

```bash
apt install -y certbot python3-certbot-nginx
```

### 9.2 Obtener Certificado

```bash
certbot --nginx -d tu-dominio.com -d www.tu-dominio.com
```

### 9.3 Renovación Automática

```bash
certbot renew --dry-run
systemctl status certbot.timer
```

---

## 10. Scripts de Deployment

### 10.1 Script de Actualización (deploy.sh)

```bash
#!/bin/bash
set -e

cd /home/deploy/secure-proteccion

echo "=== SOTER Deployment ==="
echo "Fecha: $(date)"

echo "[1/5] Obteniendo cambios de Git..."
git pull origin main

echo "[2/5] Instalando dependencias..."
pnpm install

echo "[3/5] Build frontend..."
cd soterFront && pnpm build && cd ..

echo "[4/5] Migraciones de BD..."
cd soterBack && pnpm prisma migrate deploy && cd ..

echo "[5/5] Reiniciando servicios..."
pm2 restart all

echo "=== Deployment completado ==="
```

### 10.2 Hacer Ejecutable

```bash
chmod +x /home/deploy/secure-proteccion/deploy.sh
```

---

## 11. Firewall (UFW)

```bash
ufw enable
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw status
```

---

## 12. Checklist de Deployment

| Paso | Tarea | Estado |
|------|-------|--------|
| 1 | Crear LXC en Proxmox | ☐ |
| 2 | Actualizar sistema | ☐ |
| 3 | Instalar Node.js y pnpm | ☐ |
| 4 | Clonar repositorio | ☐ |
| 5 | Configurar variables de entorno | ☐ |
| 6 | Instalar dependencias | ☐ |
| 7 | Generar Prisma Client | ☐ |
| 8 | Ejecutar migraciones | ☐ |
| 9 | Build frontend | ☐ |
| 10 | Configurar PM2 | ☐ |
| 11 | Configurar Nginx | ☐ |
| 12 | Configurar SSL | ☐ |
| 13 | Configurar Firewall | ☐ |
| 14 | Verificar funcionamiento | ☐ |

---

## 13. Comandos Rápidos de Referencia

```bash
# Conexión SSH
ssh deploy@tu-dominio.com

# Ver estado de servicios
pm2 status

# Ver logs en tiempo real
pm2 logs --f

# Actualizar desde Git
cd /home/deploy/secure-proteccion && ./deploy.sh

# Ver uso de recursos
htop
ncdu -h /

# Verificar SSL
openssl s_client -connect tu-dominio.com:443 -servername tu-dominio.com
```

---

## 14. Configuración de Servidores Externos

### 14.1 PostgreSQL (Externo)

Asegúrate de que el servidor PostgreSQL permita conexiones desde el LXC:

```bash
# En el servidor PostgreSQL
nano /etc/postgresql/14/main/pg_hba.conf
# Agregar: host soter_db soter IP_DEL_LXC/32 md5

nano /etc/postgresql/14/main/postgresql.conf
# Cambiar: listen_addresses = '*'

systemctl restart postgresql
```

### 14.2 Ollama (Externo)

Asegúrate de que Ollama esté configurado para aceptar conexiones:

```bash
# En el servidor Ollama
nano /etc/ollama/.env
# OLLAMA_HOST=0.0.0.0

systemctl restart ollama
```

---

## 15. Seguridad Post-Deploy

1. **Cambiar contraseñas** de PostgreSQL y JWT
2. **Configurar fail2ban** para protección SSH
3. **Mantener sistema actualizado**: `apt update && apt upgrade`
4. **Revisar logs** regularmente
5. **Backups automáticos** de la base de datos
6. **Firewall** correctamente configurado
