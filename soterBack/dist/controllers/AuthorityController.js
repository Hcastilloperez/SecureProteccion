"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorityController = exports.AuthorityController = void 0;
const database_1 = __importDefault(require("../config/database"));
class AuthorityController {
    async getAll(req, res) {
        try {
            const { installationId } = req.params;
            const authorities = await database_1.default.authority.findMany({
                where: { installationId },
                orderBy: { type: 'asc' },
            });
            res.json({ success: true, data: authorities });
        }
        catch (error) {
            console.error('Error fetching authorities:', error);
            res.status(500).json({ success: false, error: 'Error al obtener autoridades' });
        }
    }
    async getById(req, res) {
        try {
            const { installationId, id } = req.params;
            const authority = await database_1.default.authority.findFirst({
                where: { id, installationId },
            });
            if (!authority) {
                res.status(404).json({ success: false, error: 'Autoridad no encontrada' });
                return;
            }
            res.json({ success: true, data: authority });
        }
        catch (error) {
            console.error('Error fetching authority:', error);
            res.status(500).json({ success: false, error: 'Error al obtener autoridad' });
        }
    }
    async create(req, res) {
        try {
            const { installationId } = req.params;
            const { name, type, phone, address, email, latitude, longitude, distance, responseTime, notes, isActive } = req.body;
            if (!name || !type || !phone) {
                res.status(400).json({ success: false, error: 'Campos requeridos faltantes' });
                return;
            }
            const authority = await database_1.default.authority.create({
                data: {
                    installationId,
                    name,
                    type,
                    phone,
                    address,
                    email,
                    latitude,
                    longitude,
                    distance,
                    responseTime,
                    notes,
                    isActive: isActive ?? true,
                },
            });
            res.status(201).json({ success: true, data: authority });
        }
        catch (error) {
            console.error('Error creating authority:', error);
            res.status(500).json({ success: false, error: 'Error al crear autoridad' });
        }
    }
    async update(req, res) {
        try {
            const { installationId, id } = req.params;
            const { name, type, phone, address, email, latitude, longitude, distance, responseTime, notes, isActive } = req.body;
            const authority = await database_1.default.authority.findFirst({
                where: { id, installationId },
            });
            if (!authority) {
                res.status(404).json({ success: false, error: 'Autoridad no encontrada' });
                return;
            }
            const updated = await database_1.default.authority.update({
                where: { id },
                data: {
                    ...(name && { name }),
                    ...(type && { type }),
                    ...(phone && { phone }),
                    ...(address !== undefined && { address }),
                    ...(email !== undefined && { email }),
                    ...(latitude !== undefined && { latitude }),
                    ...(longitude !== undefined && { longitude }),
                    ...(distance !== undefined && { distance }),
                    ...(responseTime !== undefined && { responseTime }),
                    ...(notes !== undefined && { notes }),
                    ...(isActive !== undefined && { isActive }),
                },
            });
            res.json({ success: true, data: updated });
        }
        catch (error) {
            console.error('Error updating authority:', error);
            res.status(500).json({ success: false, error: 'Error al actualizar autoridad' });
        }
    }
    async delete(req, res) {
        try {
            const { installationId, id } = req.params;
            const authority = await database_1.default.authority.findFirst({
                where: { id, installationId },
            });
            if (!authority) {
                res.status(404).json({ success: false, error: 'Autoridad no encontrada' });
                return;
            }
            await database_1.default.authority.delete({ where: { id } });
            res.json({ success: true, message: 'Autoridad eliminada' });
        }
        catch (error) {
            console.error('Error deleting authority:', error);
            res.status(500).json({ success: false, error: 'Error al eliminar autoridad' });
        }
    }
}
exports.AuthorityController = AuthorityController;
exports.authorityController = new AuthorityController();
//# sourceMappingURL=AuthorityController.js.map