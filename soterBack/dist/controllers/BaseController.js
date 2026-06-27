"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseController = void 0;
class BaseController {
    prisma;
    model;
    modelName;
    constructor(prisma, model, modelName) {
        this.prisma = prisma;
        this.model = model;
        this.modelName = modelName;
    }
    getPaginationParams(query) {
        const page = Math.max(1, parseInt(String(query.page || '1'), 10));
        const limit = Math.min(100, Math.max(1, parseInt(String(query.limit || '20'), 10)));
        const skip = (page - 1) * limit;
        return { page, limit, skip };
    }
    buildWhereClause(query) {
        const where = {};
        if (query.search) {
            const searchFields = this.getSearchFields();
            if (searchFields.length > 0) {
                where.OR = searchFields.map((field) => ({
                    [field]: { contains: String(query.search), mode: 'insensitive' },
                }));
            }
        }
        return where;
    }
    getSearchFields() {
        return [];
    }
    async findAll(req, res) {
        try {
            const { page, limit, skip } = this.getPaginationParams(req.query);
            const where = this.buildWhereClause(req.query);
            const [data, total] = await Promise.all([
                this.model.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                }),
                this.model.count({ where }),
            ]);
            const response = {
                success: true,
                data: data,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            };
            res.json(response);
        }
        catch (error) {
            console.error(`Error fetching ${this.modelName}:`, error);
            res.status(500).json({ success: false, error: `Error al obtener ${this.modelName}` });
        }
    }
    async findById(req, res) {
        try {
            const { id } = req.params;
            const data = await this.model.findUnique({ where: { id } });
            if (!data) {
                res.status(404).json({ success: false, error: `${this.modelName} no encontrado` });
                return;
            }
            res.json({ success: true, data: data });
        }
        catch (error) {
            console.error(`Error fetching ${this.modelName}:`, error);
            res.status(500).json({ success: false, error: `Error al obtener ${this.modelName}` });
        }
    }
    async create(req, res) {
        try {
            const data = await this.model.create({ data: req.body });
            res.status(201).json({ success: true, data: data });
        }
        catch (error) {
            console.error(`Error creating ${this.modelName}:`, error);
            res.status(500).json({ success: false, error: `Error al crear ${this.modelName}` });
        }
    }
    async update(req, res) {
        try {
            const { id } = req.params;
            const data = await this.model.update({
                where: { id },
                data: req.body,
            });
            res.json({ success: true, data: data });
        }
        catch (error) {
            console.error(`Error updating ${this.modelName}:`, error);
            res.status(500).json({ success: false, error: `Error al actualizar ${this.modelName}` });
        }
    }
    async delete(req, res) {
        try {
            const { id } = req.params;
            await this.model.delete({ where: { id } });
            res.json({ success: true, message: `${this.modelName} eliminado` });
        }
        catch (error) {
            console.error(`Error deleting ${this.modelName}:`, error);
            res.status(500).json({ success: false, error: `Error al eliminar ${this.modelName}` });
        }
    }
}
exports.BaseController = BaseController;
//# sourceMappingURL=BaseController.js.map