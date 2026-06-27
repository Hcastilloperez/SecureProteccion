import { Request, Response } from 'express';
export declare class EscortController {
    getAll(req: Request, res: Response): Promise<void>;
    create(req: Request, res: Response): Promise<void>;
    update(req: Request, res: Response): Promise<void>;
    delete(req: Request, res: Response): Promise<void>;
    getRoutes(req: Request, res: Response): Promise<void>;
    createRoute(req: Request, res: Response): Promise<void>;
    updateRoute(req: Request, res: Response): Promise<void>;
    getMovements(req: Request, res: Response): Promise<void>;
    createMovement(req: Request, res: Response): Promise<void>;
    updateMovement(req: Request, res: Response): Promise<void>;
    getTodayMovements(req: Request, res: Response): Promise<void>;
    getAssignments(req: Request, res: Response): Promise<void>;
    createAssignment(req: Request, res: Response): Promise<void>;
    updateAssignment(req: Request, res: Response): Promise<void>;
}
export declare const escortController: EscortController;
//# sourceMappingURL=EscortController.d.ts.map