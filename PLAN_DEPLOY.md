# Plan de Despliegue - SOTER Security Management System

## Control de Versiones

| Fecha | Versión | Descripción |
|-------|---------|-------------|
| 2026-06-22 | 1.0 | Creación del documento |

---

## 1. Arquitectura de Despliegue

```
┌─────────────────────────────────────────────────────────────┐
│                        Proxmox LXC                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    Ubuntu 22.04 LTS                   │   │
│  │                                                      │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐   │   │
│  │  │   Nginx    │  │  Ollama     │  │  PostgreSQL │   │   │
│  │  │ (Reverse   │  │  (Opcional) │  │   (Local)   │   │   │
│  │  │   Proxy)   │  │             │  │             │   │   │
│  │  │ :443, :80  │  │  :11434     │  │   :5432    │   │   │
│  │  └─────┬──────┘  └──────┬──────┘  └──────┬──────┘   │   │
│  │        │                │                │          │   │
│  │        └────────────────┼────────────────┘          │   │
│  │                         │                           │   │
│  │  ┌──────────────────────┴───────────────────────┐   │   │
│  │  │              PM2 (Process Manager)           │   │   │
│  │  │  ┌─────────────┐      ┌─────────────┐       │   │   │
│  │  │  │  soterBack  │      │  soterFront │       │   │   │
│  │  │  │  (Node.js)  │      │   (Vite)    │       │   │   │
│  │  │  │   :3001     │      │   :4173     │       │   │   │
│  │  │  └─────────────┘      └─────────────┘       │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Requisitos del Sistema

### 2.1 LXC (Contenedor)

| Recurso | Mínimo | Recomendado |
|---------|--------|-------------|
| CPU | 2 cores | 4 cores |
| RAM | 4 GB | 8 GB |
| Disco | 40 GB | 80 GB |
| Ubuntu | 22.04 LTS | 22.04 LTS |

### 2.1 Software Requerido

- **Node.js** 18+ (con pnpm)
- **PostgreSQL** 14+ (o usar externo)
- **Nginx** 1.18+
- **PM2** (gestión de procesos)
- **Ollama** (opcional, para IA local)
- **SSL** (Let's Encrypt/Certbot)

---

## 3. Preparación del LXC

### 3.1 Actualización del Sistema

```bash
# Conectar al LXC como root
apt update && apt upgrade -y

# Instalar utilidades básicas
apt install -y curl wget git unzip software-properties-common
```

### 3.2 Crear Usuario para Deployment

```bash
# Crear usuario deploy
adduser deploy
usermod -aG sudo deploy

# Configurar SSH para deploy (opcional)
mkdir -p /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
```

---

## 4. Instalación de PostgreSQL

### 4.1 Instalar PostgreSQL

```bash
apt install -y postgresql postgresql-contrib

# Verificar estado
systemctl status postgresql
```

### 4.2 Crear Base de Datos y Usuario

```bash
sudo -u postgres psql << EOF
-- Crear usuario
CREATE USER soter WITH PASSWORD 'TU_PASSWORD_FUERTE';

-- Crear base de datos
CREATE DATABASE soter_db OWNER soter;

-- Permisos
GRANT ALL PRIVILEGES ON DATABASE soter_db TO soter;

-- Salir
\q
EOF
```

### 4.3 Habilitar Conexión Remota (Opcional)

```bash
# Editar pg_hba.conf
nano /etc/postgresql/14/main/pg_hba.conf

# Agregar línea para conexión remota:
# host    all    all    0.0.0.0/0    md5

# Editar postgresql.conf
nano /etc/postgresql/14/main/postgresql.conf

# Cambiar:
# listen_addresses = '*'

# Reiniciar
systemctl restart postgresql
```

---

## 5. Instalación de Node.js y pnpm

### 5.1 Instalar Node.js 20 LTS

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Verificar versión
node --version  # v20.x.x
npm --version
```

### 5.2 Instalar pnpm

```bash
npm install -g pnpm

# Verificar
pnpm --version
```

---

## 6. Instalación de Ollama (Opcional)

### 6.1 Instalar Ollama

```bash
curl -fsSL https://ollama.com/install.sh | sh

# Verificar
ollama --version
```

### 6.2 Descargar Modelo (Opcional)

```bash
# Descargar modelo ligero para inicio
ollama pull llama3.2:1b

# Ver modelos instalados
ollama list
```

### 6.3 Configurar Ollama como Servicio

```bash
# Crear servicio systemd
cat > /etc/systemd/system/ollama.service << EOF
[Unit]
Description=Ollama Service
After=network-online.target

[Service]
ExecStart=/usr/bin/ollama serve
User=root
Restart=always
RestartSec=3

[Install]
WantedBy=default.target
EOF

# Habilitar e iniciar
systemctl enable ollama
systemctl start ollama
systemctl status ollama
```

---

## 7. Preparación del Proyecto

### 7.1 Clonar Repositorio

```bash
# Como usuario deploy
su - deploy
cd ~

# Clonar repositorio
git clone https://github.com/TU_USUARIO/secure-proteccion.git
cd secure-proteccion
```

### 7.2 Variables de Entorno Backend

```bash
# Crear archivo .env en soterBack
cat > soterBack/.env << EOF
# Base
NODE_ENV=production
PORT=3001

# Database
DATABASE_URL=postgresql://soter:TU_PASSWORD_FUERTE@localhost:5432/soter_db

# JWT
JWT_SECRET=TU_JWT_SECRET_MUY_FUERTE_256_BITS
JWT_EXPIRES_IN=24h

# Ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:1b

# Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=52428800

# Puerto frontend (para CORS)
FRONTEND_URL=http://tu-dominio.com
EOF
```

### 7.3 Variables de Entorno Frontend

```bash
# Crear archivo .env en soterFront
cat > soterFront/.env.production << EOF
VITE_API_URL=https://tu-dominio.com/api
VITE_APP_NAME=SOTER
EOF
```

---

## 8. Build y Deployment

### 8.1 Instalar Dependencias

```bash
# Desde la raíz del monorepo
pnpm install

# Instalar dependencias del backend
cd soterBack && pnpm install
cd ../soterFront && pnpm install
```

### 8.2 Generar Prisma Client

```bash
cd soterBack
pnpm prisma generate
```

### 8.3 Ejecutar Migraciones

```bash
cd soterBack
pnpm prisma migrate deploy
```

### 8.4 Build del Frontend

```bash
cd soterFront
pnpm build
```

### 8.5 Crear директори для uploads

```bash
mkdir -p soterBack/uploads
chmod 755 soterBack/uploads
```

---

## 9. Configuración de PM2

### 9.1 Instalar PM2 Globalmente

```bash
sudo npm install -g pm2
```

### 9.2 Script de Arranque Backend

```bash
# Crear script de start
cat > /home/deploy/secure-proteccion/soterBack/ecosystem.config.js << EOF
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

### 9.3 Iniciar Servicios con PM2

```bash
cd /home/deploy/secure-proteccion
pm2 start ecosystem.config.js

# Guardar configuración de PM2
pm2 save

# Configurar PM2 para iniciar con el sistema
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u deploy --hp /home/deploy
```

### 9.4 Comandos Útiles PM2

```bash
pm2 status              # Ver estado de servicios
pm2 logs                # Ver logs
pm2 logs soter-back     # Ver logs de backend
pm2 restart all          # Reiniciar todos los servicios
pm2 stop all            # Detener todos
pm2 delete all          # Eliminar todos
```

---

## 10. Configuración de Nginx

### 10.1 Instalar Nginx

```bash
apt install -y nginx
```

### 10.2 Configurar Sitio

```bash
sudo cat > /etc/nginx/sites-available/soter << EOF
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;

    # Redirect a HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tu-dominio.com www.tu-dominio.com;

    # SSL Configuration (se configurará con Certbot)
    ssl_certificate /etc/letsencrypt/live/tu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tu-dominio.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Headers de seguridad
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Frontend (Vite build)
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

    # Backend API
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

    # Ollama API (si está instalado)
    location /ollama {
        proxy_pass http://localhost:11434;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Archivos subidos
    location /uploads {
        alias /home/deploy/secure-proteccion/soterBack/uploads;
        expires 1d;
        add_header Cache-Control "public, immutable";
    }

    # Logs
    access_log /var/log/nginx/soter_access.log;
    error_log /var/log/nginx/soter_error.log;
}
EOF

# Habilitar sitio
ln -sf /etc/nginx/sites-available/soter /etc/nginx/sites-enabled/

# Verificar configuración
nginx -t

# Reiniciar Nginx
systemctl restart nginx
```

---

## 11. Configurar SSL con Let's Encrypt

### 11.1 Instalar Certbot

```bash
apt install -y certbot python3-certbot-nginx
```

### 11.2 Obtener Certificado

```bash
# Asegúrate que Nginx esté corriendo y el dominio apunte al servidor
certbot --nginx -d tu-dominio.com -d www.tu-dominio.com

# Seguir las instrucciones interactivas
# Cuando pida redirección HTTP->HTTPS, elegir "2" (redirect)
```

### 11.3 Renovación Automática

```bash
# Certbot renueva automáticamente, pero verificamos
certbot renew --dry-run

# El servicio systemd de renovación ya viene incluido
systemctl status certbot.timer
```

---

## 12. Scripts de Deployment

### 12.1 Script de Actualización (deploy.sh)

```bash
#!/bin/bash
# deploy.sh - Script de deployment

set -e

cd /home/deploy/secure-proteccion

echo "=== SOTER Deployment ==="
echo "Fecha: $(date)"

# Pull últimos cambios
echo "[1/6] Obteniendo cambios de Git..."
git pull origin main

# Instalar dependencias
echo "[2/6] Instalando dependencias..."
pnpm install

# Build frontend
echo "[3/6] Build frontend..."
cd soterFront && pnpm build && cd ..

# Generar Prisma (si hay cambios en schema)
echo "[4/6] Verificando base de datos..."
cd soterBack && pnpm prisma migrate deploy && cd ..

# Reiniciar servicios PM2
echo "[5/6] Reiniciando servicios..."
pm2 restart all

# Verificar estado
echo "[6/6] Estado de servicios:"
pm2 status

echo "=== Deployment completado ==="
```

### 12.2 Hacer Ejecutable

```bash
chmod +x /home/deploy/secure-proteccion/deploy.sh
```

### 12.3 Actualizar desde GitHub (opcional con webhooks)

```bash
# Crear script de webhook
cat > /home/deploy/secure-proteccion/webhook.sh << EOF
#!/bin/bash
cd /home/deploy/secure-proteccion
git pull origin main
pnpm install
cd soterFront && pnpm build && cd ..
cd soterBack && pnpm prisma migrate deploy && cd ..
pm2 restart all
EOF

chmod +x /home/deploy/secure-proteccion/webhook.sh
```

---

## 13. Firewall (UFW)

### 13.1 Configurar UFW

```bash
# Habilitar UFW
ufw enable

# Permitir SSH (importante!)
ufw allow 22/tcp

# Permitir HTTP y HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Verificar estado
ufw status
```

---

## 14. Monitoreo y Logs

### 14.1 Configurar Logrotate para PM2

```bash
# Instalar logrotate
apt install -y logrotate

# Crear configuración para PM2
cat > /etc/logrotate.d/pm2 << EOF
/home/deploy/.pm2/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0640 deploy deploy
}
EOF
```

### 14.2 Monitoreo de Recursos

```bash
# Instalar htop y ncdu
apt install -y htop ncdu

# Monitorear uso
htop          # Uso de CPU y RAM
ncdu          # Uso de disco
```

---

## 15. Checklist de Deployment

| Paso | Tarea | Estado |
|------|-------|--------|
| 1 | Crear LXC en Proxmox | ☐ |
| 2 | Actualizar sistema | ☐ |
| 3 | Instalar PostgreSQL | ☐ |
| 4 | Crear base de datos y usuario | ☐ |
| 5 | Instalar Node.js y pnpm | ☐ |
| 6 | Instalar Ollama (opcional) | ☐ |
| 7 | Clonar repositorio | ☐ |
| 8 | Configurar variables de entorno | ☐ |
| 9 | Instalar dependencias | ☐ |
| 10 | Generar Prisma Client | ☐ |
| 11 | Ejecutar migraciones | ☐ |
| 12 | Build frontend | ☐ |
| 13 | Configurar PM2 | ☐ |
| 14 | Configurar Nginx | ☐ |
| 15 | Configurar SSL | ☐ |
| 16 | Configurar Firewall | ☐ |
| 17 | Verificar funcionamiento | ☐ |

---

## 16. Comandos Rápidos de Referencia

```bash
# Conexión SSH
ssh deploy@tu-dominio.com

# Ver estado de servicios
pm2 status

# Ver logs en tiempo real
pm2 logs --f

# Reiniciar servicios
pm2 restart all

# Actualizar desde Git
cd /home/deploy/secure-proteccion && git pull && pnpm install && cd soterFront && pnpm build && cd ../soterBack && pnpm prisma migrate deploy && cd .. && pm2 restart all

# Backup de base de datos
pg_dump -U soter soter_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar base de datos
psql -U soter soter_db < backup_archivo.sql

# Ver uso de recursos
htop
ncdu -h /

# Verificar SSL
openssl s_client -connect tu-dominio.com:443 -servername tu-dominio.com
```

---

## 17. Solución de Problemas

### 17.1 Backend no conecta a BD
```bash
# Verificar conexión
psql -U soter -d soter_db -h localhost

# Revisar logs de PostgreSQL
tail -f /var/log/postgresql/postgresql-14-main.log
```

### 17.2 Frontend da error 502
```bash
# Verificar que PM2 está corriendo
pm2 status

# Ver logs de PM2
pm2 logs soter-front

# Verificar que Nginx está corriendo
systemctl status nginx
```

### 17.3 Ollama no responde
```bash
# Verificar servicio
systemctl status ollama

# Ver logs
journalctl -u ollama -f

# Probar manualmente
curl http://localhost:11434/api/tags
```

### 17.4 SSL Certificate Error
```bash
# Verificar certificado
certbot certificates

# Renovar manualmente
certbot renew
```

---

## 18. Seguridad Post-Deploy

1. **Cambiar contraseñas** de PostgreSQL y JWT
2. **Configurar fail2ban** para protección SSH
3. **Mantener sistema actualizado**: `apt update && apt upgrade`
4. **Revisar logs** regularmente
5. **Backups automáticos** de la base de datos
6. **Firewall** correctamente configurado

---

## 19. Contacto y Soporte

Para soporte técnico, contacte al equipo de desarrollo con:
- Logs de error relevantes
- Screenshots del problema
- Pasos para reproducir el error
