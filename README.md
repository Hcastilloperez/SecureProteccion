# SOTER - Sistema de Gestión de Seguridad

Sistema de gestión de seguridad empresarial con backend Node.js/Express/TypeScript, frontend React/Vite/TypeScript y base de datos PostgreSQL con Prisma.

## Estructura del Proyecto

```
soter-monorepo/
├── soterBack/           # Backend (Express + TypeScript + Prisma)
│   ├── src/
│   │   ├── config/      # Configuración de la aplicación
│   │   ├── controllers/ # Controladores (MVC)
│   │   ├── middleware/  # Middlewares (auth, validation)
│   │   ├── routes/      # Rutas de la API
│   │   ├── services/    # Servicios reutilizables
│   │   ├── types/       # Tipos TypeScript
│   │   └── index.ts     # Punto de entrada
│   └── prisma/
│       ├── schema.prisma # Esquema de la base de datos
│       └── seed.ts      # Script de inicialización
├── soterFront/         # Frontend (React + Vite + TypeScript)
│   ├── src/
│   │   ├── components/ # Componentes UI
│   │   ├── config/     # Configuración (axios)
│   │   ├── pages/      # Páginas
│   │   ├── redux/      # Estado global
│   │   ├── services/   # Servicios API
│   │   ├── types/      # Tipos TypeScript
│   │   └── app/        # Componente principal y rutas
│   └── ...
├── package.json       # Workspace raíz
└── pnpm-workspace.yaml
```

## Requisitos Previos

- Node.js 18+
- pnpm 8+
- PostgreSQL 15+ con extensión pgvector
- Ollama (opcional, para funciones de IA)

## Instalación

1. Instalar dependencias:
```bash
pnpm install
```

2. Configurar variables de entorno en `soterBack/.env`:
```env
DATABASE_URL="postgresql://user:password@host:5432/soter"
JWT_SECRET="tu-secreto-jwt"
PORT=3001
OLLAMA_BASE_URL="http://localhost:11434"
OLLAMA_MODEL="llama3"
```

3. Generar cliente Prisma y ejecutar migraciones:
```bash
cd soterBack
pnpm db:push
pnpm db:seed
```

4. Iniciar el servidor de desarrollo:
```bash
pnpm dev
```

## Scripts Disponibles

### Raíz
- `pnpm dev` - Inicia ambos proyectos en paralelo
- `pnpm dev:back` - Solo backend
- `pnpm dev:front` - Solo frontend
- `pnpm build` - Compila ambos proyectos

### Backend (soterBack)
- `pnpm dev` - Servidor de desarrollo con hot-reload
- `pnpm build` - Compila TypeScript
- `pnpm start` - Inicia el servidor de producción
- `pnpm db:migrate` - Ejecuta migraciones
- `pnpm db:push` - Sincroniza esquema con DB
- `pnpm db:seed` - Ejecuta script de inicialización
- `pnpm db:studio` - Abre Prisma Studio

### Frontend (soterFront)
- `pnpm dev` - Servidor de desarrollo
- `pnpm build` - Compila para producción
- `pnpm preview` - Vista previa de producción

## Credenciales de Prueba

Después de ejecutar el seed:
- **Email:** admin@soter.com
- **Contraseña:** admin123

## Roles del Sistema

| Rol | Descripción |
|-----|-------------|
| ADMIN | Administrador del sistema |
| GERENTE_SEGURIDAD | Gerente de seguridad |
| OPERADOR_CENTRO | Operador del centro de monitoreo |
| COORDINADOR_FISICA | Coordinador de seguridad física |
| COORDINADOR_ELECTRONICA | Coordinador de seguridad electrónica |
| COORDINADOR_INVESTIGACIONES | Coordinador de investigaciones |
| ESCOLTA | Escolta de protección |
| VIGILANTE | Vigilante de seguridad |

## API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `GET /api/auth/profile` - Perfil del usuario

### Incidentes
- `GET /api/incidents` - Listar incidentes
- `GET /api/incidents/:id` - Detalle de incidente
- `POST /api/incidents` - Crear incidente
- `PUT /api/incidents/:id` - Actualizar incidente
- `POST /api/incidents/:id/timeline` - Agregar comentario
- `POST /api/incidents/:id/close` - Cerrar incidente
- `POST /api/incidents/:id/escalate` - Escalar incidente
- `GET /api/incidents/stats` - Estadísticas

### Instalaciones
- `GET /api/installations` - Listar instalaciones
- `GET /api/installations/:id` - Detalle de instalación
- `POST /api/installations` - Crear instalación
- `PUT /api/installations/:id` - Actualizar instalación
- `GET /api/installations/:id/contacts` - Contactos de emergencia
- `GET /api/installations/:id/authorities` - Autoridades cercanas
- `GET /api/installations/:id/security-systems` - Sistemas de seguridad

### Administración
- `GET /api/admin/statuses` - Estados configurables
- `GET /api/admin/incident-types` - Tipos de incidente
- `GET /api/admin/configurations` - Configuraciones
- `GET /api/admin/dashboard/stats` - Estadísticas del dashboard
- `GET /api/admin/users` - Gestión de usuarios

### Seguridad Electrónica
- `GET /api/electronic-security/systems` - Sistemas
- `GET /api/electronic-security/equipments` - Equipos
- `GET /api/electronic-security/maintenance` - Mantenimientos
- `GET /api/electronic-security/stats` - Estadísticas de inventario

### Escoltas
- `GET /api/escorts/escorts` - Listar escoltas
- `GET /api/escorts/routes` - Rutas
- `GET /api/escorts/movements` - Movimientos
- `GET /api/escorts/movements/today` - Movimientos del día

### IA
- `POST /api/ai/analyze` - Analizar incidente
- `POST /api/ai/security-study` - Generar estudio de seguridad
- `GET /api/ai/recommendations` - Recomendaciones

## Módulos Implementados

1. **Módulo de Minuta** - Bitácora con timeline de comentarios
2. **Módulo de Incidentes** - Gestión completa con escalamiento y cierre
3. **Seguridad Electrónica** - Inventario de sistemas y equipos
4. **Instalaciones** - Gestión de instalaciones protegidas
5. **Seguridad Física** - Inventario de vigilantes
6. **Movilidad/Escoltas** - Rutas y movimientos de escoltas
7. **Dashboard** - Estadísticas según perfil
8. **Administración** - CRUD de estados, tipos y configuraciones

## Funcionalidades de IA

El sistema se integra con Ollama para:
- Análisis predictivo de incidentes
- Recomendaciones de seguridad
- Generación de estudios de seguridad
- Análisis de vulnerabilidades

## Licencia

Privado - Todos los derechos reservados