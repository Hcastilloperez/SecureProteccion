"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminController = exports.AdminController = void 0;
const database_1 = __importDefault(require("../config/database"));
class AdminController {
    async getStatuses(req, res) {
        try {
            const { type } = req.query;
            const where = {};
            if (type)
                where.type = String(type);
            const statuses = await database_1.default.status.findMany({
                where,
                orderBy: [{ isActive: 'desc' }, { order: 'asc' }],
            });
            res.json({ success: true, data: statuses });
        }
        catch (error) {
            console.error('Error fetching statuses:', error);
            res.status(500).json({ success: false, error: 'Error al obtener estados' });
        }
    }
    async createStatus(req, res) {
        try {
            const { code, name, type, description, order } = req.body;
            if (!code || !name || !type) {
                res.status(400).json({ success: false, error: 'Code, name y type son requeridos' });
                return;
            }
            const existingStatus = await database_1.default.status.findUnique({ where: { code } });
            if (existingStatus) {
                res.status(400).json({ success: false, error: 'Código ya existe' });
                return;
            }
            const status = await database_1.default.status.create({
                data: { code, name, type, description, order: order || 0 },
            });
            res.status(201).json({ success: true, data: status });
        }
        catch (error) {
            console.error('Error creating status:', error);
            res.status(500).json({ success: false, error: 'Error al crear estado' });
        }
    }
    async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { code, name, description, isActive, order } = req.body;
            const status = await database_1.default.status.update({
                where: { id },
                data: {
                    ...(code && { code }),
                    ...(name && { name }),
                    ...(description !== undefined && { description }),
                    ...(isActive !== undefined && { isActive }),
                    ...(order !== undefined && { order }),
                },
            });
            res.json({ success: true, data: status });
        }
        catch (error) {
            console.error('Error updating status:', error);
            res.status(500).json({ success: false, error: 'Error al actualizar estado' });
        }
    }
    async deleteStatus(req, res) {
        try {
            const { id } = req.params;
            await database_1.default.status.update({
                where: { id },
                data: { isActive: false },
            });
            res.json({ success: true, message: 'Estado desactivado' });
        }
        catch (error) {
            console.error('Error deleting status:', error);
            res.status(500).json({ success: false, error: 'Error al eliminar estado' });
        }
    }
    async getIncidentTypes(req, res) {
        try {
            const types = await database_1.default.incidentType.findMany({
                where: { isActive: true },
                orderBy: { name: 'asc' },
            });
            res.json({ success: true, data: types });
        }
        catch (error) {
            console.error('Error fetching incident types:', error);
            res.status(500).json({ success: false, error: 'Error al obtener tipos de incidente' });
        }
    }
    async createIncidentType(req, res) {
        try {
            const { code, name, description, category, coordinatorType, slaHours } = req.body;
            if (!code || !name || !category) {
                res.status(400).json({ success: false, error: 'Code, name y category son requeridos' });
                return;
            }
            const existingType = await database_1.default.incidentType.findUnique({ where: { code } });
            if (existingType) {
                res.status(400).json({ success: false, error: 'Código ya existe' });
                return;
            }
            const incidentType = await database_1.default.incidentType.create({
                data: { code, name, description, category, coordinatorType, slaHours },
            });
            res.status(201).json({ success: true, data: incidentType });
        }
        catch (error) {
            console.error('Error creating incident type:', error);
            res.status(500).json({ success: false, error: 'Error al crear tipo de incidente' });
        }
    }
    async updateIncidentType(req, res) {
        try {
            const { id } = req.params;
            const { code, name, description, category, coordinatorType, slaHours, isActive } = req.body;
            const incidentType = await database_1.default.incidentType.update({
                where: { id },
                data: {
                    ...(code && { code }),
                    ...(name && { name }),
                    ...(description !== undefined && { description }),
                    ...(category && { category }),
                    ...(coordinatorType !== undefined && { coordinatorType }),
                    ...(slaHours !== undefined && { slaHours }),
                    ...(isActive !== undefined && { isActive }),
                },
            });
            res.json({ success: true, data: incidentType });
        }
        catch (error) {
            console.error('Error updating incident type:', error);
            res.status(500).json({ success: false, error: 'Error al actualizar tipo de incidente' });
        }
    }
    async deleteIncidentType(req, res) {
        try {
            const { id } = req.params;
            await database_1.default.incidentType.update({
                where: { id },
                data: { isActive: false },
            });
            res.json({ success: true, message: 'Tipo de incidente desactivado' });
        }
        catch (error) {
            console.error('Error deleting incident type:', error);
            res.status(500).json({ success: false, error: 'Error al eliminar tipo de incidente' });
        }
    }
    async getConfigurations(req, res) {
        try {
            const { category, isPublic } = req.query;
            const where = {};
            if (category)
                where.category = String(category);
            if (isPublic !== undefined)
                where.isPublic = isPublic === 'true';
            const configurations = await database_1.default.configuration.findMany({
                where,
                orderBy: { category: 'asc' },
            });
            res.json({ success: true, data: configurations });
        }
        catch (error) {
            console.error('Error fetching configurations:', error);
            res.status(500).json({ success: false, error: 'Error al obtener configuraciones' });
        }
    }
    async createConfiguration(req, res) {
        try {
            const { key, value, type, description, isPublic, category } = req.body;
            if (!key || !value || !type) {
                res.status(400).json({ success: false, error: 'Key, value y type son requeridos' });
                return;
            }
            const existingConfig = await database_1.default.configuration.findUnique({ where: { key } });
            if (existingConfig) {
                res.status(400).json({ success: false, error: 'Key ya existe' });
                return;
            }
            const configuration = await database_1.default.configuration.create({
                data: { key, value, type, description, isPublic: isPublic || false, category: category || 'general' },
            });
            res.status(201).json({ success: true, data: configuration });
        }
        catch (error) {
            console.error('Error creating configuration:', error);
            res.status(500).json({ success: false, error: 'Error al crear configuración' });
        }
    }
    async updateConfiguration(req, res) {
        try {
            const { id } = req.params;
            const { value, description, isPublic } = req.body;
            const configuration = await database_1.default.configuration.update({
                where: { id },
                data: {
                    ...(value && { value }),
                    ...(description !== undefined && { description }),
                    ...(isPublic !== undefined && { isPublic }),
                },
            });
            res.json({ success: true, data: configuration });
        }
        catch (error) {
            console.error('Error updating configuration:', error);
            res.status(500).json({ success: false, error: 'Error al actualizar configuración' });
        }
    }
    async deleteConfiguration(req, res) {
        try {
            const { id } = req.params;
            await database_1.default.configuration.delete({ where: { id } });
            res.json({ success: true, message: 'Configuración eliminada' });
        }
        catch (error) {
            console.error('Error deleting configuration:', error);
            res.status(500).json({ success: false, error: 'Error al eliminar configuración' });
        }
    }
    async getRoles(req, res) {
        try {
            const roles = await database_1.default.role.findMany({
                where: { isActive: true },
                orderBy: { name: 'asc' },
            });
            res.json({ success: true, data: roles });
        }
        catch (error) {
            console.error('Error fetching roles:', error);
            res.status(500).json({ success: false, error: 'Error al obtener roles' });
        }
    }
    async createRole(req, res) {
        try {
            const { name, description, permissions } = req.body;
            if (!name) {
                res.status(400).json({ success: false, error: 'Nombre requerido' });
                return;
            }
            const role = await database_1.default.role.create({
                data: { name, description, permissions: permissions || {} },
            });
            res.status(201).json({ success: true, data: role });
        }
        catch (error) {
            console.error('Error creating role:', error);
            res.status(500).json({ success: false, error: 'Error al crear rol' });
        }
    }
    async updateRole(req, res) {
        try {
            const { id } = req.params;
            const { name, description, permissions, isActive } = req.body;
            const role = await database_1.default.role.update({
                where: { id },
                data: {
                    ...(name && { name }),
                    ...(description !== undefined && { description }),
                    ...(permissions !== undefined && { permissions }),
                    ...(isActive !== undefined && { isActive }),
                },
            });
            res.json({ success: true, data: role });
        }
        catch (error) {
            console.error('Error updating role:', error);
            res.status(500).json({ success: false, error: 'Error al actualizar rol' });
        }
    }
    async deleteRole(req, res) {
        try {
            const { id } = req.params;
            await database_1.default.role.update({
                where: { id },
                data: { isActive: false },
            });
            res.json({ success: true, message: 'Rol eliminado' });
        }
        catch (error) {
            console.error('Error deleting role:', error);
            res.status(500).json({ success: false, error: 'Error al eliminar rol' });
        }
    }
    async getEquipmentTypes(req, res) {
        try {
            const equipmentTypes = await database_1.default.equipmentType.findMany({
                orderBy: { name: 'asc' },
            });
            res.json(equipmentTypes);
        }
        catch (error) {
            console.error('Error getting equipment types:', error);
            res.status(500).json({ success: false, error: 'Error al obtener tipos de equipo' });
        }
    }
    async createEquipmentType(req, res) {
        try {
            const { code, name, description, category, systemType } = req.body;
            const existing = await database_1.default.equipmentType.findUnique({ where: { code } });
            if (existing) {
                res.status(400).json({ success: false, error: 'Ya existe un tipo de equipo con este código' });
                return;
            }
            const equipmentType = await database_1.default.equipmentType.create({
                data: { code, name, description, category, systemType },
            });
            res.status(201).json(equipmentType);
        }
        catch (error) {
            console.error('Error creating equipment type:', error);
            res.status(500).json({ success: false, error: 'Error al crear tipo de equipo' });
        }
    }
    async updateEquipmentType(req, res) {
        try {
            const { id } = req.params;
            const { name, description, category, isActive } = req.body;
            const equipmentType = await database_1.default.equipmentType.update({
                where: { id },
                data: { name, description, category, isActive },
            });
            res.json(equipmentType);
        }
        catch (error) {
            console.error('Error updating equipment type:', error);
            res.status(500).json({ success: false, error: 'Error al actualizar tipo de equipo' });
        }
    }
    async deleteEquipmentType(req, res) {
        try {
            const { id } = req.params;
            await database_1.default.equipmentType.update({
                where: { id },
                data: { isActive: false },
            });
            res.json({ success: true, message: 'Tipo de equipo eliminado' });
        }
        catch (error) {
            console.error('Error deleting equipment type:', error);
            res.status(500).json({ success: false, error: 'Error al eliminar tipo de equipo' });
        }
    }
    async getDashboardStats(req, res) {
        try {
            const userRole = req.user?.role;
            const userInstallationId = req.user?.installationId;
            const installationFilter = userRole === 'GERENTE_SEGURIDAD' || userRole === 'ADMIN'
                ? {}
                : userInstallationId
                    ? { installationId: userInstallationId }
                    : {};
            const [totalIncidents, openIncidents, installationsCount, securityGuardsCount, escortsCount, activeSystems, recentIncidents,] = await Promise.all([
                database_1.default.incident.count({ where: installationFilter }),
                database_1.default.incident.count({
                    where: {
                        ...installationFilter,
                        status: { code: { not: 'CLOSED' } },
                    },
                }),
                database_1.default.installation.count(),
                database_1.default.securityGuard.count({ where: { ...installationFilter, isActive: true } }),
                database_1.default.escort.count({ where: { isActive: true } }),
                database_1.default.securitySystem.count({ where: { ...installationFilter, isActive: true } }),
                database_1.default.incident.findMany({
                    where: installationFilter,
                    include: {
                        incidentType: true,
                        installation: true,
                        status: true,
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                }),
            ]);
            const incidentsByStatus = await database_1.default.incident.groupBy({
                by: ['priority'],
                where: installationFilter,
                _count: true,
            });
            res.json({
                success: true,
                data: {
                    totalIncidents,
                    openIncidents,
                    installationsCount,
                    securityGuardsCount,
                    escortsCount,
                    activeSystems,
                    incidentsByPriority: incidentsByStatus.reduce((acc, item) => {
                        acc[item.priority] = item._count;
                        return acc;
                    }, {}),
                    recentIncidents,
                },
            });
        }
        catch (error) {
            console.error('Error fetching dashboard stats:', error);
            res.status(500).json({ success: false, error: 'Error al obtener estadísticas del dashboard' });
        }
    }
    async getMaintenanceStats(req, res) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const [totalCount, scheduledCount, inProgressCount, completedCount, recent,] = await Promise.all([
                database_1.default.maintenanceSchedule.count(),
                database_1.default.maintenanceSchedule.count({ where: { status: 'SCHEDULED' } }),
                database_1.default.maintenanceSchedule.count({ where: { status: 'IN_PROGRESS' } }),
                database_1.default.maintenanceSchedule.count({
                    where: {
                        status: 'COMPLETED',
                        completedDate: { gte: startOfMonth },
                    },
                }),
                database_1.default.maintenanceSchedule.findMany({
                    take: 5,
                    orderBy: { scheduledDate: 'desc' },
                    include: {
                        equipment: { select: { id: true, name: true } },
                        securitySystem: { select: { id: true, name: true } },
                    },
                }),
            ]);
            res.json({
                success: true,
                data: {
                    totalCount,
                    scheduledCount,
                    inProgressCount,
                    completedCount,
                    recent,
                },
            });
        }
        catch (error) {
            console.error('Error fetching maintenance stats:', error);
            res.status(500).json({ success: false, error: 'Error al obtener estadísticas de mantenimiento' });
        }
    }
}
exports.AdminController = AdminController;
exports.adminController = new AdminController();
//# sourceMappingURL=AdminController.js.map