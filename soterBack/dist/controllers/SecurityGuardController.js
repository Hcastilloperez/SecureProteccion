"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityGuardController = exports.SecurityGuardController = void 0;
const database_1 = __importDefault(require("../config/database"));
class SecurityGuardController {
    async getAll(req, res) {
        try {
            const { installationId } = req.params;
            const guards = await database_1.default.securityGuard.findMany({
                where: { installationId },
                include: {
                    user: {
                        select: { id: true, name: true, lastName: true, email: true },
                    },
                },
                orderBy: { name: 'asc' },
            });
            res.json({ success: true, data: guards });
        }
        catch (error) {
            console.error('Error fetching security guards:', error);
            res.status(500).json({ success: false, error: 'Error al obtener vigilantes' });
        }
    }
    async getById(req, res) {
        try {
            const { installationId, id } = req.params;
            const guard = await database_1.default.securityGuard.findFirst({
                where: { id, installationId },
                include: {
                    user: {
                        select: { id: true, name: true, lastName: true, email: true },
                    },
                },
            });
            if (!guard) {
                res.status(404).json({ success: false, error: 'Vigilante no encontrado' });
                return;
            }
            res.json({ success: true, data: guard });
        }
        catch (error) {
            console.error('Error fetching security guard:', error);
            res.status(500).json({ success: false, error: 'Error al obtener vigilante' });
        }
    }
    async create(req, res) {
        try {
            const { installationId } = req.params;
            const { userId, documentType, documentNumber, name, lastName, phone, email, position, company, schedule, isActive, observations } = req.body;
            if (!documentType || !documentNumber || !name || !lastName || !phone || !position || !company) {
                res.status(400).json({ success: false, error: 'Campos requeridos faltantes' });
                return;
            }
            const existingGuard = await database_1.default.securityGuard.findUnique({
                where: { documentNumber },
            });
            if (existingGuard) {
                res.status(400).json({ success: false, error: 'Ya existe un vigilante con este número de documento' });
                return;
            }
            const guard = await database_1.default.securityGuard.create({
                data: {
                    installationId,
                    userId,
                    documentType,
                    documentNumber,
                    name,
                    lastName,
                    phone,
                    email,
                    position,
                    company,
                    schedule,
                    isActive: isActive ?? true,
                    observations,
                },
            });
            res.status(201).json({ success: true, data: guard });
        }
        catch (error) {
            console.error('Error creating security guard:', error);
            res.status(500).json({ success: false, error: 'Error al crear vigilante' });
        }
    }
    async update(req, res) {
        try {
            const { installationId, id } = req.params;
            const { userId, documentType, documentNumber, name, lastName, phone, email, position, company, schedule, isActive, observations } = req.body;
            const guard = await database_1.default.securityGuard.findFirst({
                where: { id, installationId },
            });
            if (!guard) {
                res.status(404).json({ success: false, error: 'Vigilante no encontrado' });
                return;
            }
            if (documentNumber && documentNumber !== guard.documentNumber) {
                const existingGuard = await database_1.default.securityGuard.findUnique({
                    where: { documentNumber },
                });
                if (existingGuard) {
                    res.status(400).json({ success: false, error: 'Ya existe un vigilante con este número de documento' });
                    return;
                }
            }
            const updated = await database_1.default.securityGuard.update({
                where: { id },
                data: {
                    ...(userId !== undefined && { userId }),
                    ...(documentType && { documentType }),
                    ...(documentNumber && { documentNumber }),
                    ...(name && { name }),
                    ...(lastName && { lastName }),
                    ...(phone && { phone }),
                    ...(email !== undefined && { email }),
                    ...(position && { position }),
                    ...(company && { company }),
                    ...(schedule !== undefined && { schedule }),
                    ...(isActive !== undefined && { isActive }),
                    ...(observations !== undefined && { observations }),
                },
            });
            res.json({ success: true, data: updated });
        }
        catch (error) {
            console.error('Error updating security guard:', error);
            res.status(500).json({ success: false, error: 'Error al actualizar vigilante' });
        }
    }
    async delete(req, res) {
        try {
            const { installationId, id } = req.params;
            const guard = await database_1.default.securityGuard.findFirst({
                where: { id, installationId },
            });
            if (!guard) {
                res.status(404).json({ success: false, error: 'Vigilante no encontrado' });
                return;
            }
            await database_1.default.securityGuard.delete({ where: { id } });
            res.json({ success: true, message: 'Vigilante eliminado' });
        }
        catch (error) {
            console.error('Error deleting security guard:', error);
            res.status(500).json({ success: false, error: 'Error al eliminar vigilante' });
        }
    }
}
exports.SecurityGuardController = SecurityGuardController;
exports.securityGuardController = new SecurityGuardController();
//# sourceMappingURL=SecurityGuardController.js.map