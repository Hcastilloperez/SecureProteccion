"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.physicalSecurityController = exports.PhysicalSecurityController = void 0;
const database_1 = __importDefault(require("../config/database"));
class PhysicalSecurityController {
    async getSecurityGuards(req, res) {
        try {
            const { installationId } = req.query;
            const where = { isActive: true };
            if (installationId) {
                where.installationId = String(installationId);
            }
            const guards = await database_1.default.securityGuard.findMany({
                where,
                include: {
                    installation: { select: { id: true, name: true } },
                    user: { select: { id: true, email: true, phone: true } },
                    securityPost: {
                        include: {
                            company: { select: { id: true, name: true } },
                            installation: { select: { id: true, name: true } },
                        },
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
    async createSecurityGuard(req, res) {
        try {
            const { documentType, documentNumber, name, lastName, phone, email, position, securityPostId, schedule, observations, installationId, userId } = req.body;
            console.log('[createSecurityGuard] Body recibido:', JSON.stringify(req.body));
            console.log('[createSecurityGuard] Campos individually:', {
                documentType: `"${documentType}"`,
                documentNumber: `"${documentNumber}"`,
                name: `"${name}"`,
                lastName: `"${lastName}"`,
                phone: `"${phone}"`,
                position: `"${position}"`,
                installationId: `"${installationId}"`,
            });
            console.log('[createSecurityGuard] user:', req.user?.role);
            if (!documentType || !documentNumber || !name || !lastName || !phone || !position || !installationId) {
                const missing = [];
                if (!documentType)
                    missing.push('documentType');
                if (!documentNumber)
                    missing.push('documentNumber');
                if (!name)
                    missing.push('name');
                if (!lastName)
                    missing.push('lastName');
                if (!phone)
                    missing.push('phone');
                if (!position)
                    missing.push('position');
                if (!installationId)
                    missing.push('installationId');
                console.log('[createSecurityGuard] Campos faltantes:', missing);
                res.status(400).json({ success: false, error: `Campos requeridos faltantes: ${missing.join(', ')}` });
                return;
            }
            const existingGuard = await database_1.default.securityGuard.findUnique({
                where: { documentNumber },
            });
            if (existingGuard) {
                res.status(400).json({ success: false, error: 'Vigilante ya registrado' });
                return;
            }
            const guard = await database_1.default.securityGuard.create({
                data: {
                    documentType,
                    documentNumber,
                    name,
                    lastName,
                    phone,
                    email,
                    position,
                    securityPostId,
                    schedule,
                    observations,
                    installationId,
                    userId,
                },
                include: {
                    installation: { select: { id: true, name: true } },
                    securityPost: {
                        include: {
                            company: { select: { id: true, name: true } },
                            installation: { select: { id: true, name: true } },
                        },
                    },
                },
            });
            res.status(201).json({ success: true, data: guard });
        }
        catch (error) {
            console.error('Error creating security guard:', error);
            res.status(500).json({ success: false, error: 'Error al crear vigilante' });
        }
    }
    async updateSecurityGuard(req, res) {
        try {
            const { id } = req.params;
            const { documentType, documentNumber, name, lastName, phone, email, position, securityPostId, schedule, isActive, observations, userId } = req.body;
            const guard = await database_1.default.securityGuard.update({
                where: { id },
                data: {
                    ...(documentType && { documentType }),
                    ...(documentNumber && { documentNumber }),
                    ...(name && { name }),
                    ...(lastName && { lastName }),
                    ...(phone && { phone }),
                    ...(email !== undefined && { email }),
                    ...(position && { position }),
                    ...(securityPostId !== undefined && { securityPostId }),
                    ...(schedule !== undefined && { schedule }),
                    ...(isActive !== undefined && { isActive }),
                    ...(observations !== undefined && { observations }),
                    ...(userId !== undefined && { userId }),
                },
                include: {
                    installation: { select: { id: true, name: true } },
                    securityPost: {
                        include: {
                            company: { select: { id: true, name: true } },
                            installation: { select: { id: true, name: true } },
                        },
                    },
                },
            });
            res.json({ success: true, data: guard });
        }
        catch (error) {
            console.error('Error updating security guard:', error);
            res.status(500).json({ success: false, error: 'Error al actualizar vigilante' });
        }
    }
    async deleteSecurityGuard(req, res) {
        try {
            const { id } = req.params;
            await database_1.default.securityGuard.update({
                where: { id },
                data: { isActive: false },
            });
            res.json({ success: true, message: 'Vigilante desactivado' });
        }
        catch (error) {
            console.error('Error deleting security guard:', error);
            res.status(500).json({ success: false, error: 'Error al eliminar vigilante' });
        }
    }
    async getPhysicalSecurityStats(req, res) {
        try {
            const { installationId } = req.query;
            const where = {};
            if (installationId) {
                where.installationId = String(installationId);
            }
            const [totalGuards, activeGuards, guardsByCompany, guardsByPosition] = await Promise.all([
                database_1.default.securityGuard.count({ where }),
                database_1.default.securityGuard.count({ where: { ...where, isActive: true } }),
                database_1.default.securityGuard.groupBy({
                    by: ['companyId'],
                    where: { ...where, isActive: true },
                    _count: true,
                }),
                database_1.default.securityGuard.groupBy({
                    by: ['position'],
                    where: { ...where, isActive: true },
                    _count: true,
                }),
            ]);
            const companiesWithGuards = await database_1.default.securityCompany.findMany({
                where: { id: { in: guardsByCompany.map(g => g.companyId).filter(Boolean) } },
                select: { id: true, name: true },
            });
            const companyMap = companiesWithGuards.reduce((acc, c) => { acc[c.id] = c.name; return acc; }, {});
            res.json({
                success: true,
                data: {
                    totalGuards,
                    activeGuards,
                    guardsByCompany: guardsByCompany.reduce((acc, item) => {
                        acc[item.companyId ? companyMap[item.companyId] || 'Sin empresa' : 'Sin empresa'] = item._count;
                        return acc;
                    }, {}),
                    guardsByPosition: guardsByPosition.reduce((acc, item) => {
                        acc[item.position] = item._count;
                        return acc;
                    }, {}),
                },
            });
        }
        catch (error) {
            console.error('Error fetching physical security stats:', error);
            res.status(500).json({ success: false, error: 'Error al obtener estadísticas' });
        }
    }
    async getCompanies(req, res) {
        try {
            const { active } = req.query;
            const where = {};
            if (active === 'true') {
                where.isActive = true;
            }
            const companies = await database_1.default.securityCompany.findMany({
                where,
                orderBy: { name: 'asc' },
            });
            res.json({ success: true, data: companies });
        }
        catch (error) {
            console.error('Error fetching companies:', error);
            res.status(500).json({ success: false, error: 'Error al obtener empresas' });
        }
    }
    async createCompany(req, res) {
        try {
            const { name, nit, legalRepresentative, contractNumber, contractStartDate, contractEndDate, contractAmount, phone, email, address } = req.body;
            if (!name || !nit) {
                res.status(400).json({ success: false, error: 'Nombre y NIT son requeridos' });
                return;
            }
            const existingCompany = await database_1.default.securityCompany.findUnique({
                where: { nit },
            });
            if (existingCompany) {
                res.status(400).json({ success: false, error: 'Ya existe una empresa con este NIT' });
                return;
            }
            const company = await database_1.default.securityCompany.create({
                data: {
                    name,
                    nit,
                    legalRepresentative,
                    contractNumber,
                    contractStartDate: contractStartDate ? new Date(contractStartDate) : null,
                    contractEndDate: contractEndDate ? new Date(contractEndDate) : null,
                    contractAmount,
                    phone,
                    email,
                    address,
                },
            });
            res.status(201).json({ success: true, data: company });
        }
        catch (error) {
            console.error('Error creating company:', error);
            res.status(500).json({ success: false, error: 'Error al crear empresa' });
        }
    }
    async updateCompany(req, res) {
        try {
            const { id } = req.params;
            const { name, nit, legalRepresentative, contractNumber, contractStartDate, contractEndDate, contractAmount, phone, email, address, isActive } = req.body;
            const company = await database_1.default.securityCompany.update({
                where: { id },
                data: {
                    ...(name && { name }),
                    ...(nit && { nit }),
                    ...(legalRepresentative !== undefined && { legalRepresentative }),
                    ...(contractNumber !== undefined && { contractNumber }),
                    ...(contractStartDate !== undefined && { contractStartDate: contractStartDate ? new Date(contractStartDate) : null }),
                    ...(contractEndDate !== undefined && { contractEndDate: contractEndDate ? new Date(contractEndDate) : null }),
                    ...(contractAmount !== undefined && { contractAmount }),
                    ...(phone !== undefined && { phone }),
                    ...(email !== undefined && { email }),
                    ...(address !== undefined && { address }),
                    ...(isActive !== undefined && { isActive }),
                },
            });
            res.json({ success: true, data: company });
        }
        catch (error) {
            console.error('Error updating company:', error);
            res.status(500).json({ success: false, error: 'Error al actualizar empresa' });
        }
    }
    async deleteCompany(req, res) {
        try {
            const { id } = req.params;
            await database_1.default.securityCompany.update({
                where: { id },
                data: { isActive: false },
            });
            res.json({ success: true, message: 'Empresa desactivada' });
        }
        catch (error) {
            console.error('Error deleting company:', error);
            res.status(500).json({ success: false, error: 'Error al eliminar empresa' });
        }
    }
    async getPosts(req, res) {
        try {
            const { companyId, installationId } = req.query;
            const where = {};
            if (companyId)
                where.companyId = String(companyId);
            if (installationId)
                where.installationId = String(installationId);
            const posts = await database_1.default.securityPost.findMany({
                where,
                include: {
                    company: { select: { id: true, name: true } },
                    installation: { select: { id: true, name: true } },
                    guards: { where: { isActive: true } },
                },
                orderBy: { name: 'asc' },
            });
            res.json({ success: true, data: posts });
        }
        catch (error) {
            console.error('Error fetching posts:', error);
            res.status(500).json({ success: false, error: 'Error al obtener puestos' });
        }
    }
    async createPost(req, res) {
        try {
            const { name, description, schedule, guardsRequired, companyId, installationId, startDate, endDate, isAdditional } = req.body;
            if (!name || !companyId || !installationId) {
                res.status(400).json({ success: false, error: 'Nombre, empresa e instalación son requeridos' });
                return;
            }
            const post = await database_1.default.securityPost.create({
                data: {
                    name,
                    description,
                    schedule,
                    guardsRequired: guardsRequired || 1,
                    companyId,
                    installationId,
                    startDate: startDate ? new Date(startDate) : null,
                    endDate: endDate ? new Date(endDate) : null,
                    isAdditional: isAdditional || false,
                },
                include: {
                    company: { select: { id: true, name: true } },
                    installation: { select: { id: true, name: true } },
                },
            });
            res.status(201).json({ success: true, data: post });
        }
        catch (error) {
            console.error('Error creating post:', error);
            res.status(500).json({ success: false, error: 'Error al crear puesto' });
        }
    }
    async updatePost(req, res) {
        try {
            const { id } = req.params;
            const { name, description, schedule, guardsRequired, status, companyId, installationId, startDate, endDate, isAdditional, isActive } = req.body;
            const post = await database_1.default.securityPost.update({
                where: { id },
                data: {
                    ...(name && { name }),
                    ...(description !== undefined && { description }),
                    ...(schedule !== undefined && { schedule }),
                    ...(guardsRequired !== undefined && { guardsRequired }),
                    ...(status && { status }),
                    ...(companyId && { companyId }),
                    ...(installationId && { installationId }),
                    ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
                    ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
                    ...(isAdditional !== undefined && { isAdditional }),
                    ...(isActive !== undefined && { isActive }),
                },
                include: {
                    company: { select: { id: true, name: true } },
                    installation: { select: { id: true, name: true } },
                },
            });
            res.json({ success: true, data: post });
        }
        catch (error) {
            console.error('Error updating post:', error);
            res.status(500).json({ success: false, error: 'Error al actualizar puesto' });
        }
    }
    async deletePost(req, res) {
        try {
            const { id } = req.params;
            await database_1.default.securityPost.update({
                where: { id },
                data: { isActive: false },
            });
            res.json({ success: true, message: 'Puesto desactivado' });
        }
        catch (error) {
            console.error('Error deleting post:', error);
            res.status(500).json({ success: false, error: 'Error al eliminar puesto' });
        }
    }
}
exports.PhysicalSecurityController = PhysicalSecurityController;
exports.physicalSecurityController = new PhysicalSecurityController();
//# sourceMappingURL=PhysicalSecurityController.js.map