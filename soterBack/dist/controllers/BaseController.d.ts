import { Request, Response } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
import { QueryParams } from '../types';
export declare class BaseController<T extends {
    id: string;
}> {
    protected prisma: PrismaClient;
    protected model: any;
    protected modelName: string;
    constructor(prisma: PrismaClient, model: any, modelName: string);
    protected getPaginationParams(query: QueryParams): {
        page: number;
        limit: number;
        skip: number;
    };
    protected buildWhereClause(query: QueryParams): Prisma.WhereInput;
    protected getSearchFields(): string[];
    findAll(req: Request, res: Response): Promise<void>;
    findById(req: Request, res: Response): Promise<void>;
    create(req: Request, res: Response): Promise<void>;
    update(req: Request, res: Response): Promise<void>;
    delete(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=BaseController.d.ts.map