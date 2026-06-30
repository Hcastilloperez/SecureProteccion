"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("../config/database"));
const config_1 = require("../config");
class AuthController {
    async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                res.status(400).json({ success: false, error: 'Email y contraseña son requeridos' });
                return;
            }
            const user = await database_1.default.user.findUnique({
                where: { email },
                include: { installation: true, roleData: true },
            });
            if (!user) {
                res.status(401).json({ success: false, error: 'Credenciales inválidas' });
                return;
            }
            if (user.status !== 'ACTIVE') {
                res.status(401).json({ success: false, error: 'Usuario inactivo' });
                return;
            }
            const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
            if (!isValidPassword) {
                res.status(401).json({ success: false, error: 'Credenciales inválidas' });
                return;
            }
            const token = jsonwebtoken_1.default.sign({
                userId: user.id,
                email: user.email,
                role: user.role,
            }, config_1.config.jwt.secret, { expiresIn: config_1.config.jwt.expiresIn });
            let permissions = user.roleData?.permissions || {};
            if (!user.roleData && user.role) {
                const roleByName = await database_1.default.role.findUnique({
                    where: { name: user.role },
                });
                if (roleByName) {
                    permissions = roleByName.permissions || {};
                }
            }
            if (user.role === 'ADMIN' || permissions.all === true) {
                permissions.all = true;
            }
            res.json({
                success: true,
                data: {
                    token,
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        lastName: user.lastName,
                        role: user.role,
                        permissions,
                        installation: user.installation,
                    },
                },
            });
        }
        catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ success: false, error: 'Error en el servidor' });
        }
    }
    async register(req, res) {
        try {
            const { email, password, name, lastName, phone, role, installationId } = req.body;
            if (!email || !password || !name || !lastName || !role) {
                res.status(400).json({ success: false, error: 'Todos los campos son requeridos' });
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
                include: { installation: true },
            });
            const token = jsonwebtoken_1.default.sign({
                userId: user.id,
                email: user.email,
                role: user.role,
            }, config_1.config.jwt.secret, { expiresIn: config_1.config.jwt.expiresIn });
            res.status(201).json({
                success: true,
                data: {
                    token,
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        lastName: user.lastName,
                        role: user.role,
                        installation: user.installation,
                    },
                },
            });
        }
        catch (error) {
            console.error('Register error:', error);
            res.status(500).json({ success: false, error: 'Error en el servidor' });
        }
    }
    async profile(req, res) {
        try {
            const userId = req.user?.userId;
            const user = await database_1.default.user.findUnique({
                where: { id: userId },
                include: { installation: true },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    lastName: true,
                    phone: true,
                    role: true,
                    status: true,
                    installation: true,
                    createdAt: true,
                },
            });
            if (!user) {
                res.status(404).json({ success: false, error: 'Usuario no encontrado' });
                return;
            }
            res.json({ success: true, data: user });
        }
        catch (error) {
            console.error('Profile error:', error);
            res.status(500).json({ success: false, error: 'Error en el servidor' });
        }
    }
    async changePassword(req, res) {
        try {
            const userId = req.user?.userId;
            const { currentPassword, newPassword } = req.body;
            if (!currentPassword || !newPassword) {
                res.status(400).json({ success: false, error: 'Contraseñas requeridas' });
                return;
            }
            const user = await database_1.default.user.findUnique({ where: { id: userId } });
            if (!user) {
                res.status(404).json({ success: false, error: 'Usuario no encontrado' });
                return;
            }
            const isValidPassword = await bcryptjs_1.default.compare(currentPassword, user.password);
            if (!isValidPassword) {
                res.status(401).json({ success: false, error: 'Contraseña actual incorrecta' });
                return;
            }
            const hashedPassword = await bcryptjs_1.default.hash(newPassword, 12);
            await database_1.default.user.update({
                where: { id: userId },
                data: { password: hashedPassword },
            });
            res.json({ success: true, message: 'Contraseña actualizada' });
        }
        catch (error) {
            console.error('Change password error:', error);
            res.status(500).json({ success: false, error: 'Error en el servidor' });
        }
    }
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
//# sourceMappingURL=AuthController.js.map