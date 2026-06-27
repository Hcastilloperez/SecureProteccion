"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.escortController = exports.EscortController = void 0;
const database_1 = __importDefault(require("../config/database"));
class EscortController {
    async getAll(req, res) {
        try {
            const escorts = await database_1.default.escort.findMany({
                where: { isActive: true },
                orderBy: { name: 'asc' },
            });
            res.json({ success: true, data: escorts });
        }
        catch (error) {
            console.error('Error fetching escorts:', error);
            res.status(500).json({ success: false, error: 'Error al obtener escoltas' });
        }
    }
    async create(req, res) {
        try {
            const { documentType, documentNumber, name, lastName, phone, email, position, licenseType, licenseNumber, observations } = req.body;
            if (!documentType || !documentNumber || !name || !lastName || !phone || !position) {
                res.status(400).json({ success: false, error: 'Campos requeridos faltantes' });
                return;
            }
            const escort = await database_1.default.escort.create({
                data: {
                    documentType,
                    documentNumber,
                    name,
                    lastName,
                    phone,
                    email,
                    position,
                    licenseType,
                    licenseNumber,
                    observations,
                },
            });
            res.status(201).json({ success: true, data: escort });
        }
        catch (error) {
            console.error('Error creating escort:', error);
            res.status(500).json({ success: false, error: 'Error al crear escolta' });
        }
    }
    async update(req, res) {
        try {
            const { id } = req.params;
            const { documentType, documentNumber, name, lastName, phone, email, position, licenseType, licenseNumber, isActive, observations } = req.body;
            const escort = await database_1.default.escort.update({
                where: { id },
                data: {
                    ...(documentType && { documentType }),
                    ...(documentNumber && { documentNumber }),
                    ...(name && { name }),
                    ...(lastName && { lastName }),
                    ...(phone && { phone }),
                    ...(email !== undefined && { email }),
                    ...(position && { position }),
                    ...(licenseType !== undefined && { licenseType }),
                    ...(licenseNumber !== undefined && { licenseNumber }),
                    ...(isActive !== undefined && { isActive }),
                    ...(observations !== undefined && { observations }),
                },
            });
            res.json({ success: true, data: escort });
        }
        catch (error) {
            console.error('Error updating escort:', error);
            res.status(500).json({ success: false, error: 'Error al actualizar escolta' });
        }
    }
    async delete(req, res) {
        try {
            const { id } = req.params;
            await database_1.default.escort.update({
                where: { id },
                data: { isActive: false },
            });
            res.json({ success: true, message: 'Escolta desactivado' });
        }
        catch (error) {
            console.error('Error deleting escort:', error);
            res.status(500).json({ success: false, error: 'Error al eliminar escolta' });
        }
    }
    async getRoutes(req, res) {
        try {
            const { escortId, installationId } = req.query;
            const where = { isActive: true };
            if (escortId)
                where.escortId = String(escortId);
            if (installationId)
                where.installationId = String(installationId);
            const routes = await database_1.default.escortRoute.findMany({
                where,
                include: {
                    escort: { select: { id: true, name: true, lastName: true } },
                    installation: { select: { id: true, name: true } },
                    _count: { select: { movements: true } },
                },
                orderBy: { createdAt: 'desc' },
            });
            res.json({ success: true, data: routes });
        }
        catch (error) {
            console.error('Error fetching routes:', error);
            res.status(500).json({ success: false, error: 'Error al obtener rutas' });
        }
    }
    async createRoute(req, res) {
        try {
            const { name, description, waypoints, distance, estimatedTime, escortId, installationId } = req.body;
            if (!name || !escortId) {
                res.status(400).json({ success: false, error: 'Nombre y escolta son requeridos' });
                return;
            }
            const route = await database_1.default.escortRoute.create({
                data: {
                    name,
                    description,
                    waypoints,
                    distance,
                    estimatedTime,
                    escortId,
                    installationId,
                },
                include: {
                    escort: { select: { id: true, name: true, lastName: true } },
                    installation: { select: { id: true, name: true } },
                },
            });
            res.status(201).json({ success: true, data: route });
        }
        catch (error) {
            console.error('Error creating route:', error);
            res.status(500).json({ success: false, error: 'Error al crear ruta' });
        }
    }
    async updateRoute(req, res) {
        try {
            const { id } = req.params;
            const { name, description, waypoints, distance, estimatedTime, isActive } = req.body;
            const route = await database_1.default.escortRoute.update({
                where: { id },
                data: {
                    ...(name && { name }),
                    ...(description !== undefined && { description }),
                    ...(waypoints !== undefined && { waypoints }),
                    ...(distance !== undefined && { distance }),
                    ...(estimatedTime !== undefined && { estimatedTime }),
                    ...(isActive !== undefined && { isActive }),
                },
            });
            res.json({ success: true, data: route });
        }
        catch (error) {
            console.error('Error updating route:', error);
            res.status(500).json({ success: false, error: 'Error al actualizar ruta' });
        }
    }
    async getMovements(req, res) {
        try {
            const { escortId, routeId, date, status } = req.query;
            const where = {};
            if (escortId)
                where.escortId = String(escortId);
            if (routeId)
                where.routeId = String(routeId);
            if (status)
                where.status = String(status);
            if (date) {
                const startOfDay = new Date(String(date));
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(String(date));
                endOfDay.setHours(23, 59, 59, 999);
                where.date = { gte: startOfDay, lte: endOfDay };
            }
            const movements = await database_1.default.escortMovement.findMany({
                where,
                include: {
                    escort: { select: { id: true, name: true, lastName: true } },
                    route: { select: { id: true, name: true } },
                    user: { select: { id: true, name: true, lastName: true } },
                },
                orderBy: { date: 'desc' },
            });
            res.json({ success: true, data: movements });
        }
        catch (error) {
            console.error('Error fetching movements:', error);
            res.status(500).json({ success: false, error: 'Error al obtener movimientos' });
        }
    }
    async createMovement(req, res) {
        try {
            const userId = req.user?.userId;
            const { date, startTime, routeId, escortId, userId: targetUserId, startLatitude, startLongitude } = req.body;
            if (!date || !startTime || !routeId || !escortId) {
                res.status(400).json({ success: false, error: 'Campos requeridos faltantes' });
                return;
            }
            const movement = await database_1.default.escortMovement.create({
                data: {
                    date: new Date(date),
                    startTime: new Date(startTime),
                    routeId,
                    escortId,
                    userId: targetUserId,
                    startLatitude,
                    startLongitude,
                    status: 'SCHEDULED',
                },
                include: {
                    escort: { select: { id: true, name: true, lastName: true } },
                    route: { select: { id: true, name: true } },
                },
            });
            res.status(201).json({ success: true, data: movement });
        }
        catch (error) {
            console.error('Error creating movement:', error);
            res.status(500).json({ success: false, error: 'Error al crear movimiento' });
        }
    }
    async updateMovement(req, res) {
        try {
            const { id } = req.params;
            const { endTime, endLatitude, endLongitude, status, observations, routeTrace } = req.body;
            const updateData = {};
            if (endTime)
                updateData.endTime = new Date(endTime);
            if (endLatitude !== undefined)
                updateData.endLatitude = endLatitude;
            if (endLongitude !== undefined)
                updateData.endLongitude = endLongitude;
            if (status)
                updateData.status = status;
            if (observations !== undefined)
                updateData.observations = observations;
            if (routeTrace !== undefined)
                updateData.routeTrace = routeTrace;
            const movement = await database_1.default.escortMovement.update({
                where: { id },
                data: updateData,
                include: {
                    escort: { select: { id: true, name: true, lastName: true } },
                    route: { select: { id: true, name: true } },
                },
            });
            res.json({ success: true, data: movement });
        }
        catch (error) {
            console.error('Error updating movement:', error);
            res.status(500).json({ success: false, error: 'Error al actualizar movimiento' });
        }
    }
    async getTodayMovements(req, res) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const movements = await database_1.default.escortMovement.findMany({
                where: {
                    date: { gte: today, lt: tomorrow },
                },
                include: {
                    escort: { select: { id: true, name: true, lastName: true, phone: true } },
                    route: { select: { id: true, name: true, waypoints: true } },
                    user: { select: { id: true, name: true, lastName: true } },
                },
                orderBy: { startTime: 'asc' },
            });
            res.json({ success: true, data: movements });
        }
        catch (error) {
            console.error('Error fetching today movements:', error);
            res.status(500).json({ success: false, error: 'Error al obtener movimientos del día' });
        }
    }
    async getAssignments(req, res) {
        try {
            const { escortId, status } = req.query;
            const where = {};
            if (escortId)
                where.escortId = String(escortId);
            if (status)
                where.status = String(status);
            const assignments = await database_1.default.escortAssignment.findMany({
                where,
                include: {
                    escort: { select: { id: true, name: true, lastName: true } },
                    route: { select: { id: true, name: true } },
                    movements: {
                        orderBy: { startTime: 'desc' },
                        take: 5,
                    },
                },
                orderBy: { startDate: 'desc' },
            });
            res.json({ success: true, data: assignments });
        }
        catch (error) {
            console.error('Error fetching assignments:', error);
            res.status(500).json({ success: false, error: 'Error al obtener asignaciones' });
        }
    }
    async createAssignment(req, res) {
        try {
            const { escortId, routeId, officialName, officialDocument, officialPhone, officialPosition, destination, startDate, endDate, status, observations } = req.body;
            if (!escortId || !officialName || !officialDocument || !destination || !startDate) {
                res.status(400).json({ success: false, error: 'Campos requeridos faltantes' });
                return;
            }
            const assignment = await database_1.default.escortAssignment.create({
                data: {
                    escortId,
                    routeId: routeId || null,
                    officialName,
                    officialDocument,
                    officialPhone,
                    officialPosition,
                    destination,
                    startDate: new Date(startDate),
                    endDate: endDate ? new Date(endDate) : null,
                    status: status || 'PENDING',
                    observations,
                },
                include: {
                    escort: { select: { id: true, name: true, lastName: true } },
                    route: { select: { id: true, name: true } },
                },
            });
            res.status(201).json({ success: true, data: assignment });
        }
        catch (error) {
            console.error('Error creating assignment:', error);
            res.status(500).json({ success: false, error: 'Error al crear asignación' });
        }
    }
    async updateAssignment(req, res) {
        try {
            const { id } = req.params;
            const { escortId, routeId, officialName, officialDocument, officialPhone, officialPosition, destination, startDate, endDate, status, observations } = req.body;
            const assignment = await database_1.default.escortAssignment.update({
                where: { id },
                data: {
                    ...(escortId && { escortId }),
                    ...(routeId !== undefined && { routeId: routeId || null }),
                    ...(officialName && { officialName }),
                    ...(officialDocument && { officialDocument }),
                    ...(officialPhone !== undefined && { officialPhone }),
                    ...(officialPosition !== undefined && { officialPosition }),
                    ...(destination && { destination }),
                    ...(startDate && { startDate: new Date(startDate) }),
                    ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
                    ...(status && { status }),
                    ...(observations !== undefined && { observations }),
                },
                include: {
                    escort: { select: { id: true, name: true, lastName: true } },
                    route: { select: { id: true, name: true } },
                    movements: {
                        orderBy: { startTime: 'desc' },
                        take: 5,
                    },
                },
            });
            res.json({ success: true, data: assignment });
        }
        catch (error) {
            console.error('Error updating assignment:', error);
            res.status(500).json({ success: false, error: 'Error al actualizar asignación' });
        }
    }
}
exports.EscortController = EscortController;
exports.escortController = new EscortController();
//# sourceMappingURL=EscortController.js.map