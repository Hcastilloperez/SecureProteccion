# SOTER - Plan de Desarrollo

## Control de Versiones

| Fecha | Versión | Descripción |
|-------|---------|-------------|
| 2026-06-13 | 1.0 | Creación del documento |
| 2026-06-18 | 1.1 | Actualización con restructuración de módulos 6 y 6.2 |

---

## MÓDULOS PRINCIPALES

### 1. Backend (soterBack) ✅

- [x] Estructura monorepo con pnpm workspaces
- [x] Schema Prisma con todos los modelos
- [x] Controladores MVC reutilizables (BaseController)
- [x] Autenticación JWT con middleware verify
- [x] Rutas protegidas con control de roles
- [x] Seed con configuración inicial (44 tipos de equipos)

### 2. Frontend (soterFront) ✅

- [x] React + Vite + TypeScript
- [x] Redux Toolkit para estado global
- [x] React Router v6
- [x] Axios con interceptores
- [x] shadcn/ui components
- [x] Layout con sidebar y navegación

---

## CHECKLIST DE MÓDULOS

### 3. Módulo de Minuta (Centro de Seguridad) ✅

- [x] Crear página específica para operadores del Centro de Seguridad
- [x] Vista de timeline/bitácora por incidente
- [x] Capacidad de crear incidente desde la minuta
- [x] Filtros por instalación, tipo, estado, búsqueda
- [x] Panel de estadísticas (abiertos, en progreso, escalados, cerrados)
- [x] Escalamiento a coordinador con comentario
- [ ] Notificaciones de nuevos incidentes (en desarrollo)
- [x] Vista detallada con bitácora completa
- [x] Agregar comentarios internos o públicos a la bitácora

### 4. Módulo de Incidentes ✅

- [x] CRUD básico de incidentes
- [x] Timeline/bitácora con comentarios
- [x] Formulario completo con validación Zod
  - [x] OPEN → Creado por operador
  - [x] VERIFIED → Verificado por operador
  - [x] IN_PROGRESS → En investigación por coordinador
  - [x] ESCALATED → Escalado a Gerente de Seguridad
  - [x] CLOSED → Cerrado con informe final
  - [x] CANCELLED → Cancelado/inválido
- [x] Verificación de incidente (validar/invalidar)
- [x] Escalamiento a coordinador con comentario
- [x] Escalamiento a Gerente de Seguridad
- [x] **Carga de archivos (imágenes, audio, video)**
  - [x] Endpoint para subir archivos (multer)
  - [x] Almacenamiento en servidor
  - [x] Vista de archivos adjuntos
  - [x] Tipos MIME permitidos (images, video, audio, pdf)
- [x] Informe final obligatorio para cerrar
- [x] Integración con IA para recomendaciones (Ollama)
- [x] Traza de información del Centro de Monitoreo (bitácora completa)

### 5. Módulo de Instalaciones ✅

- [x] CRUD básico de instalaciones
- [x] Formulario con validación Zod
- [x] Contactos de emergencia (CRUD)
- [x] Autoridades cercanas (CRUD)
- [x] **Seguridad Electrónica** (Tab dentro de la instalación)
  - [x] CRUD de Subsistemas de Seguridad
  - [x] Asignación de equipos a subsistemas
  - [x] Formulario de instalación con ubicación/IP/MAC/firmware
  - [x] Bitácora automática de movimientos
- [x] **Estudio de Seguridad**
  - [x] Formulario de estudio de seguridad
  - [x] Análisis de amenazas
  - [x] Análisis de vulnerabilidades
  - [x] Recomendaciones
  - [x] nivel de riesgo
  - [x] Integración con IA para generar estudio
- [ ] **Módulo de IA por Instalación**
  - [ ] Análisis predictivo de seguridad
  - [ ] Recomendaciones basadas en historial
  - [ ] Carga de protocolos para estudio
- [x] **Vigilancia Física por Instalación**
  - [x] CRUD de vigilantes por instalación
  - [x] Horarios y turnos
  - [ ] Estado de vigilancia

### 6. Módulo de Seguridad Electrónica ✅
**Tab dentro de InstallationDetailPage (por instalación)**

- [x] CRUD de Subsistemas de Seguridad
- [x] Asignación de equipos a subsistemas (flujo de 2 pasos)
- [x] Formularios con validación Zod
- [x] **Tracking de costos e inversión**
  - [x] Costo por equipo
  - [x] Costo por mantenimiento
  - [x] Historial de inversiones
  - [x] Estadísticas de inversión
- [x] Estados de equipos (STANDBY, ACTIVE, INACTIVE, IN_REPAIR, DECOMMISSIONED)
- [x] Historial de mantenimiento con fechas
- [x] **Bitácora de movimientos**
  - [x] Registro automático al instalar
  - [x] Fecha de instalación
  - [x] Coordenadas (latitud/longitud)
  - [x] IP, MAC, firmware

### 6.2 Módulo de Inventario de Equipos ✅
**Módulo global con KPIs (accesible desde el menú)**

- [x] Catálogo de Tipos de Equipo (44 tipos pre-cargados)
  - [x] CRUD desde Administración
  - [x] Código, nombre, categoría, tipo de sistema
  - [x] CCTV, Control Acceso, Intrusión, Fire, Redes, etc.
- [x] Contratos de Inversión (CRUD)
  - [x] Código, nombre, proveedor
  - [x] Número de contrato/orden
  - [x] Tipo de inversión (compra, arrendamiento, donación, transferencia)
  - [x] Monto total y fechas
- [x] Inventario de Equipos (CRUD)
  - [x] equipmentTypeId asociado al catálogo
  - [x] Nombre, tipo (systemType), marca, modelo, serial
  - [x] Contrato de inversión asociado
  - [x] Fecha de compra y entrega
  - [x] Estado STANDBY (disponible para instalación)
  - [x] IP, MAC, firmware
- [x] **KPIs del Inventario**
  - [x] Total equipos
  - [x] Disponibles (standby/bodega)
  - [x] Instalados (activos)
  - [x] En Reparación
  - [x] Contratos activos
- [x] Movimientos/Bitácora de Equipos
  - [x] Registro de movimientos entre instalaciones
  - [x] Sistema origen y destino
  - [x] Fecha del movimiento
  - [x] Razón y notas
- [x] Historia completa del equipo (timeline)

### 7. Módulo de Seguridad Física ✅

- [x] CRUD de Vigilantes
- [x] Formulario con validación Zod
- [x] Vista por instalación
- [x] Empresas de vigilancia
- [x] Horarios y turnos
- [x] Estadísticas por empresa

Este modulo hace falta la integracion con instalacion



### 8. Módulo de Escoltas y Movilidad ✅

- [x] CRUD de Escoltas
- [x] CRUD de Rutas
- [x] CRUD de Movimientos
- [x] Formularios con validación Zod
- [x] **Movilidad de Funcionarios**
  - [x] Asignación de funcionarios a escoltas
  - [x] Rutas de funcionarios
  - [x] Historial de movimientos
- [x] Timeline de actividad por escolta
- [x] Estados de movimiento (SCHEDULED, STARTED, IN_PROGRESS, PAUSED, COMPLETED, CANCELLED, NO_SHOW)
- [ ] Mapa con seguimiento en tiempo real (pendiente)

### 9. Dashboard 🔲

- [x] Stats básicas (incidentes, instalaciones, vigilantes, escoltas)
- [x] Incidentes recientes
- [x] Incidentes por prioridad
- [x] **Visibilidad por rol**
  - [x] Widgets específicos por rol
  - [x] Estadísticas personalizadas según perfil
- [ ] Gráficos avanzados
- [ ] Incidentes en el mapa
- [ ] Alertas y notificaciones

### 10. Módulo de Administración 🔲

- [x] CRUD de Estados
- [x] CRUD de Tipos de Incidente
- [x] CRUD de Tipos de Equipo (EquipmentType)
- [x] CRUD de Configuraciones
- [x] CRUD de Usuarios
- [x] Formularios con validación Zod
- [x] **CRUD de Roles y Permisos**
  - [x] Crear/editar/eliminar roles
  - [x] Permisos granulares (17 opciones)
  - [x] Asignación de permisos
- [ ] Auditoría de cambios
- [ ] Logs de actividad

### 11. Módulo de IA ✅

- [x] Configuración básica de Ollama
- [x] **Configuración de Ollama desde la UI** (AIPage completa)
  - [x] CRUD de configuraciones
  - [x] Test de conexión en tiempo real
  - [x] Historial de análisis
  - [x] Modelos disponibles
  - [x] Permiso 'ai' por rol
- [x] Endpoint TEST (/ai/configurations/:id/test)
- [x] Análisis de incidentes (existente)
- [x] Recomendaciones de seguridad (existente)
- [x] Estudio de seguridad con IA (existente)
- [x] Análisis de instalación por IA (existente)
- [x] Historial de análisis (en AIPage)
- [x] Modelos configurables (en AIPage)

---

## MEJORAS TÉCNICAS

### 12. Validación de Formularios ✅

- [x] Implementar React Hook Form
- [x] Implementar Zod para validación
- [x] Migrar formularios existentes
- [x] Mensajes de error personalizados
- [x] Validación en tiempo real

### 13. Notificaciones 🔲

- [ ] Sistema de notificaciones
- [ ] Notificaciones por incidente
- [ ] Notificaciones por mantenimiento
- [ ] Notificaciones por movimiento
- [ ] Email notifications (opcional)

### 14. Reportes 🔲

- [ ] Exportar a PDF
- [ ] Exportar a Excel
- [ ] Reporte de incidentes
- [ ] Reporte de mantenimiento
- [ ] Reporte de inversión

### 15. Optimizaciones 🔲

- [ ] Paginación mejorada
- [ ] Búsqueda con debounce
- [ ] Lazy loading de componentes
- [ ] Cache de datos frecuentes
- [ ] Optimización de queries Prisma

---

## DOCUMENTACIÓN

- [x] README.md creado
- [x] Diagrama de arquitectura
- [x] Documentación de API
- [ ] Manual de usuario
- [ ] Documentación de despliegue

---

## ESTADO ACTUAL

```
Leyenda:
✅ Completado
🔲 Pendiente
⚠️ En desarrollo
```

### Resumen

| Categoría | Total | Completados | Pendientes |
|----------|-------|-------------|------------|
| Módulos Principales | 12 | 11 | 1 |
| Mejoras Técnicas | 4 | 1 | 3 |
| Documentación | 2 | 2 | 0 |
| **Total** | **18** | **14** | **4** |

### Porcentaje de Avance: 75%

---

## NOTAS

- El módulo de Minuta es la funcionalidad core para los operadores del Centro de Seguridad
- La carga de archivos es requisito obligatorio para cerrar incidentes
- El dashboard debe ser personalizado según el rol del usuario
- Todos los tipos y estados deben administrarse desde la base de datos, no hardcoded
- Equipos se crean en Inventario con estado STANDBY y se asignan a instalaciones mediante el flujo de 2 pasos

## ACTUALIZACIONES

### 2026-06-15
- Módulo 6 (Seguridad Electrónica) completado con validación Zod en formularios
- Módulo 7 (Seguridad Física) completado con validación Zod
- Módulo 8 (Escoltas y Movilidad) completado con validación Zod
- Módulo 10 (Administración) completado con validación Zod y todos los roles
- Sistema de permisos por rol implementado en frontend
- Menú lateral filtrado según rol del usuario
- Rutas protegidas por permiso
- PhysicalSecurityPage reestructurado con tabs (Empresas, Puestos, Vigilantes)
- Modelo SecurityPost con estados (ACTIVE/INACTIVE/SUSPENDED/PENDING) y puestos adicionales
- Rotación de vigilantes entre puestos mediante securityPostId

### 2026-06-16
- Módulo 4 (Incidentes) completado con validación Zod en formulario
- Campos de latitud/longitud agregados al formulario de incidentes
- Módulo 6.2 (Inventario de Equipos) creado con nuevo flujo:
  - Contratos de Inversión (PURCHASE, LEASE, DONATION, TRANSFER)
  - Equipos con información de compra, instalación y ubicación
  - Movimientos/Bitácora con registro de cambios entre instalaciones
  - Timeline de historia del equipo
- Nuevos modelos Prisma: InvestmentContract, EquipmentMovement
- Equipment actualizado con purchaseDate, installationDate, investmentContractId
- Módulo 8 (Escoltas) mejorado:
  - Nuevo modelo EscortAssignment para asignaciones de funcionarios
  - Estados mejorados: SCHEDULED, STARTED, IN_PROGRESS, PAUSED, COMPLETED, CANCELLED, NO_SHOW
  - Timeline de actividad por escolta
  - Historial completo de movimientos y asignaciones
- Dashboard mejorado con visibilidad por rol:
  - ADMIN/GERENTE_SEGURIDAD: Stats completas de incidentes, instalaciones, tasa de cierre
  - COORDINADOR_FISICA: Stats de vigilantes, escoltas, sistemas activos, equipos
  - COORDINADOR_ELECTRONICA: Stats de equipos, mantenimientos, inventario
  - OPERADOR_CENTRO: Stats de incidentes abiertos y casos cerrados
  - ESCOLTA: Movimientos del día, en progreso, programados
- Nuevos endpoints de stats: /admin/maintenance/stats, /inventory/stats

### 2026-06-17
- Reestructuración de módulos de Seguridad Electrónica e Inventario:
  - "Seguridad Electrónica" ahora es TAB dentro de InstallationDetailPage (por instalación)
  - "Inventario de Equipos" ahora es módulo GLOBAL con KPIs
  - ElectronicInventoryPage actualizado con tarjetas de estadísticas
  - ElectronicSecurityPage convertido en componente reusable para InstallationDetailPage
- Módulo de Administración completado:
  - CRUD de Roles y Permisos
  - Permisos granulares con 17 opciones configurables
  - Formulario de permisos con checkboxes

### 2026-06-18
- Reestructuración completa del flujo de Equipos e Inventario:
  - EquipmentType como catálogo administrado (44 tipos pre-cargados)
  - Equipos nuevos entran con estado STANDBY (disponible/bodega)
  - Campos nuevos: deliveryDate, latitude, longitude
  - Flujo de 2 pasos para asignar equipos:
    1. Selector de equipo disponible filtrado por tipo de equipo
    2. Formulario de instalación (ubicación, IP, MAC, firmware, coordenadas)
  - Bitácora automática al instalar (movimiento registrado)
  - KPIs de inventario actualizados: Total, Disponibles, Instalados, En Reparación, Contratos
  - ElectronicInventoryPage ahora carga equipmentTypes para formularios
  - Campo "Tipo de Equipo" en inventario muestra catálogo completo
  - Auto-populate del campo type (systemType) al seleccionar equipmentTypeId

### 2026-06-18 (continuación) - Módulo de IA Completado
- AIPage creada con interfaz completa:
  - Dashboard de IA con KPIs (configuraciones, activas, análisis, modelo)
  - CRUD de configuraciones de Ollama
  - Test de conexión en tiempo real
  - Historial de análisis IA
  - Modelos disponibles con recomendaciones
- Endpoint TEST implementado (/ai/configurations/:id/test)
- Permiso 'ai' agregado a roles: ADMIN, GERENTE_SEGURIDAD, COORDINADOR_ELECTRONICA
- Menú lateral actualizado con opción "Inteligencia Artificial"
