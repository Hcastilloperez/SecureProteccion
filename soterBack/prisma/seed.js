"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Starting seed...');
    console.log('Creating roles...');
    const roles = [
        {
            name: 'Administrador',
            description: 'Administrador del sistema',
            permissions: { all: true },
        },
        {
            name: 'Gerente de Seguridad',
            description: 'Gerente del departamento de seguridad',
            permissions: { incidents: true, reports: true, users: true },
        },
        {
            name: 'Operador Centro de Seguridad',
            description: 'Operador del centro de monitoreo',
            permissions: { incidents: true, minuta: true },
        },
        {
            name: 'Coordinador Seguridad Física',
            description: 'Coordinador de vigilantes y seguridad física',
            permissions: { incidents: true, physicalSecurity: true },
        },
        {
            name: 'Coordinador Seguridad Electrónica',
            description: 'Coordinador de sistemas electrónicos',
            permissions: { incidents: true, electronicSecurity: true },
        },
        {
            name: 'Coordinador de Investigaciones',
            description: 'Coordinador de investigaciones',
            permissions: { incidents: true, investigations: true },
        },
        {
            name: 'Escolta',
            description: 'Escolta de protección',
            permissions: { movements: true },
        },
    ];
    for (const role of roles) {
        await prisma.role.upsert({
            where: { name: role.name },
            update: {},
            create: role,
        });
    }
    console.log('Roles created');
    console.log('Creating incident statuses...');
    const incidentStatuses = [
        { code: 'OPEN', name: 'Abierto', type: 'INCIDENT', description: 'Incidente recién reportado por el operador', order: 1 },
        { code: 'VERIFIED', name: 'Verificado', type: 'INCIDENT', description: 'Incidente verificado por el operador, listo para escalar', order: 2 },
        { code: 'IN_PROGRESS', name: 'En Investigación', type: 'INCIDENT', description: 'Coordinador investigando el incidente', order: 3 },
        { code: 'ESCALATED', name: 'Escalado', type: 'INCIDENT', description: 'Incidente escalado a Gerente de Seguridad', order: 4 },
        { code: 'CLOSED', name: 'Cerrado', type: 'INCIDENT', description: 'Incidente resuelto y cerrado con informe final', order: 5 },
        { code: 'CANCELLED', name: 'Cancelado', type: 'INCIDENT', description: 'Incidente cancelado/invalido', order: 6 },
    ];
    for (const status of incidentStatuses) {
        await prisma.status.upsert({
            where: { code: status.code },
            update: {},
            create: status,
        });
    }
    console.log('Incident statuses created');
    console.log('Creating installation statuses...');
    const installationStatuses = [
        { code: 'ACTIVE', name: 'Activa', type: 'INSTALLATION', description: 'Instalación activa', order: 1 },
        { code: 'INACTIVE', name: 'Inactiva', type: 'INSTALLATION', description: 'Instalación inactiva', order: 2 },
        { code: 'IN_MAINTENANCE', name: 'En Mantenimiento', type: 'INSTALLATION', description: 'Instalación en mantenimiento', order: 3 },
    ];
    for (const status of installationStatuses) {
        await prisma.status.upsert({
            where: { code: status.code },
            update: {},
            create: status,
        });
    }
    console.log('Installation statuses created');
    console.log('Creating incident types...');
    const incidentTypes = [
        { code: 'ROB', name: 'Robo', category: 'SEGURIDAD', description: 'Robo o intento de robo', slaHours: 24 },
        { code: 'intrusion', name: 'Intrusión', category: 'SEGURIDAD', description: 'Intrusión no autorizada', slaHours: 12 },
        { code: 'FIRE', name: 'Incendio', category: 'EMERGENCIA', description: 'Incendio o conato de incendio', slaHours: 1 },
        { code: 'ACCIDENT', name: 'Accidente', category: 'SALUD', description: 'Accidente laboral o vehicular', slaHours: 4 },
        { code: 'FIGHT', name: 'Pelea', category: 'CONDUCTA', description: 'Pelea o altercado', slaHours: 2 },
        { code: 'THEFT', name: 'Hurto', category: 'SEGURIDAD', description: 'Hurto de pertenencias', slaHours: 24 },
        { code: 'VANDALISM', name: 'Vandalismo', category: 'DAÑOS', description: 'Daños por vandalismo', slaHours: 48 },
        { code: 'LOST_ITEM', name: 'Objeto Perdido', category: 'OTROS', description: 'Objeto perdido o encontrado', slaHours: 72 },
        { code: 'MAINTENANCE', name: 'Mantenimiento', category: 'OPERATIVO', description: 'Solicitud de mantenimiento', slaHours: 168 },
        { code: 'ACCESS', name: 'Control de Acceso', category: 'OPERATIVO', description: 'Problemas de control de acceso', slaHours: 24 },
        { code: 'ELECTRONIC', name: 'Falla Electrónica', category: 'MANTENIMIENTO', description: 'Falla en sistemas electrónicos', slaHours: 12 },
        { code: 'OTHER', name: 'Otro', category: 'OTROS', description: 'Otro tipo de incidente', slaHours: 48 },
    ];
    for (const type of incidentTypes) {
        await prisma.incidentType.upsert({
            where: { code: type.code },
            update: {},
            create: type,
        });
    }
    console.log('Incident types created');
    console.log('Creating configurations...');
    const configurations = [
        { key: 'COMPANY_NAME', value: 'SOTER', type: 'string', description: 'Nombre de la empresa', isPublic: true, category: 'general' },
        { key: 'COMPANY_PHONE', value: '+57 300 123 4567', type: 'string', description: 'Teléfono de la empresa', isPublic: true, category: 'general' },
        { key: 'COMPANY_EMAIL', value: 'seguridad@soter.com', type: 'string', description: 'Email de la empresa', isPublic: true, category: 'general' },
        { key: 'OLLAMA_MODEL', value: 'llama3', type: 'string', description: 'Modelo de IA a usar', isPublic: false, category: 'ai' },
        { key: 'OLLAMA_BASE_URL', value: 'http://localhost:11434', type: 'string', description: 'URL base de Ollama', isPublic: false, category: 'ai' },
        { key: 'OLLAMA_TEMPERATURE', value: '0.7', type: 'number', description: 'Temperatura de IA', isPublic: false, category: 'ai' },
        { key: 'MAX_FILE_SIZE', value: '52428800', type: 'number', description: 'Tamaño máximo de archivo en bytes', isPublic: false, category: 'upload' },
        { key: 'ALLOWED_FILE_TYPES', value: 'image/*,video/*,audio/*,application/pdf', type: 'string', description: 'Tipos de archivo permitidos', isPublic: false, category: 'upload' },
        { key: 'INCIDENT_AUTO_CLOSE_DAYS', value: '30', type: 'number', description: 'Días para cierre automático de incidentes', isPublic: false, category: 'incident' },
        { key: 'SLA_HIGH_PRIORITY_HOURS', value: '4', type: 'number', description: 'SLA para prioridad alta en horas', isPublic: false, category: 'incident' },
        { key: 'SLA_CRITICAL_PRIORITY_HOURS', value: '1', type: 'number', description: 'SLA para prioridad crítica en horas', isPublic: false, category: 'incident' },
    ];
    for (const config of configurations) {
        await prisma.configuration.upsert({
            where: { key: config.key },
            update: {},
            create: config,
        });
    }
    console.log('Configurations created');
    console.log('Creating AI configurations...');
    await prisma.aIConfiguration.upsert({
        where: { id: 'default' },
        update: {},
        create: {
            id: 'default',
            name: 'Configuración Principal',
            model: 'llama3',
            baseUrl: 'http://localhost:11434',
            temperature: 0.7,
            maxTokens: 512,
            isActive: true,
        },
    });
    console.log('AI configurations created');
    console.log('Creating admin user...');
    const adminPassword = await bcryptjs_1.default.hash('admin123', 12);
    await prisma.user.upsert({
        where: { email: 'admin@soter.com' },
        update: {},
        create: {
            email: 'admin@soter.com',
            password: adminPassword,
            name: 'Administrador',
            lastName: 'Sistema',
            phone: '+57 300 000 0000',
            role: 'ADMIN',
        },
    });
    console.log('Admin user created (email: admin@soter.com, password: admin123)');
    console.log('Creating sample installation...');
    await prisma.installation.upsert({
        where: { id: 'sample-installation' },
        update: {},
        create: {
            id: 'sample-installation',
            name: 'Sede Principal',
            address: 'Calle 100 # 15-45',
            city: 'Bogotá',
            department: 'Cundinamarca',
            latitude: 4.711,
            longitude: -74.0721,
            description: 'Sede principal de la empresa',
            status: 'ACTIVE',
        },
    });
    console.log('Sample installation created');
    console.log('Creating sample contacts...');
    const contacts = [
        { name: 'Juan Pérez', position: 'Director de Seguridad', phone: '+57 300 111 1111', isEmergency: true },
        { name: 'María López', position: 'Coordinadora de Turno', phone: '+57 300 222 2222', isEmergency: true },
        { name: 'Carlos García', position: 'Jefe de Mantenimiento', phone: '+57 300 333 3333', isEmergency: false },
    ];
    for (const contact of contacts) {
        await prisma.contact.upsert({
            where: { id: `contact-${contact.phone}` },
            update: {},
            create: {
                id: `contact-${contact.phone}`,
                installationId: 'sample-installation',
                ...contact,
            },
        });
    }
    console.log('Sample contacts created');
    console.log('Creating sample authorities...');
    const authorities = [
        { name: 'Policía Nacional', type: 'POLICIA', phone: '123', distance: 2.5, responseTime: '10 min' },
        { name: 'Bomberos Bogotá', type: 'BOMBEROS', phone: '119', distance: 3.0, responseTime: '15 min' },
        { name: 'Hospital Central', type: 'HOSPITAL', phone: '1234', distance: 4.0, responseTime: '20 min' },
        { name: 'Ejército Nacional', type: 'EJERCITO', phone: '147', distance: 5.0, responseTime: '30 min' },
    ];
    for (const authority of authorities) {
        await prisma.authority.upsert({
            where: { id: `authority-${authority.name.replace(/\s/g, '-')}` },
            update: {},
            create: {
                id: `authority-${authority.name.replace(/\s/g, '-')}`,
                installationId: 'sample-installation',
                ...authority,
            },
        });
    }
    console.log('Sample authorities created');
    console.log('Seed completed successfully!');
}
main()
    .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map