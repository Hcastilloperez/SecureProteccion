"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactController = exports.ContactController = void 0;
const database_1 = __importDefault(require("../config/database"));
class ContactController {
    async getAll(req, res) {
        try {
            const { installationId } = req.params;
            const contacts = await database_1.default.contact.findMany({
                where: { installationId },
                orderBy: { isEmergency: 'desc' },
            });
            res.json({ success: true, data: contacts });
        }
        catch (error) {
            console.error('Error fetching contacts:', error);
            res.status(500).json({ success: false, error: 'Error al obtener contactos' });
        }
    }
    async getById(req, res) {
        try {
            const { installationId, id } = req.params;
            const contact = await database_1.default.contact.findFirst({
                where: { id, installationId },
            });
            if (!contact) {
                res.status(404).json({ success: false, error: 'Contacto no encontrado' });
                return;
            }
            res.json({ success: true, data: contact });
        }
        catch (error) {
            console.error('Error fetching contact:', error);
            res.status(500).json({ success: false, error: 'Error al obtener contacto' });
        }
    }
    async create(req, res) {
        try {
            const { installationId } = req.params;
            const { name, position, phone, email, isEmergency, notes } = req.body;
            if (!name || !position || !phone) {
                res.status(400).json({ success: false, error: 'Campos requeridos faltantes' });
                return;
            }
            const contact = await database_1.default.contact.create({
                data: {
                    installationId,
                    name,
                    position,
                    phone,
                    email,
                    isEmergency: isEmergency || false,
                    notes,
                },
            });
            res.status(201).json({ success: true, data: contact });
        }
        catch (error) {
            console.error('Error creating contact:', error);
            res.status(500).json({ success: false, error: 'Error al crear contacto' });
        }
    }
    async update(req, res) {
        try {
            const { installationId, id } = req.params;
            const { name, position, phone, email, isEmergency, notes } = req.body;
            const contact = await database_1.default.contact.findFirst({
                where: { id, installationId },
            });
            if (!contact) {
                res.status(404).json({ success: false, error: 'Contacto no encontrado' });
                return;
            }
            const updated = await database_1.default.contact.update({
                where: { id },
                data: {
                    ...(name && { name }),
                    ...(position && { position }),
                    ...(phone && { phone }),
                    ...(email !== undefined && { email }),
                    ...(isEmergency !== undefined && { isEmergency }),
                    ...(notes !== undefined && { notes }),
                },
            });
            res.json({ success: true, data: updated });
        }
        catch (error) {
            console.error('Error updating contact:', error);
            res.status(500).json({ success: false, error: 'Error al actualizar contacto' });
        }
    }
    async delete(req, res) {
        try {
            const { installationId, id } = req.params;
            const contact = await database_1.default.contact.findFirst({
                where: { id, installationId },
            });
            if (!contact) {
                res.status(404).json({ success: false, error: 'Contacto no encontrado' });
                return;
            }
            await database_1.default.contact.delete({ where: { id } });
            res.json({ success: true, message: 'Contacto eliminado' });
        }
        catch (error) {
            console.error('Error deleting contact:', error);
            res.status(500).json({ success: false, error: 'Error al eliminar contacto' });
        }
    }
}
exports.ContactController = ContactController;
exports.contactController = new ContactController();
//# sourceMappingURL=ContactController.js.map