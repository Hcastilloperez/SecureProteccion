"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.incidentController = exports.IncidentController = void 0;
const database_1 = __importDefault(require("../config/database"));
class IncidentController {
    async getAll(req, res) {
        try {
            const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
            const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '20'), 10)));
            const skip = (page - 1) * limit;
            const where = {};
            if (req.query.status) {
                const statusParam = String(req.query.status);
                if (statusParam.includes(',')) {
                    const statusCodes = statusParam.split(',');
                    const statuses = await database_1.default.status.findMany({
                        where: { code: { in: statusCodes }, type: 'INCIDENT' },
                    });
                    where.statusId = { in: statuses.map(s => s.id) };
                }
                else {
                    const status = await database_1.default.status.findFirst({
                        where: { code: statusParam, type: 'INCIDENT' },
                    });
                    if (status) {
                        where.statusId = status.id;
                    }
                }
            }
            if (req.query.incidentTypeId) {
                where.incidentTypeId = req.query.incidentTypeId;
            }
            if (req.query.installationId) {
                where.installationId = req.query.installationId;
            }
            if (req.query.priority) {
                where.priority = req.query.priority;
            }
            if (req.query.search) {
                where.OR = [
                    { title: { contains: String(req.query.search), mode: 'insensitive' } },
                    { description: { contains: String(req.query.search), mode: 'insensitive' } },
                ];
            }
            const userRole = req.user?.role;
            const userId = req.user?.userId;
            const coordinatorRoles = [
                'COORDINADOR_FISICA',
                'COORDINADOR_ELECTRONICA',
                'COORDINADOR_INVESTIGACIONES',
                'COORDINADOR_ADMINISTRATIVO',
                'COORDINADOR_ACCIONES_LOCALITATIVAS',
            ];
            if (userRole && coordinatorRoles.includes(userRole) && userId) {
                where.assignedToId = userId;
            }
            const [data, total] = await Promise.all([
                database_1.default.incident.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        incidentType: true,
                        installation: true,
                        status: true,
                        assignedTo: {
                            select: { id: true, name: true, lastName: true, email: true, role: true },
                        },
                        _count: {
                            select: { timelines: true, attachments: true },
                        },
                    },
                }),
                database_1.default.incident.count({ where }),
            ]);
            res.json({
                success: true,
                data,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            });
        }
        catch (error) {
            console.error('Error fetching incidents:', error);
            res.status(500).json({ success: false, error: 'Error al obtener incidentes' });
        }
    }
    async getById(req, res) {
        try {
            const { id } = req.params;
            const incident = await database_1.default.incident.findUnique({
                where: { id },
                include: {
                    incidentType: true,
                    installation: true,
                    status: true,
                    assignedTo: {
                        select: { id: true, name: true, lastName: true, email: true, role: true },
                    },
                    timelines: {
                        include: {
                            user: {
                                select: { id: true, name: true, lastName: true, role: true },
                            },
                        },
                        orderBy: { createdAt: 'asc' },
                    },
                    attachments: true,
                    recommendations: true,
                },
            });
            if (!incident) {
                res.status(404).json({ success: false, error: 'Incidente no encontrado' });
                return;
            }
            res.json({ success: true, data: incident });
        }
        catch (error) {
            console.error('Error fetching incident:', error);
            res.status(500).json({ success: false, error: 'Error al obtener incidente' });
        }
    }
    async create(req, res) {
        try {
            const userId = req.user?.userId;
            const { title, description, incidentTypeId, installationId, priority, location, latitude, longitude, reportedBy, } = req.body;
            if (!title || !description || !incidentTypeId || !installationId || !reportedBy) {
                res.status(400).json({ success: false, error: 'Campos requeridos faltantes' });
                return;
            }
            const openStatus = await database_1.default.status.findFirst({
                where: { code: 'OPEN', type: 'INCIDENT' },
            });
            if (!openStatus) {
                res.status(400).json({ success: false, error: 'Estado inicial no configurado' });
                return;
            }
            const incident = await database_1.default.incident.create({
                data: {
                    title,
                    description,
                    incidentTypeId,
                    installationId,
                    statusId: openStatus.id,
                    priority: priority || 'MEDIUM',
                    location,
                    latitude,
                    longitude,
                    reportedBy,
                    timelines: {
                        create: {
                            userId: userId,
                            comment: 'Incidente creado',
                            isInternal: false,
                        },
                    },
                },
                include: {
                    incidentType: true,
                    installation: true,
                    status: true,
                },
            });
            res.status(201).json({ success: true, data: incident });
        }
        catch (error) {
            console.error('Error creating incident:', error);
            res.status(500).json({ success: false, error: 'Error al crear incidente' });
        }
    }
    async update(req, res) {
        try {
            const { id } = req.params;
            const { title, description, incidentTypeId, priority, statusId, assignedToId, location, latitude, longitude, } = req.body;
            const incident = await database_1.default.incident.update({
                where: { id },
                data: {
                    ...(title && { title }),
                    ...(description && { description }),
                    ...(incidentTypeId && { incidentTypeId }),
                    ...(priority && { priority }),
                    ...(statusId && { statusId }),
                    ...(assignedToId !== undefined && { assignedToId }),
                    ...(location && { location }),
                    ...(latitude !== undefined && { latitude }),
                    ...(longitude !== undefined && { longitude }),
                },
                include: {
                    incidentType: true,
                    installation: true,
                    status: true,
                    assignedTo: {
                        select: { id: true, name: true, lastName: true, email: true, role: true },
                    },
                },
            });
            res.json({ success: true, data: incident });
        }
        catch (error) {
            console.error('Error updating incident:', error);
            res.status(500).json({ success: false, error: 'Error al actualizar incidente' });
        }
    }
    async addTimeline(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?.userId;
            const { comment, isInternal } = req.body;
            if (!comment) {
                res.status(400).json({ success: false, error: 'Comentario requerido' });
                return;
            }
            const timeline = await database_1.default.incidentTimeline.create({
                data: {
                    incidentId: id,
                    userId: userId,
                    comment,
                    isInternal: isInternal || false,
                },
                include: {
                    user: {
                        select: { id: true, name: true, lastName: true, role: true },
                    },
                },
            });
            res.status(201).json({ success: true, data: timeline });
        }
        catch (error) {
            console.error('Error adding timeline:', error);
            res.status(500).json({ success: false, error: 'Error al agregar comentario' });
        }
    }
    async close(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?.userId;
            const { finalReport } = req.body;
            if (!finalReport) {
                res.status(400).json({ success: false, error: 'Informe final es requerido para cerrar' });
                return;
            }
            const closedStatus = await database_1.default.status.findFirst({
                where: { code: 'CLOSED', type: 'INCIDENT' },
            });
            if (!closedStatus) {
                res.status(400).json({ success: false, error: 'Estado cerrado no configurado' });
                return;
            }
            const incident = await database_1.default.incident.update({
                where: { id },
                data: {
                    statusId: closedStatus.id,
                    finalReport,
                    closedAt: new Date(),
                    closedById: userId,
                },
                include: {
                    incidentType: true,
                    installation: true,
                    status: true,
                },
            });
            await database_1.default.incidentTimeline.create({
                data: {
                    incidentId: id,
                    userId: userId,
                    comment: 'Incidente cerrado',
                    isInternal: false,
                },
            });
            res.json({ success: true, data: incident });
        }
        catch (error) {
            console.error('Error closing incident:', error);
            res.status(500).json({ success: false, error: 'Error al cerrar incidente' });
        }
    }
    async escalate(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?.userId;
            const { assignedToId, comment } = req.body;
            if (!assignedToId) {
                res.status(400).json({ success: false, error: 'Grupo o usuario es requerido' });
                return;
            }
            const incident = await database_1.default.incident.findUnique({
                where: { id },
                include: { status: true, incidentType: true },
            });
            if (!incident) {
                res.status(404).json({ success: false, error: 'Incidente no encontrado' });
                return;
            }
            let actualAssignedToId = assignedToId;
            let escalationComment = comment || 'Incidente escalado';
            const isRoleGroup = assignedToId.includes('COORDINADOR') || assignedToId === 'GERENTE_SEGURIDAD';
            if (isRoleGroup) {
                const coordinatorUser = await database_1.default.user.findFirst({
                    where: { role: assignedToId, status: 'ACTIVE' },
                    orderBy: { createdAt: 'asc' },
                });
                if (coordinatorUser) {
                    actualAssignedToId = coordinatorUser.id;
                    escalationComment = `Incidente escalado al grupo ${assignedToId} (${coordinatorUser.name} ${coordinatorUser.lastName}) para atención: ${comment || ''}`;
                }
                else {
                    escalationComment = `Incidente escalado al grupo ${assignedToId} para atención: ${comment || ''}`;
                }
            }
            else {
                escalationComment = `Incidente escalado a usuario específico para atención: ${comment || ''}`;
            }
            const escalatedStatus = await database_1.default.status.findFirst({
                where: { code: 'ESCALATED', type: 'INCIDENT' },
            });
            let newStatusId = incident.statusId;
            if (escalatedStatus) {
                newStatusId = escalatedStatus.id;
            }
            const updatedIncident = await database_1.default.incident.update({
                where: { id },
                data: {
                    statusId: newStatusId,
                    assignedToId: actualAssignedToId,
                },
            });
            await database_1.default.incidentTimeline.create({
                data: {
                    incidentId: id,
                    userId: userId,
                    comment: escalationComment,
                    isInternal: false,
                },
            });
            res.json({ success: true, data: updatedIncident });
        }
        catch (error) {
            console.error('Error escalating incident:', error);
            res.status(500).json({ success: false, error: 'Error al escalar incidente' });
        }
    }
    async receive(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?.userId;
            const incident = await database_1.default.incident.findUnique({
                where: { id },
                include: { status: true },
            });
            if (!incident) {
                res.status(404).json({ success: false, error: 'Incidente no encontrado' });
                return;
            }
            if (incident.status.code !== 'ESCALATED') {
                res.status(400).json({ success: false, error: 'Solo se pueden recibir incidentes escalados' });
                return;
            }
            const inProgressStatus = await database_1.default.status.findFirst({
                where: { code: 'IN_PROGRESS', type: 'INCIDENT' },
            });
            if (!inProgressStatus) {
                res.status(400).json({ success: false, error: 'Estado en progreso no configurado' });
                return;
            }
            const updatedIncident = await database_1.default.incident.update({
                where: { id },
                data: {
                    statusId: inProgressStatus.id,
                    assignedToId: userId,
                },
                include: {
                    incidentType: true,
                    installation: true,
                    status: true,
                },
            });
            await database_1.default.incidentTimeline.create({
                data: {
                    incidentId: id,
                    userId: userId,
                    comment: 'Coordinador ha recibido el incidente para investigación',
                    isInternal: false,
                },
            });
            res.json({ success: true, data: updatedIncident });
        }
        catch (error) {
            console.error('Error receiving incident:', error);
            res.status(500).json({ success: false, error: 'Error al recibir incidente' });
        }
    }
    async verify(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?.userId;
            const { isValid, comment } = req.body;
            const verifiedStatus = await database_1.default.status.findFirst({
                where: { code: 'VERIFIED', type: 'INCIDENT' },
            });
            const invalidStatus = await database_1.default.status.findFirst({
                where: { code: 'CANCELLED', type: 'INCIDENT' },
            });
            const incident = await database_1.default.incident.update({
                where: { id },
                data: {
                    statusId: isValid ? verifiedStatus?.id : invalidStatus?.id,
                },
            });
            await database_1.default.incidentTimeline.create({
                data: {
                    incidentId: id,
                    userId: userId,
                    comment: isValid
                        ? `Incidente VERIFICADO. ${comment || 'Listo para escalar al coordinador correspondiente.'}`
                        : `Incidente INVALIDADO. ${comment || 'El incidente fue marcado como falso o no verificado.'}`,
                    isInternal: false,
                },
            });
            res.json({ success: true, data: incident });
        }
        catch (error) {
            console.error('Error verifying incident:', error);
            res.status(500).json({ success: false, error: 'Error al verificar incidente' });
        }
    }
    async getStats(req, res) {
        try {
            const installationId = req.query.installationId;
            const where = installationId ? { installationId } : {};
            const [total, open, inProgress, closed] = await Promise.all([
                database_1.default.incident.count({ where }),
                database_1.default.status
                    .findFirst({ where: { code: 'OPEN', type: 'INCIDENT' } })
                    .then((status) => status ? database_1.default.incident.count({ where: { ...where, statusId: status.id } }) : 0),
                database_1.default.status
                    .findFirst({ where: { code: 'IN_PROGRESS', type: 'INCIDENT' } })
                    .then((status) => status ? database_1.default.incident.count({ where: { ...where, statusId: status.id } }) : 0),
                database_1.default.status
                    .findFirst({ where: { code: 'CLOSED', type: 'INCIDENT' } })
                    .then((status) => status ? database_1.default.incident.count({ where: { ...where, statusId: status.id } }) : 0),
            ]);
            const byPriority = await database_1.default.incident.groupBy({
                by: ['priority'],
                where,
                _count: true,
            });
            const byType = await database_1.default.incident.findMany({
                where,
                select: {
                    incidentType: { select: { id: true, name: true } },
                },
            });
            const typeCounts = byType.reduce((acc, item) => {
                const name = item.incidentType.name;
                acc[name] = (acc[name] || 0) + 1;
                return acc;
            }, {});
            res.json({
                success: true,
                data: {
                    total,
                    open,
                    inProgress,
                    closed,
                    byPriority: byPriority.reduce((acc, item) => {
                        acc[item.priority] = item._count;
                        return acc;
                    }, {}),
                    byType: typeCounts,
                },
            });
        }
        catch (error) {
            console.error('Error fetching stats:', error);
            res.status(500).json({ success: false, error: 'Error al obtener estadísticas' });
        }
    }
}
exports.IncidentController = IncidentController;
exports.incidentController = new IncidentController();
//# sourceMappingURL=IncidentController.js.map