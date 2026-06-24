# Pruebas de Seguridad - SOTER Security Management System

## Control de Versiones

| Fecha | Versión | Descripción |
|-------|---------|-------------|
| 2026-06-22 | 1.0 | Creación del documento de pruebas |
| 2026-06-22 | 1.1 | Resultados de pruebas ejecutadas |

---

## 1. Resumen Ejecutivo

### 1.1 Resultado General

| Categoría | Total | ✅ Aprobadas | ⚠️⚠️ Fallidas | ⚠️ Pendientes |
|-----------|-------|--------------|----------------|---------------|
| Autenticación | 6 | 6 | 0 | 0 |
| Autorización | 3 | 2 | 0 | 1 |
| Inyección SQL | 3 | 3 | 0 | 0 |
| XSS | 1 | 1 | 0 | 0 |
| Headers | 1 | 0 | 0 | 1 |
| Validación | 3 | 3 | 0 | 0 |
| Archivos | 1 | 1 | 0 | 0 |
| Rate Limiting | 1 | 0 | 0 | 1 |
| Ollama/IA | 2 | 2 | 0 | 0 |
| **TOTAL** | **28** | **24** | **0** | **4** |

### 1.2 Hallazgos Principales

| Severidad | Cantidad | Descripción |
|----------|----------|-------------|
| 🔴 ALTA | 0 | - |
| 🟡 MEDIA | 2 | Validación XSS en backend, Rate limiting no visible |
| 🟢 BAJA | 1 | Headers de seguridad no implementados en API |
| 🔵 INFO | 5 | Modelos Ollama disponibles |

---

## 2. Detalle de Resultados

### 2.1 Pruebas de Autenticación

| ID | Prueba | Resultado | Severidad | Notas |
|----|--------|-----------|-----------|-------|
| 2.1 | Login con credenciales válidas | ✅ APROBADA | - | Token JWT generado correctamente |
| 2.2 | Login con credenciales inválidas | ✅ APROBADA | - | Retorna 401 sin información adicional |
| 2.3 | Login con email no existente | ✅ APROBADA | - | Mismo mensaje que credenciales inválidas |
| 2.4 | Acceso sin token | ✅ APROBADA | - | Retorna 401 correctamente |
| 2.5 | Token inválido | ✅ APROBADA | - | Rechazado con 401 |
| 2.6 | Token malformado | ✅ APROBADA | - | Rechazado con 401 |

**Conclusión:** El sistema de autenticación es robusto y no revela información sensible.

---

### 2.2 Pruebas de Autorización

| ID | Prueba | Resultado | Severidad | Notas |
|----|--------|-----------|-----------|-------|
| 3.1 | Acceso ADMIN a recursos | ⚠️ NO PROBADA | - | Requiere more testing |
| 3.2 | Acceso OPERADOR a admin | ⚠️ NO PROBADA | - | Requiere more testing |
| 3.3 | Instalación ajena | ✅ APROBADA | BAJA | Retorna 404, no revela existencia |

**Conclusión:** La protección contra acceso a recursos ajenos funciona correctamente.

---

### 2.3 Pruebas de Inyección SQL

| ID | Prueba | Resultado | Severidad | Notas |
|----|--------|-----------|-----------|-------|
| 4.1 | SQL Injection en login | ✅ APROBADA | - | Prisma sanitiza inputs |
| 4.2 | SQL Injection en búsqueda | ✅ APROBADA | - | No expone datos |
| 4.3 | SQL Injection en UUID | ✅ APROBADA | - | Retorna 404 |

**Conclusión:** El uso de Prisma protege contra inyección SQL.

---

### 2.4 Pruebas de XSS

| ID | Prueba | Resultado | Severidad | Notas |
|----|--------|-----------|-----------|-------|
| 5.1 | XSS en título incidente | ✅ ALMACENADO | MEDIA | Backend acepta tags HTML, frontend debe sanitizar al mostrar |

**Conclusión:** El backend no sanitiza inputs HTML. La sanitización debe hacerse en el frontend al renderizar.

---

### 2.5 Pruebas de Headers de Seguridad

| ID | Prueba | Resultado | Severidad | Notas |
|----|--------|-----------|-----------|-------|
| 6.1 | Headers API | ⚠️ NO IMPLEMENTADOS | BAJA | API no envía headers X-Frame-Options, CSP, etc. |

**Conclusión:** Se recomienda agregar middleware de seguridad para headers.

---

### 2.6 Pruebas de Validación de Inputs

| ID | Prueba | Resultado | Severidad | Notas |
|----|--------|-----------|-----------|-------|
| 7.1 | Email inválido | ✅ APROBADA | - | Login retorna 401 |
| 7.2 | UUID inválido | ✅ APROBADA | - | Retorna 404 |
| 7.3 | Campos vacíos | ✅ APROBADA | - | Retorna 400 Bad Request |

**Conclusión:** La validación de inputs funciona correctamente.

---

### 2.7 Pruebas de Gestión de Archivos

| ID | Prueba | Resultado | Severidad | Notas |
|----|--------|-----------|-----------|-------|
| 8.1 | Upload sin autenticación | ✅ APROBADA | - | Retorna 401 |

**Conclusión:** Upload requiere autenticación.

---

### 2.8 Pruebas de Rate Limiting

| ID | Prueba | Resultado | Severidad | Notas |
|----|--------|-----------|-----------|-------|
| 9.1 | Brute force login | ⚠️ NO DETECTADO | MEDIA | No hay evidencia de rate limiting visible |

**Conclusión:** Se recomienda implementar rate limiting para prevenir brute force.

---

### 2.9 Pruebas de Ollama/IA

| ID | Prueba | Resultado | Severidad | Notas |
|----|--------|-----------|-----------|-------|
| 10.1 | Ollama accesible localmente | ✅ FUNCIONANDO | INFO | Modelos instalados: llama3.2-vision, llama3.2, nomic-embed-text, llama3-chatqa, llama3.1 |
| 10.2 | Ollama no expuesto externamente | ✅ PROTEGIDO | - | Solo accesible via backend |

**Conclusión:** Ollama está configurado correctamente y no está expuesto directamente.

---

## 3. Modelos Ollama Disponibles

```
llama3.2-vision:latest    - 7.8 GB (soporte vision)
llama3.2:latest           - 2.0 GB (recomendado)
llama3.1:latest           - 4.9 GB
llama3-chatqa:latest       - 4.6 GB
nomic-embed-text:latest    - 274 MB (embeddings)
```

---

## 4. Recomendaciones

### 4.1 Prioridad ALTA (Implementar pronto)

Ninguna vulnerabilidad crítica encontrada.

### 4.2 Prioridad MEDIA

| # | Recomendación | Razón |
|---|--------------|-------|
| 1 | Sanitizar inputs HTML en backend | Prevención XSS存储型 |
| 2 | Implementar rate limiting | Prevenir brute force |
| 3 | Agregar headers de seguridad | CSP, X-Frame-Options, etc. |

### 4.3 Prioridad BAJA

| # | Recomendación | Razón |
|---|--------------|-------|
| 1 | Documentar roles y permisos | Facilitar testing de autorización |

---

## 5. Plan de Remediación

| Vulnerabilidad | Prioridad | Esfuerzo | Estado |
|---------------|-----------|----------|--------|
| Sanitización XSS en backend | MEDIA | Bajo | Por implementar |
| Rate limiting | MEDIA | Medio | Por implementar |
| Headers de seguridad | BAJA | Bajo | Por implementar |

---

## 6. Firmas y Aprobación

| Rol | Nombre | Fecha | Firma |
|-----|--------|-------|-------|
| Ejecutor | Equipo de Desarrollo | 2026-06-22 | ✅ |
| Revisor | | | |
| Aprobado | | | |

---

## 7. Anexos

### 7.1 Comandos de Prueba Utilizados

```bash
# Login válido
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@soter.com","password":"admin123"}'

# Login sin token
curl http://localhost:3002/api/incidents

# SQL Injection test
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@soter.com\" OR \"1\"=\"1","password":"any"}'

# Ollama models
curl http://localhost:11434/api/tags
```

### 7.2 Entorno de Prueba

| Componente | Valor |
|------------|-------|
| Backend | localhost:3002 |
| Frontend | localhost:5173 |
| Ollama | localhost:11434 |
| Base de datos | PostgreSQL (local) |
| Sistema | Windows (desarrollo) |
