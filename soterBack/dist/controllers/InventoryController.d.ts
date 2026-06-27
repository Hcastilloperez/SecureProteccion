import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/verify';
export declare class InventoryController {
    getContracts(req: AuthenticatedRequest, res: Response): Promise<void>;
    createContract(req: AuthenticatedRequest, res: Response): Promise<void>;
    updateContract(req: AuthenticatedRequest, res: Response): Promise<void>;
    deleteContract(req: AuthenticatedRequest, res: Response): Promise<void>;
    getEquipments(req: AuthenticatedRequest, res: Response): Promise<void>;
    createEquipment(req: AuthenticatedRequest, res: Response): Promise<void>;
    assignEquipmentToInstallation(req: AuthenticatedRequest, res: Response): Promise<void>;
    updateEquipment(req: AuthenticatedRequest, res: Response): Promise<void>;
    deleteEquipment(req: AuthenticatedRequest, res: Response): Promise<void>;
    getMovements(req: AuthenticatedRequest, res: Response): Promise<void>;
    createMovement(req: AuthenticatedRequest, res: Response): Promise<void>;
    deleteMovement(req: AuthenticatedRequest, res: Response): Promise<void>;
    getStats(req: AuthenticatedRequest, res: Response): Promise<void>;
}
export declare const inventoryController: InventoryController;
//# sourceMappingURL=InventoryController.d.ts.map