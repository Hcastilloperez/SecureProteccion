# Plan de Despliegue - SOTER Security Management System

## Control de Versiones

| Fecha | Versión | Descripción |
|-------|---------|-------------|
| 2026-06-22 | 1.0 | Creación del documento |
| 2026-06-24 | 1.1 | Se eliminan instalaciones de PostgreSQL y Ollama (servidores externos) |
| 2026-06-27 | 1.2 | Reestructuración sin SSL, usando IP directa 192.168.1.62 |
| 2026-06-27 | 1.3 | Variables de entorno en systemd (más seguro), Systemd en lugar de PM2 |

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
│  │  │ :80        │  │  │  (Node.js) │           │   │   │
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
│192.168│     │localhost│
│.1.51  │     │ :11434  │
└───────┘     └─────────┘
```

**Nota:** PostgreSQL (192.168.1.51) y Ollama (localhost) son servidores externos. Configurar las URLs en las variables de entorno.

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

---

## 3. Preparación del LXC

### 3.1 Actualización del Sistema

```bash
apt update && apt upgrade -y
apt install -y curl wget git unzip software-properties-common
```

### 3.2 Crear Usuario para Deployment

```bash
```bash
mkdir -p /var/www/soter
useradd -m -s /bin/bash athena
chown -R athena:athena /var/www/soter
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
git clone https://github.com/Hcastilloperez/SecureProteccion.git
cd SecureProteccion
```

**Nota:** Las variables de entorno se configuran en systemd (sección 7), no en archivos .env locales por seguridad.

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

## 7. Configuración de Systemd (Recomendado sobre PM2)

### 7.1 Crear archivo de variables de entorno (backend)

```bash
sudo mkdir -p /etc/systemd/system/soter-back.service.d/
cat > /etc/systemd/system/soter-back.service.d/env.conf << EOF
[Service]
Environment=NODE_ENV=production
Environment=PORT=3001
Environment=DATABASE_URL=postgresql://postgres:Juanjose@1825@192.168.1.51:5432/soter?schema=public
Environment=JWT_SECRET=TU_JWT_SECRET_MUY_FUERTE_256_BITS
Environment=JWT_EXPIRES_IN=24h
Environment=OLLAMA_BASE_URL=http://localhost:11434
Environment=OLLAMA_MODEL=llama3.2:latest
Environment=UPLOAD_DIR=./uploads
Environment=MAX_FILE_SIZE=52428800
Environment=FRONTEND_URL=http://192.168.1.62
EOF
```

### 7.2 Crear servicio backend

```bash
cat > /etc/systemd/system/soter-back.service << EOF
[Unit]
Description=SOTER Backend API
After=network.target

[Service]
Type=simple
User=athena
WorkingDirectory=/var/www/soter/SecureProteccion/soterBack
ExecStart=/usr/bin/node dist/server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=DATABASE_URL="postgresql://postgres:Juanjose@1825@192.168.1.51:5432/barbershop?schema=public"
Environment=PORT=4001
Environment=JWT_SECRET="genera_un_token_seguro_aqui"
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF
```

### 7.3 Crear archivo de variables de entorno (frontend)

```bash
sudo mkdir -p /etc/systemd/system/soter-front.service.d/
cat > /etc/systemd/system/soter-front.service.d/env.conf << EOF
[Service]
Environment=NODE_ENV=production
Environment=PORT=4173
Environment=VITE_API_URL=http://192.168.1.62/api
Environment=VITE_APP_NAME=SOTER
EOF
```

### 7.4 Crear servicio frontend

```bash
cat > /etc/systemd/system/soter-front.service << EOF
[Unit]
Description=SOTER Frontend
After=network.target soter-back.service

[Service]
Type=simple
User=athena
WorkingDirectory=/var/www/soter/SecureProteccion/soterFront
ExecStart=/usr/bin/node /home/deploy/SecureProteccion/soterFront/node_modules/.bin/vite preview --port 4173 --host
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF
```

### 7.5 Habilitar e iniciar servicios

```bash
sudo systemctl daemon-reload
sudo systemctl enable soter-back
sudo systemctl enable soter-front
sudo systemctl start soter-back
sudo systemctl start soter-front
```

### 7.6 Comandos Útiles Systemd

```bash
systemctl status soter-back soter-front   # Ver estado
journalctl -u soter-back -f                # Ver logs en tiempo real
journalctl -u soter-back --since today     # Logs de hoy
systemctl restart soter-back soter-front   # Reiniciar
systemctl stop soter-back soter-front      # Detener
systemctl list-dependencies soter-back     # Ver dependencias
```

---

## 8. Configuración de Nginx (Sin SSL)

### 8.1 Instalar Nginx

```bash
apt install -y nginx
```

### 8.2 Configurar Sitio

```bash
sudo cat > /etc/nginx/sites-available/soter << EOF
server {
    listen 80;
    server_name 192.168.1.62;

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
        alias /home/deploy/SecureProteccion/soterBack/uploads;
        expires 1d;
        add_header Cache-Control "public, immutable";
    }

    access_log /var/log/nginx/soter_access.log;
    error_log /var/log/nginx/soter_error.log;
}
EOF

```bash
nano /etc/nginx/sites-available/soter
```

Contenido:
```nginx
# Frontend
server {
    listen 80;
    server_name 192.168.1.62;

    root /var/www/soter/SecureProteccion/soterFront;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Assets cache
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Backend API - Puerto 4001
upstream backend {
    server 192.168.1.62:4001;
}

server {
    listen 80;
    server_name 192.168.1.62;

    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}


```
```bash

ln -sf /etc/nginx/sites-available/soter /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

---

## 9. Scripts de Deployment

### 9.1 Script de Actualización (deploy.sh)

```bash
#!/bin/bash
set -e

cd /home/deploy/SecureProteccion

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
sudo systemctl restart soter-back soter-front

echo "=== Deployment completado ==="
```

### 9.2 Hacer Ejecutable

```bash
chmod +x /home/deploy/SecureProteccion/deploy.sh
```

---

## 10. Firewall (UFW)

```bash
ufw enable
ufw allow 22/tcp
ufw allow 80/tcp
ufw status
```

---

## 11. Checklist de Deployment

| Paso | Tarea | Estado |
|------|-------|--------|
| 1 | Crear LXC en Proxmox | ☐ |
| 2 | Actualizar sistema | ☐ |
| 3 | Instalar Node.js y pnpm | ☐ |
| 4 | Clonar repositorio | ☐ |
| 5 | Instalar dependencias y build | ☐ |
| 6 | Generar Prisma Client | ☐ |
| 7 | Ejecutar migraciones | ☐ |
| 8 | Configurar Systemd con variables de entorno | ☐ |
| 9 | Configurar Nginx | ☐ |
| 10 | Configurar Firewall | ☐ |
| 11 | Verificar funcionamiento | ☐ |

---

## 12. Comandos Rápidos de Referencia

```bash
# Conexión SSH
ssh deploy@192.168.1.62

# Ver estado de servicios
systemctl status soter-back soter-front

# Ver logs en tiempo real
journalctl -u soter-back -f
journalctl -u soter-front -f

# Actualizar desde Git
cd /home/deploy/SecureProteccion && ./deploy.sh

# Ver uso de recursos
htop
ncdu -h /

# Verificar que Nginx responda
curl http://192.168.1.62
curl http://192.168.1.62/api/health
```

---

## 13. Configuración de Servidores Externos

### 13.1 PostgreSQL (192.168.1.51)

Asegúrate de que el servidor PostgreSQL permita conexiones desde el LXC:

```bash
# En el servidor PostgreSQL
nano /etc/postgresql/14/main/pg_hba.conf
# Agregar: host soter postgres IP_DEL_LXC/32 md5

nano /etc/postgresql/14/main/postgresql.conf
# Cambiar: listen_addresses = '*'

systemctl restart postgresql
```

### 13.2 Ollama (localhost)

Ollama está configurado en localhost por el momento, no requiere configuración adicional.

---

## 14. Seguridad Post-Deploy

1. **Cambiar contraseñas** de PostgreSQL y JWT
2. **Configurar fail2ban** para protección SSH
3. **Mantener sistema actualizado**: `apt update && apt upgrade`
4. **Revisar logs** regularmente
5. **Backups automáticos** de la base de datos
6. **Firewall** correctamente configurado