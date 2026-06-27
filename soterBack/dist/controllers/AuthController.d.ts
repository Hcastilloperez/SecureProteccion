import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/verify';
export declare class AuthController {
    login(req: Request, res: Response): Promise<void>;
    register(req: Request, res: Response): Promise<void>;
    profile(req: AuthenticatedRequest, res: Response): Promise<void>;
    changePassword(req: AuthenticatedRequest, res: Response): Promise<void>;
}
export declare const authController: AuthController;
//# sourceMappingURL=AuthController.d.ts.map