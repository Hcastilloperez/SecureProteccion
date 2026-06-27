import { Request, Response } from 'express';
export declare class ElectronicSecurityController {
    getSystems(req: Request, res: Response): Promise<void>;
    createSystem(req: Request, res: Response): Promise<void>;
    updateSystem(req: Request, res: Response): Promise<void>;
    deleteSystem(req: Request, res: Response): Promise<void>;
    getEquipments(req: Request, res: Response): Promise<void>;
    createEquipment(req: Request, res: Response): Promise<void>;
    assignEquipment(req: Request, res: Response): Promise<void>;
    updateEquipment(req: Request, res: Response): Promise<void>;
    deleteEquipment(req: Request, res: Response): Promise<void>;
    getMaintenanceSchedules(req: Request, res: Response): Promise<void>;
    createMaintenanceSchedule(req: Request, res: Response): Promise<void>;
    updateMaintenanceSchedule(req: Request, res: Response): Promise<void>;
    getInventoryStats(req: Request, res: Response): Promise<void>;
}
export declare const electronicSecurityController: ElectronicSecurityController;
//# sourceMappingURL=ElectronicSecurityController.d.ts.map