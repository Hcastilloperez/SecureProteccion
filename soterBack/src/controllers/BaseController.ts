import { Request, Response } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
import { ApiResponse, PaginatedResponse, QueryParams } from '../types';

export class BaseController<T extends { id: string }> {
  protected prisma: PrismaClient;
  protected model: any;
  protected modelName: string;

  constructor(prisma: PrismaClient, model: any, modelName: string) {
    this.prisma = prisma;
    this.model = model;
    this.modelName = modelName;
  }

  protected getPaginationParams(query: QueryParams) {
    const page = Math.max(1, parseInt(String(query.page || '1'), 10));
    const limit = Math.min(100, Math.max(1, parseInt(String(query.limit || '20'), 10)));
    const skip = (page - 1) * limit;
    return { page, limit, skip };
  }

  protected buildWhereClause(query: QueryParams): Prisma.WhereInput {
    const where: Prisma.WhereInput = {};

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

  protected getSearchFields(): string[] {
    return [];
  }

  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit, skip } = this.getPaginationParams(req.query as QueryParams);
      const where = this.buildWhereClause(req.query as QueryParams);

      const [data, total] = await Promise.all([
        this.model.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.model.count({ where }),
      ]);

      const response: PaginatedResponse<T> = {
        success: true,
        data: data as T[],
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };

      res.json(response);
    } catch (error) {
      console.error(`Error fetching ${this.modelName}:`, error);
      res.status(500).json({ success: false, error: `Error al obtener ${this.modelName}` });
    }
  }

  async findById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = await this.model.findUnique({ where: { id } });

      if (!data) {
        res.status(404).json({ success: false, error: `${this.modelName} no encontrado` });
        return;
      }

      res.json({ success: true, data: data as T });
    } catch (error) {
      console.error(`Error fetching ${this.modelName}:`, error);
      res.status(500).json({ success: false, error: `Error al obtener ${this.modelName}` });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const data = await this.model.create({ data: req.body });
      res.status(201).json({ success: true, data: data as T });
    } catch (error) {
      console.error(`Error creating ${this.modelName}:`, error);
      res.status(500).json({ success: false, error: `Error al crear ${this.modelName}` });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = await this.model.update({
        where: { id },
        data: req.body,
      });

      res.json({ success: true, data: data as T });
    } catch (error) {
      console.error(`Error updating ${this.modelName}:`, error);
      res.status(500).json({ success: false, error: `Error al actualizar ${this.modelName}` });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.model.delete({ where: { id } });
      res.json({ success: true, message: `${this.modelName} eliminado` });
    } catch (error) {
      console.error(`Error deleting ${this.modelName}:`, error);
      res.status(500).json({ success: false, error: `Error al eliminar ${this.modelName}` });
    }
  }
}