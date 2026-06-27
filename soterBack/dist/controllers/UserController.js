"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = exports.UserController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = __importDefault(require("../config/database"));
class UserController {
    async getAll(req, res) {
        try {
            const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
            const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '20'), 10)));
            const skip = (page - 1) * limit;
            const where = {};
            if (req.query.role) {
                where.role = req.query.role;
            }
            if (req.query.status) {
                where.status = req.query.status;
            }
            if (req.query.installationId) {
                where.installationId = req.query.installationId;
            }
            if (req.query.search) {
                where.OR = [
                    { name: { contains: String(req.query.search), mode: 'insensitive' } },
                    { lastName: { contains: String(req.query.search), mode: 'insensitive' } },
                    { email: { contains: String(req.query.search), mode: 'insensitive' } },
                ];
            }
            const [data, total] = await Promise.all([
                database_1.default.user.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { name: 'asc' },
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        lastName: true,
                        phone: true,
                        role: true,
                        status: true,
                        installationId: true,
                        installation: { select: { id: true, name: true } },
                        createdAt: true,
                        updatedAt: true,
                    },
                }),
                database_1.default.user.count({ where }),
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
            console.error('Error fetching users:', error);
            res.status(500).json({ success: false, error: 'Error al obtener usuarios' });
        }
    }
    async getById(req, res) {
        try {
            const { id } = req.params;
            const user = await database_1.default.user.findUnique({
                where: { id },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    lastName: true,
                    phone: true,
                    role: true,
                    status: true,
                    installationId: true,
                    installation: { select: { id: true, name: true } },
                    createdAt: true,
                    updatedAt: true,
                },
            });
            if (!user) {
                res.status(404).json({ success: false, error: 'Usuario no encontrado' });
                return;
            }
            res.json({ success: true, data: user });
        }
        catch (error) {
            console.error('Error fetching user:', error);
            res.status(500).json({ success: false, error: 'Error al obtener usuario' });
        }
    }
    async create(req, res) {
        try {
            const { email, password, name, lastName, phone, role, installationId } = req.body;
            if (!email || !password || !name || !lastName || !role) {
                res.status(400).json({ success: false, error: 'Campos requeridos faltantes' });
                return;
            }
            const existingUser = await database_1.default.user.findUnique({ where: { email } });
            if (existingUser) {
                res.status(400).json({ success: false, error: 'El email ya está registrado' });
                return;
            }
            const hashedPassword = await bcryptjs_1.default.hash(password, 12);
            const user = await database_1.default.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name,
                    lastName,
                    phone,
                    role,
                    installationId,
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    lastName: true,
                    phone: true,
                    role: true,
                    status: true,
                    installation: { select: { id: true, name: true } },
                    createdAt: true,
                },
            });
            res.status(201).json({ success: true, data: user });
        }
        catch (error) {
            console.error('Error creating user:', error);
            res.status(500).json({ success: false, error: 'Error al crear usuario' });
        }
    }
    async update(req, res) {
        try {
            const { id } = req.params;
            const { email, name, lastName, phone, role, status, installationId } = req.body;
            const updateData = {};
            if (email)
                updateData.email = email;
            if (name)
                updateData.name = name;
            if (lastName)
                updateData.lastName = lastName;
            if (phone !== undefined)
                updateData.phone = phone;
            if (role)
                updateData.role = role;
            if (status)
                updateData.status = status;
            if (installationId !== undefined)
                updateData.installationId = installationId;
            const user = await database_1.default.user.update({
                where: { id },
                data: updateData,
                select: {
                    id: true,
                    email: true,
                    name: true,
                    lastName: true,
                    phone: true,
                    role: true,
                    status: true,
                    installation: { select: { id: true, name: true } },
                    updatedAt: true,
                },
            });
            res.json({ success: true, data: user });
        }
        catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({ success: false, error: 'Error al actualizar usuario' });
        }
    }
    async updatePassword(req, res) {
        try {
            const { id } = req.params;
            const { password } = req.body;
            if (!password) {
                res.status(400).json({ success: false, error: 'Contraseña requerida' });
                return;
            }
            const hashedPassword = await bcryptjs_1.default.hash(password, 12);
            await database_1.default.user.update({
                where: { id },
                data: { password: hashedPassword },
            });
            res.json({ success: true, message: 'Contraseña actualizada' });
        }
        catch (error) {
            console.error('Error updating password:', error);
            res.status(500).json({ success: false, error: 'Error al actualizar contraseña' });
        }
    }
    async delete(req, res) {
        try {
            const { id } = req.params;
            await database_1.default.user.update({
                where: { id },
                data: { status: 'INACTIVE' },
            });
            res.json({ success: true, message: 'Usuario desactivado' });
        }
        catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({ success: false, error: 'Error al eliminar usuario' });
        }
    }
}
exports.UserController = UserController;
exports.userController = new UserController();
//# sourceMappingURL=UserController.js.map