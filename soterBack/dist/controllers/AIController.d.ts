import { Request, Response } from 'express';
export declare class AIController {
    getRecommendations(req: Request, res: Response): Promise<void>;
    analyzeIncident(req: Request, res: Response): Promise<void>;
    analyzeSecurityStudy(req: Request, res: Response): Promise<void>;
    getConfigurations(req: Request, res: Response): Promise<void>;
    createConfiguration(req: Request, res: Response): Promise<void>;
    updateConfiguration(req: Request, res: Response): Promise<void>;
    testConfiguration(req: Request, res: Response): Promise<void>;
    getAvailableModels(req: Request, res: Response): Promise<void>;
    setDefaultModel(req: Request, res: Response): Promise<void>;
    getDefaultConfig(req: Request, res: Response): Promise<void>;
}
export declare const aiController: AIController;
//# sourceMappingURL=AIController.d.ts.map