import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

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

  console.log('Creating test users for each role...');
  const testUsers = [
    { email: 'admin@soter.com', password: 'admin123', name: 'Administrador', lastName: 'Sistema', role: 'ADMIN' },
    { email: 'operador@soter.com', password: 'operador123', name: 'Juan', lastName: 'Operador', role: 'OPERADOR_CENTRO' },
    { email: 'coord.fisica@soter.com', password: 'coorfisica123', name: 'Carlos', lastName: 'Vigilancia', role: 'COORDINADOR_FISICA' },
    { email: 'coord.electronica@soter.com', password: 'coorelectronica123', name: 'María', lastName: 'Electrónica', role: 'COORDINADOR_ELECTRONICA' },
    { email: 'coord.investigaciones@soter.com', password: 'coorinvest123', name: 'Pedro', lastName: 'Investigaciones', role: 'COORDINADOR_INVESTIGACIONES' },
    { email: 'coord.administrativo@soter.com', password: 'cooradmin123', name: 'Ana', lastName: 'Administrativo', role: 'COORDINADOR_ADMINISTRATIVO' },
    { email: 'coord.locativas@soter.com', password: 'coorlocal123', name: 'Luis', lastName: 'Locativas', role: 'COORDINADOR_ACCIONES_LOCALITATIVAS' },
    { email: 'gerente@soter.com', password: 'gerente123', name: 'Roberto', lastName: 'Gerente', role: 'GERENTE_SEGURIDAD' },
    { email: 'escolta@soter.com', password: 'escolta123', name: 'Miguel', lastName: 'Escolta', role: 'ESCOLTA' },
    { email: 'vigilante@soter.com', password: 'vigilante123', name: 'José', lastName: 'Vigilante', role: 'VIGILANTE' },
  ];

  for (const user of testUsers) {
    const hashedPassword = await bcrypt.hash(user.password, 12);
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        email: user.email,
        password: hashedPassword,
        name: user.name,
        lastName: user.lastName,
        phone: '+57 300 000 0000',
        role: user.role as any,
      },
    });
  }
  console.log('Test users created');
  console.log('Test users:');
  for (const user of testUsers) {
    console.log(`  - ${user.email} / ${user.password} (${user.role})`);
  }

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

  console.log('Creating equipment types...');
  const equipmentTypes = [
    // CCTV
    { code: 'CAM-IP', name: 'Cámara IP', description: 'Cámara de vigilancia IP', category: 'CCTV', systemType: 'CCTV' },
    { code: 'CAM-ANALOG', name: 'Cámara Análoga', description: 'Cámara de vigilancia análoga', category: 'CCTV', systemType: 'CCTV' },
    { code: 'CAM-DOME', name: 'Cámara Domo', description: 'Cámara tipo domo para interiores', category: 'CCTV', systemType: 'CCTV' },
    { code: 'CAM-BULLET', name: 'Cámara Bullet', description: 'Cámara tipo bullet para exteriores', category: 'CCTV', systemType: 'CCTV' },
    { code: 'CAM-PTZ', name: 'Cámara PTZ', description: 'Cámara PTZ (Pan-Tilt-Zoom)', category: 'CCTV', systemType: 'CCTV' },
    { code: 'CAM-TERM', name: 'Cámara Térmica', description: 'Cámara con sensor térmico', category: 'CCTV', systemType: 'CCTV' },
    { code: 'NVR', name: 'NVR (Network Video Recorder)', description: 'Grabador de video en red', category: 'CCTV', systemType: 'CCTV' },
    { code: 'DVR', name: 'DVR (Digital Video Recorder)', description: 'Grabador de video digital', category: 'CCTV', systemType: 'CCTV' },
    { code: 'HDD-SURV', name: 'Disco Duro para Videovigilancia', description: 'Disco duro específico para CCTV', category: 'CCTV', systemType: 'CCTV' },
    { code: 'SWITCH-POE', name: 'Switch PoE', description: 'Switch con Power over Ethernet', category: 'CCTV', systemType: 'NETWORK' },
    // Control de Acceso
    { code: 'LECTOR-BIO', name: 'Lector Biométrico', description: 'Lector de huella dactilar o facial', category: 'ACCESS_CONTROL', systemType: 'ACCESS_CONTROL' },
    { code: 'LECTOR-QR', name: 'Lector de Código QR', description: 'Lector de códigos QR', category: 'ACCESS_CONTROL', systemType: 'ACCESS_CONTROL' },
    { code: 'LECTOR-RFID', name: 'Lector RFID', description: 'Lector de tarjeta RFID', category: 'ACCESS_CONTROL', systemType: 'ACCESS_CONTROL' },
    { code: 'CERR-ELECT', name: 'Cerradura Eléctrica', description: 'Cerradura eléctrica para puertas', category: 'ACCESS_CONTROL', systemType: 'ACCESS_CONTROL' },
    { code: 'CONT-AC', name: 'Controlador de Acceso', description: 'Panel controlador de acceso', category: 'ACCESS_CONTROL', systemType: 'ACCESS_CONTROL' },
    { code: 'TARJ-RFID', name: 'Tarjeta RFID', description: 'Tarjeta de acceso RFID', category: 'ACCESS_CONTROL', systemType: 'ACCESS_CONTROL' },
    { code: 'BTN-EXIT', name: 'Botón de Salida', description: 'Botón para salida sin llave', category: 'ACCESS_CONTROL', systemType: 'ACCESS_CONTROL' },
    // Intrusión
    { code: 'PANEL-ALARM', name: 'Panel de Alarmas', description: 'Panel principal del sistema de intrusión', category: 'INTRUSION', systemType: 'INTRUSION' },
    { code: 'SENSOR-MOV', name: 'Sensor de Movimiento', description: 'Sensor PIR de movimiento', category: 'INTRUSION', systemType: 'INTRUSION' },
    { code: 'SENSOR-PUERT', name: 'Sensor de Puerta/Ventana', description: 'Sensor magnético para puertas/ventanas', category: 'INTRUSION', systemType: 'INTRUSION' },
    { code: 'SENSOR-VID', name: 'Sensor de Vibración', description: 'Sensor de rotura de vidrio', category: 'INTRUSION', systemType: 'INTRUSION' },
    { code: 'TECL-ALARM', name: 'Teclado de Alarmas', description: 'Teclado para control de panel', category: 'INTRUSION', systemType: 'INTRUSION' },
    { code: 'SIRENA', name: 'Sirena', description: 'Sirena interior/exterior', category: 'INTRUSION', systemType: 'INTRUSION' },
    // Detección de Incendio
    { code: 'DETECTOR-FUM', name: 'Detector de Humo', description: 'Detector de humo photoeléctrico', category: 'FIRE', systemType: 'FIRE_DETECTION' },
    { code: 'DETECTOR-TEMP', name: 'Detector de Temperatura', description: 'Detector de calor fijo o rate-of-rise', category: 'FIRE', systemType: 'FIRE_DETECTION' },
    { code: 'PANEL-FIRE', name: 'Panel de Detección de Incendio', description: 'Panel central del sistema contra incendios', category: 'FIRE', systemType: 'FIRE_DETECTION' },
    { code: 'EST-FIRE', name: 'Estación Manual de Incendio', description: 'Pulso manual de alarma', category: 'FIRE', systemType: 'FIRE_DETECTION' },
    { code: 'LUZ-EMERG', name: 'Luz de Emergencia', description: 'Luz de evacuación de emergencia', category: 'FIRE', systemType: 'FIRE_DETECTION' },
    // Redes y Conectividad
    { code: 'ROUTER', name: 'Router', description: 'Router de red', category: 'NETWORK', systemType: 'NETWORK' },
    { code: 'SWITCH', name: 'Switch de Red', description: 'Switch gestionable', category: 'NETWORK', systemType: 'NETWORK' },
    { code: 'AP-WIFI', name: 'Access Point WiFi', description: 'Punto de acceso wireless', category: 'NETWORK', systemType: 'NETWORK' },
    { code: 'UPS', name: 'UPS', description: 'Sistema de alimentación ininterrumpida', category: 'NETWORK', systemType: 'NETWORK' },
    { code: 'Fibra-OPT', name: 'Cable de Fibra Óptica', description: 'Cable de fibra óptica', category: 'NETWORK', systemType: 'NETWORK' },
    // Intercomunicación
    { code: 'VIDEO-POR', name: 'Videoportero', description: 'Sistema de videoportero', category: 'INTERCOM', systemType: 'INTERCOM' },
    { code: 'AUDIO-POR', name: 'Portero Eléctrico', description: 'Sistema de audio portero', category: 'INTERCOM', systemType: 'INTERCOM' },
    { code: 'INTERCOM', name: 'Intercomunicador', description: 'Sistema de intercomunicación interno', category: 'INTERCOM', systemType: 'INTERCOM' },
    // Perímetro
    { code: 'CERCO-ELEC', name: 'Cerco Eléctrico', description: 'Sistema de cerco eléctrico', category: 'PERIMETER', systemType: 'PERIMETER' },
    { code: 'SENSOR-CERCO', name: 'Sensor de Cerca', description: 'Sensor de vibración para cerca perimetral', category: 'PERIMETER', systemType: 'PERIMETER' },
    { code: 'CAM-LPR', name: 'Cámara LPR', description: 'Cámara de reconocimiento de placas', category: 'PERIMETER', systemType: 'PERIMETER' },
    // Analítica de Video
    { code: 'AI-VIDEO', name: 'Servidor de Analítica de Video', description: 'Software de analítica de video con IA', category: 'VIDEO_ANALYTICS', systemType: 'VIDEO_ANALYTICS' },
    { code: 'VIDEO-WALL', name: 'Video Wall', description: 'Matriz de monitores para videowall', category: 'VIDEO_ANALYTICS', systemType: 'VIDEO_ANALYTICS' },
    // General/Otro
    { code: 'GABINETE', name: 'Gabinete/Rack', description: 'Gabinete para equipos electrónicos', category: 'GENERAL', systemType: 'GENERAL' },
    { code: 'FUENTE-POD', name: 'Fuente de Poder', description: 'Fuente de alimentación', category: 'GENERAL', systemType: 'GENERAL' },
    { code: 'CABLEADO', name: 'Cableado Estructurado', description: 'Cable de red UTP categoría', category: 'GENERAL', systemType: 'GENERAL' },
  ];

  for (const eqType of equipmentTypes) {
    await prisma.equipmentType.upsert({
      where: { code: eqType.code },
      update: {},
      create: eqType,
    });
  }
  console.log('Equipment types created');

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