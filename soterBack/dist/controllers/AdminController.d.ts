import { Request, Response } from 'express';
export declare class AdminController {
    getStatuses(req: Request, res: Response): Promise<void>;
    createStatus(req: Request, res: Response): Promise<void>;
    updateStatus(req: Request, res: Response): Promise<void>;
    deleteStatus(req: Request, res: Response): Promise<void>;
    getIncidentTypes(req: Request, res: Response): Promise<void>;
    createIncidentType(req: Request, res: Response): Promise<void>;
    updateIncidentType(req: Request, res: Response): Promise<void>;
    deleteIncidentType(req: Request, res: Response): Promise<void>;
    getConfigurations(req: Request, res: Response): Promise<void>;
    createConfiguration(req: Request, res: Response): Promise<void>;
    updateConfiguration(req: Request, res: Response): Promise<void>;
    deleteConfiguration(req: Request, res: Response): Promise<void>;
    getRoles(req: Request, res: Response): Promise<void>;
    createRole(req: Request, res: Response): Promise<void>;
    updateRole(req: Request, res: Response): Promise<void>;
    deleteRole(req: Request, res: Response): Promise<void>;
    getEquipmentTypes(req: Request, res: Response): Promise<void>;
    createEquipmentType(req: Request, res: Response): Promise<void>;
    updateEquipmentType(req: Request, res: Response): Promise<void>;
    deleteEquipmentType(req: Request, res: Response): Promise<void>;
    getDashboardStats(req: Request, res: Response): Promise<void>;
    getMaintenanceStats(req: Request, res: Response): Promise<void>;
}
export declare const adminController: AdminController;
//# sourceMappingURL=AdminController.d.ts.map