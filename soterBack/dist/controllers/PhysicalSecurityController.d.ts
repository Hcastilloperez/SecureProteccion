import { Request, Response } from 'express';
export declare class PhysicalSecurityController {
    getSecurityGuards(req: Request, res: Response): Promise<void>;
    createSecurityGuard(req: Request, res: Response): Promise<void>;
    updateSecurityGuard(req: Request, res: Response): Promise<void>;
    deleteSecurityGuard(req: Request, res: Response): Promise<void>;
    getPhysicalSecurityStats(req: Request, res: Response): Promise<void>;
    getCompanies(req: Request, res: Response): Promise<void>;
    createCompany(req: Request, res: Response): Promise<void>;
    updateCompany(req: Request, res: Response): Promise<void>;
    deleteCompany(req: Request, res: Response): Promise<void>;
    getPosts(req: Request, res: Response): Promise<void>;
    createPost(req: Request, res: Response): Promise<void>;
    updatePost(req: Request, res: Response): Promise<void>;
    deletePost(req: Request, res: Response): Promise<void>;
}
export declare const physicalSecurityController: PhysicalSecurityController;
//# sourceMappingURL=PhysicalSecurityController.d.ts.map