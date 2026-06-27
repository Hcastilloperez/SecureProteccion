import { Request, Response } from 'express';
export declare class SecurityStudyController {
    getAll(req: Request, res: Response): Promise<void>;
    getById(req: Request, res: Response): Promise<void>;
    create(req: Request, res: Response): Promise<void>;
    update(req: Request, res: Response): Promise<void>;
    delete(req: Request, res: Response): Promise<void>;
    generateWithAI(req: Request, res: Response): Promise<void>;
}
export declare const securityStudyController: SecurityStudyController;
//# sourceMappingURL=SecurityStudyController.d.ts.map