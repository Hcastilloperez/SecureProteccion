"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.inventoryController = exports.InventoryController = void 0;
const database_1 = __importDefault(require("../config/database"));
class InventoryController {
    async getContracts(req, res) {
        try {
            const { active } = req.query;
            const where = {};
            if (active === 'true')
                where.status = 'ACTIVE';
            const contracts = await database_1.default.investmentContract.findMany({
                where,
                orderBy: { createdAt: 'desc' },
            });
            res.json({ success: true, data: contracts });
        }
        catch (error) {
            console.error('Error fetching contracts:', error);
            res.status(500).json({ success: false, error: 'Error al obtener contratos' });
        }
    }
    async createContract(req, res) {
        try {
            const { code, name, description, provider, contractNumber, orderNumber, investmentType, totalAmount, startDate, endDate, status } = req.body;
            const userId = req.user?.userId;
            if (!code || !name) {
                res.status(400).json({ success: false, error: 'Código y nombre son requeridos' });
                return;
            }
            const existing = await database_1.default.investmentContract.findUnique({ where: { code } });
            if (existing) {
                res.status(400).json({ success: false, error: 'Ya existe un contrato con este código' });
                return;
            }
            const contract = await database_1.default.investmentContract.create({
                data: {
                    code,
                    name,
                    description,
                    provider,
                    contractNumber,
                    orderNumber,
                    investmentType: investmentType || 'PURCHASE',
                    totalAmount,
                    startDate: startDate ? new Date(startDate) : null,
                    endDate: endDate ? new Date(endDate) : null,
                    status: status || 'ACTIVE',
                    creatorId: userId,
                },
            });
            res.status(201).json({ success: true, data: contract });
        }
        catch (error) {
            console.error('Error creating contract:', error);
            res.status(500).json({ success: false, error: 'Error al crear contrato' });
        }
    }
    async updateContract(req, res) {
        try {
            const { id } = req.params;
            const { code, name, description, provider, contractNumber, orderNumber, investmentType, totalAmount, startDate, endDate, status } = req.body;
            const contract = await database_1.default.investmentContract.update({
                where: { id },
                data: {
                    ...(code && { code }),
                    ...(name && { name }),
                    ...(description !== undefined && { description }),
                    ...(provider !== undefined && { provider }),
                    ...(contractNumber !== undefined && { contractNumber }),
                    ...(orderNumber !== undefined && { orderNumber }),
                    ...(investmentType && { investmentType }),
                    ...(totalAmount !== undefined && { totalAmount }),
                    ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
                    ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
                    ...(status && { status }),
                },
            });
            res.json({ success: true, data: contract });
        }
        catch (error) {
            console.error('Error updating contract:', error);
            res.status(500).json({ success: false, error: 'Error al actualizar contrato' });
        }
    }
    async deleteContract(req, res) {
        try {
            const { id } = req.params;
            await database_1.default.investmentContract.delete({ where: { id } });
            res.json({ success: true, message: 'Contrato eliminado' });
        }
        catch (error) {
            console.error('Error deleting contract:', error);
            res.status(500).json({ success: false, error: 'Error al eliminar contrato' });
        }
    }
    async getEquipments(req, res) {
        try {
            const { installationId, contractId, status } = req.query;
            const where = {};
            if (installationId)
                where.installationId = String(installationId);
            if (contractId)
                where.investmentContractId = String(contractId);
            if (status)
                where.status = String(status);
            const equipments = await database_1.default.equipment.findMany({
                where,
                include: {
                    equipmentType: true,
                    investmentContract: true,
                    installation: { select: { id: true, name: true } },
                    securitySystem: { select: { id: true, name: true } },
                    movements: {
                        include: {
                            fromInstallation: { select: { id: true, name: true } },
                            toInstallation: { select: { id: true, name: true } },
                            fromSecuritySystem: { select: { id: true, name: true } },
                            toSecuritySystem: { select: { id: true, name: true } },
                        },
                        orderBy: { movementDate: 'desc' },
                    },
                },
                orderBy: { createdAt: 'desc' },
            });
            res.json({ success: true, data: equipments });
        }
        catch (error) {
            console.error('Error fetching equipments:', error);
            res.status(500).json({ success: false, error: 'Error al obtener equipos' });
        }
    }
    async createEquipment(req, res) {
        try {
            const userId = req.user?.userId;
            const { name, type, brand, model, serialNumber, status, location, ipAddress, macAddress, firmwareVersion, expirationDate, notes, specifications, purchaseDate, investmentContractId, equipmentTypeId } = req.body;
            if (!name || !type) {
                res.status(400).json({ success: false, error: 'Nombre y tipo son requeridos' });
                return;
            }
            const equipmentData = {
                name,
                type,
                brand,
                model,
                serialNumber,
                status: status || 'ACTIVE',
                location,
                ipAddress: ipAddress || null,
                macAddress: macAddress || null,
                firmwareVersion,
                expirationDate: expirationDate ? new Date(expirationDate) : null,
                notes,
                specifications: specifications || {},
                purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
                creatorId: userId,
            };
            if (investmentContractId && investmentContractId.trim()) {
                equipmentData.investmentContractId = investmentContractId;
            }
            if (equipmentTypeId && equipmentTypeId.trim()) {
                equipmentData.equipmentTypeId = equipmentTypeId;
            }
            const equipment = await database_1.default.equipment.create({
                data: equipmentData,
                include: {
                    investmentContract: true,
                    equipmentType: true,
                    installation: { select: { id: true, name: true } },
                    securitySystem: { select: { id: true, name: true } },
                    movements: true,
                },
            });
            res.status(201).json({ success: true, data: equipment });
        }
        catch (error) {
            console.error('Error creating equipment:', error);
            res.status(500).json({ success: false, error: 'Error al crear equipo' });
        }
    }
    async assignEquipmentToInstallation(req, res) {
        try {
            const userId = req.user?.userId;
            const { equipmentId, installationId, securitySystemId } = req.body;
            if (!equipmentId || !installationId) {
                res.status(400).json({ success: false, error: 'Equipo e instalación son requeridos' });
                return;
            }
            const existing = await database_1.default.equipment.findUnique({ where: { id: equipmentId } });
            if (!existing) {
                res.status(404).json({ success: false, error: 'Equipo no encontrado' });
                return;
            }
            if (existing.installationId) {
                res.status(400).json({ success: false, error: 'El equipo ya está asignado a una instalación' });
                return;
            }
            const equipment = await database_1.default.equipment.update({
                where: { id: equipmentId },
                data: {
                    installationId,
                    securitySystemId,
                    installationDate: new Date(),
                },
                include: {
                    investmentContract: true,
                    equipmentType: true,
                    installation: { select: { id: true, name: true } },
                    securitySystem: { select: { id: true, name: true } },
                    movements: true,
                },
            });
            await database_1.default.equipmentMovement.create({
                data: {
                    equipmentId: equipment.id,
                    fromInstallationId: null,
                    toInstallationId: installationId,
                    fromSecuritySystemId: null,
                    toSecuritySystemId: securitySystemId,
                    movementDate: new Date(),
                    status: 'INSTALLED',
                    reason: 'Asignación a instalación',
                    creatorId: userId,
                },
            });
            res.json({ success: true, data: equipment });
        }
        catch (error) {
            console.error('Error assigning equipment:', error);
            res.status(500).json({ success: false, error: 'Error al asignar equipo' });
        }
    }
    async updateEquipment(req, res) {
        try {
            const { id } = req.params;
            const { name, type, brand, model, serialNumber, status, location, ipAddress, macAddress, firmwareVersion, expirationDate, notes, specifications, purchaseDate, investmentContractId, installationId, securitySystemId } = req.body;
            const existing = await database_1.default.equipment.findUnique({ where: { id } });
            const oldInstallationId = existing?.installationId;
            const oldSecuritySystemId = existing?.securitySystemId;
            const equipment = await database_1.default.equipment.update({
                where: { id },
                data: {
                    ...(name && { name }),
                    ...(type && { type }),
                    ...(brand !== undefined && { brand }),
                    ...(model !== undefined && { model }),
                    ...(serialNumber !== undefined && { serialNumber }),
                    ...(status && { status }),
                    ...(location !== undefined && { location }),
                    ...(ipAddress !== undefined && { ipAddress: ipAddress || null }),
                    ...(macAddress !== undefined && { macAddress: macAddress || null }),
                    ...(firmwareVersion !== undefined && { firmwareVersion }),
                    ...(expirationDate !== undefined && { expirationDate: expirationDate ? new Date(expirationDate) : null }),
                    ...(notes !== undefined && { notes }),
                    ...(specifications !== undefined && { specifications }),
                    ...(purchaseDate !== undefined && { purchaseDate: purchaseDate ? new Date(purchaseDate) : null }),
                    ...(investmentContractId !== undefined && { investmentContractId }),
                    ...(installationId !== undefined && { installationId }),
                    ...(securitySystemId !== undefined && { securitySystemId }),
                },
                include: {
                    investmentContract: true,
                    installation: { select: { id: true, name: true } },
                    securitySystem: { select: { id: true, name: true } },
                    movements: {
                        include: {
                            fromInstallation: { select: { id: true, name: true } },
                            toInstallation: { select: { id: true, name: true } },
                            fromSecuritySystem: { select: { id: true, name: true } },
                            toSecuritySystem: { select: { id: true, name: true } },
                        },
                        orderBy: { movementDate: 'desc' },
                    },
                },
            });
            if (installationId && (oldInstallationId !== installationId || oldSecuritySystemId !== securitySystemId)) {
                await database_1.default.equipmentMovement.create({
                    data: {
                        equipmentId: id,
                        fromInstallationId: oldInstallationId,
                        toInstallationId: installationId,
                        fromSecuritySystemId: oldSecuritySystemId,
                        toSecuritySystemId: securitySystemId,
                        movementDate: new Date(),
                        status: 'MOVED',
                        reason: 'Actualización de ubicación',
                        creatorId: req.user?.userId,
                    },
                });
            }
            res.json({ success: true, data: equipment });
        }
        catch (error) {
            console.error('Error updating equipment:', error);
            res.status(500).json({ success: false, error: 'Error al actualizar equipo' });
        }
    }
    async deleteEquipment(req, res) {
        try {
            const { id } = req.params;
            await database_1.default.equipment.update({
                where: { id },
                data: { status: 'DECOMMISSIONED' },
            });
            res.json({ success: true, message: 'Equipo dado de baja' });
        }
        catch (error) {
            console.error('Error decommisioning equipment:', error);
            res.status(500).json({ success: false, error: 'Error al dar de baja equipo' });
        }
    }
    async getMovements(req, res) {
        try {
            const { equipmentId, installationId } = req.query;
            const where = {};
            if (equipmentId)
                where.equipmentId = String(equipmentId);
            if (installationId) {
                where.OR = [
                    { fromInstallationId: String(installationId) },
                    { toInstallationId: String(installationId) },
                ];
            }
            const movements = await database_1.default.equipmentMovement.findMany({
                where,
                include: {
                    equipment: { select: { id: true, name: true, serialNumber: true } },
                    fromInstallation: { select: { id: true, name: true } },
                    toInstallation: { select: { id: true, name: true } },
                    fromSecuritySystem: { select: { id: true, name: true } },
                    toSecuritySystem: { select: { id: true, name: true } },
                },
                orderBy: { movementDate: 'desc' },
            });
            res.json({ success: true, data: movements });
        }
        catch (error) {
            console.error('Error fetching movements:', error);
            res.status(500).json({ success: false, error: 'Error al obtener movimientos' });
        }
    }
    async createMovement(req, res) {
        try {
            const userId = req.user?.userId;
            const { equipmentId, fromInstallationId, toInstallationId, fromSecuritySystemId, toSecuritySystemId, movementDate, status, reason, notes } = req.body;
            if (!equipmentId || !toInstallationId) {
                res.status(400).json({ success: false, error: 'Equipo y instalación destino son requeridos' });
                return;
            }
            const movement = await database_1.default.equipmentMovement.create({
                data: {
                    equipmentId,
                    fromInstallationId,
                    toInstallationId,
                    fromSecuritySystemId,
                    toSecuritySystemId,
                    movementDate: new Date(movementDate),
                    status: status || 'MOVED',
                    reason,
                    notes,
                    creatorId: userId,
                },
                include: {
                    equipment: { select: { id: true, name: true, serialNumber: true } },
                    fromInstallation: { select: { id: true, name: true } },
                    toInstallation: { select: { id: true, name: true } },
                    fromSecuritySystem: { select: { id: true, name: true } },
                    toSecuritySystem: { select: { id: true, name: true } },
                },
            });
            await database_1.default.equipment.update({
                where: { id: equipmentId },
                data: {
                    installationId: toInstallationId,
                    securitySystemId: toSecuritySystemId,
                    status: status === 'IN_REPAIR' ? 'IN_REPAIR' : status === 'DECOMMISSIONED' ? 'DECOMMISSIONED' : status === 'IN_STORAGE' ? 'INACTIVE' : 'ACTIVE',
                },
            });
            res.status(201).json({ success: true, data: movement });
        }
        catch (error) {
            console.error('Error creating movement:', error);
            res.status(500).json({ success: false, error: 'Error al crear movimiento' });
        }
    }
    async deleteMovement(req, res) {
        try {
            const { id } = req.params;
            await database_1.default.equipmentMovement.delete({ where: { id } });
            res.json({ success: true, message: 'Movimiento eliminado' });
        }
        catch (error) {
            console.error('Error deleting movement:', error);
            res.status(500).json({ success: false, error: 'Error al eliminar movimiento' });
        }
    }
    async getStats(req, res) {
        try {
            const [totalEquipments, activeEquipments, inRepairEquipments, inactiveEquipments, decommissionedEquipments, standbyEquipments, totalContracts, activeContracts, totalAmount,] = await Promise.all([
                database_1.default.equipment.count(),
                database_1.default.equipment.count({ where: { status: 'ACTIVE' } }),
                database_1.default.equipment.count({ where: { status: 'IN_REPAIR' } }),
                database_1.default.equipment.count({ where: { status: 'INACTIVE' } }),
                database_1.default.equipment.count({ where: { status: 'DECOMMISSIONED' } }),
                database_1.default.equipment.count({ where: { status: 'STANDBY' } }),
                database_1.default.investmentContract.count(),
                database_1.default.investmentContract.count({ where: { status: 'ACTIVE' } }),
                database_1.default.investmentContract.aggregate({ _sum: { totalAmount: true } }),
            ]);
            res.json({
                success: true,
                data: {
                    totalEquipments,
                    activeEquipments,
                    inRepairEquipments,
                    inactiveEquipments,
                    decommissionedEquipments,
                    standbyEquipments,
                    totalContracts,
                    activeContracts,
                    totalInvestment: totalAmount._sum.totalAmount || 0,
                },
            });
        }
        catch (error) {
            console.error('Error fetching inventory stats:', error);
            res.status(500).json({ success: false, error: 'Error al obtener estadísticas de inventario' });
        }
    }
}
exports.InventoryController = InventoryController;
exports.inventoryController = new InventoryController();
//# sourceMappingURL=InventoryController.js.map