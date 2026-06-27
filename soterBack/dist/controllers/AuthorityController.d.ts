import { Request, Response } from 'express';
export declare class AuthorityController {
    getAll(req: Request, res: Response): Promise<void>;
    getById(req: Request, res: Response): Promise<void>;
    create(req: Request, res: Response): Promise<void>;
    update(req: Request, res: Response): Promise<void>;
    delete(req: Request, res: Response): Promise<void>;
}
export declare const authorityController: AuthorityController;
//# sourceMappingURL=AuthorityController.d.ts.map