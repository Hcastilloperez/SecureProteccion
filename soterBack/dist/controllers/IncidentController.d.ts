import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/verify';
export declare class IncidentController {
    getAll(req: Request, res: Response): Promise<void>;
    getById(req: Request, res: Response): Promise<void>;
    create(req: AuthenticatedRequest, res: Response): Promise<void>;
    update(req: AuthenticatedRequest, res: Response): Promise<void>;
    addTimeline(req: AuthenticatedRequest, res: Response): Promise<void>;
    close(req: AuthenticatedRequest, res: Response): Promise<void>;
    escalate(req: AuthenticatedRequest, res: Response): Promise<void>;
    receive(req: AuthenticatedRequest, res: Response): Promise<void>;
    verify(req: AuthenticatedRequest, res: Response): Promise<void>;
    getStats(req: Request, res: Response): Promise<void>;
}
export declare const incidentController: IncidentController;
//# sourceMappingURL=IncidentController.d.ts.map