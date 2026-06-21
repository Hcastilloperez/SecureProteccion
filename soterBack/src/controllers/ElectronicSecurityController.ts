import { Request, Response } from 'express';
import prisma from '../config/database';

export class ElectronicSecurityController {
  async getSystems(req: Request, res: Response): Promise<void> {
    try {
      const { installationId } = req.query;

      const where: any = {};
      if (installationId) {
        where.installationId = String(installationId);
      }

      const systems = await prisma.securitySystem.findMany({
        where,
        include: {
          installation: { select: { id: true, name: true } },
          _count: { select: { equipments: true, maintenanceSchedules: true } },
        },
        orderBy: { name: 'asc' },
      });

      res.json({ success: true, data: systems });
    } catch (error) {
      console.error('Error fetching systems:', error);
      res.status(500).json({ success: false, error: 'Error al obtener sistemas' });
    }
  }

  async createSystem(req: Request, res: Response): Promise<void> {
    try {
      const { name, type, brand, model, serialNumber, location, description, installationId, installationDate } = req.body;

      if (!name || !type || !installationId) {
        res.status(400).json({ success: false, error: 'Campos requeridos faltantes' });
        return;
      }

      const system = await prisma.securitySystem.create({
        data: {
          name,
          type,
          brand,
          model,
          serialNumber,
          location,
          description,
          installationId,
          installationDate: installationDate ? new Date(installationDate) : null,
        },
        include: {
          installation: { select: { id: true, name: true } },
        },
      });

      res.status(201).json({ success: true, data: system });
    } catch (error) {
      console.error('Error creating system:', error);
      res.status(500).json({ success: false, error: 'Error al crear sistema' });
    }
  }

  async updateSystem(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, type, brand, model, serialNumber, location, description, isActive } = req.body;

      const system = await prisma.securitySystem.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(type && { type }),
          ...(brand !== undefined && { brand }),
          ...(model !== undefined && { model }),
          ...(serialNumber !== undefined && { serialNumber }),
          ...(location !== undefined && { location }),
          ...(description !== undefined && { description }),
          ...(isActive !== undefined && { isActive }),
        },
      });

      res.json({ success: true, data: system });
    } catch (error) {
      console.error('Error updating system:', error);
      res.status(500).json({ success: false, error: 'Error al actualizar sistema' });
    }
  }

  async deleteSystem(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await prisma.securitySystem.delete({ where: { id } });

      res.json({ success: true, message: 'Sistema eliminado' });
    } catch (error) {
      console.error('Error deleting system:', error);
      res.status(500).json({ success: false, error: 'Error al eliminar sistema' });
    }
  }

  async getEquipments(req: Request, res: Response): Promise<void> {
    try {
      const { installationId, securitySystemId, equipmentTypeId } = req.query;

      const where: any = {};
      if (installationId === 'available') {
        where.installationId = null;
      } else if (installationId && installationId !== '') {
        where.installationId = String(installationId);
      }
      if (securitySystemId) {
        where.securitySystemId = String(securitySystemId);
      }
      if (equipmentTypeId) {
        where.equipmentTypeId = String(equipmentTypeId);
      }

      const equipments = await prisma.equipment.findMany({
        where,
        include: {
          equipmentType: true,
          investmentContract: true,
          installation: { select: { id: true, name: true } },
          securitySystem: { select: { id: true, name: true, type: true } },
          creator: { select: { id: true, name: true, lastName: true } },
        },
        orderBy: { name: 'asc' },
      });

      res.json({ success: true, data: equipments });
    } catch (error) {
      console.error('Error fetching equipments:', error);
      res.status(500).json({ success: false, error: 'Error al obtener equipos' });
    }
  }

  async createEquipment(req: Request, res: Response): Promise<void> {
    try {
      const creatorId = (req as any).user?.userId;
      const {
        name, type, brand, model, serialNumber, status, location,
        ipAddress, macAddress, firmwareVersion, expirationDate, notes,
        specifications, securitySystemId, equipmentTypeId, investmentContractId
      } = req.body;

      if (!name || !type) {
        res.status(400).json({ success: false, error: 'Campos requeridos faltantes' });
        return;
      }

      const equipment = await prisma.equipment.create({
        data: {
          name,
          type,
          brand,
          model,
          serialNumber,
          status: status || 'ACTIVE',
          location,
          ipAddress,
          macAddress,
          firmwareVersion,
          expirationDate: expirationDate ? new Date(expirationDate) : null,
          notes,
          specifications,
          equipmentTypeId,
          investmentContractId,
          securitySystemId,
          creatorId,
        },
        include: {
          equipmentType: true,
          investmentContract: true,
          securitySystem: { select: { id: true, name: true, type: true } },
          creator: { select: { id: true, name: true, lastName: true } },
        },
      });

      res.status(201).json({ success: true, data: equipment });
    } catch (error) {
      console.error('Error creating equipment:', error);
      res.status(500).json({ success: false, error: 'Error al crear equipo' });
    }
  }

  async assignEquipment(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const {
        equipmentId,
        installationId,
        securitySystemId,
        location,
        latitude,
        longitude,
        ipAddress,
        macAddress,
        firmwareVersion,
        notes
      } = req.body;

      if (!equipmentId || !installationId || !securitySystemId) {
        res.status(400).json({ success: false, error: 'Equipo, instalación y subsistema son requeridos' });
        return;
      }

      const existing = await prisma.equipment.findUnique({ where: { id: equipmentId } });
      if (!existing) {
        res.status(404).json({ success: false, error: 'Equipo no encontrado' });
        return;
      }

      if (existing.installationId && existing.installationId !== installationId) {
        res.status(400).json({ success: false, error: 'El equipo ya está asignado a otra instalación' });
        return;
      }

      const previousSystemId = existing.securitySystemId;
      const previousInstallationId = existing.installationId;

      const equipment = await prisma.equipment.update({
        where: { id: equipmentId },
        data: {
          installationId,
          securitySystemId,
          location,
          latitude,
          longitude,
          ipAddress: ipAddress || null,
          macAddress: macAddress || null,
          firmwareVersion,
          notes,
          installationDate: existing.installationDate || new Date(),
          status: 'ACTIVE',
        },
        include: {
          equipmentType: true,
          investmentContract: true,
          installation: { select: { id: true, name: true } },
          securitySystem: { select: { id: true, name: true, type: true } },
          creator: { select: { id: true, name: true, lastName: true } },
        },
      });

      const movementReason = previousInstallationId
        ? 'Reubicación de equipo'
        : 'Instalación inicial';

      await prisma.equipmentMovement.create({
        data: {
          equipmentId: equipment.id,
          fromInstallationId: previousInstallationId,
          toInstallationId: installationId,
          fromSecuritySystemId: previousSystemId,
          toSecuritySystemId: securitySystemId,
          movementDate: new Date(),
          status: 'INSTALLED',
          reason: notes || movementReason,
          creatorId: userId,
        },
      });

      res.json({ success: true, data: equipment });
    } catch (error) {
      console.error('Error assigning equipment:', error);
      res.status(500).json({ success: false, error: 'Error al asignar equipo' });
    }
  }

  async updateEquipment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, type, brand, model, serialNumber, status, location, latitude, longitude, ipAddress, macAddress, firmwareVersion, expirationDate, notes, specifications, deliveryDate } = req.body;

      const equipment = await prisma.equipment.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(type && { type }),
          ...(brand !== undefined && { brand }),
          ...(model !== undefined && { model }),
          ...(serialNumber !== undefined && { serialNumber }),
          ...(status && { status }),
          ...(location !== undefined && { location }),
          ...(latitude !== undefined && { latitude }),
          ...(longitude !== undefined && { longitude }),
          ...(ipAddress !== undefined && { ipAddress }),
          ...(macAddress !== undefined && { macAddress }),
          ...(firmwareVersion !== undefined && { firmwareVersion }),
          ...(expirationDate !== undefined && { expirationDate: expirationDate ? new Date(expirationDate) : null }),
          ...(notes !== undefined && { notes }),
          ...(specifications !== undefined && { specifications }),
          ...(deliveryDate !== undefined && { deliveryDate: deliveryDate ? new Date(deliveryDate) : null }),
        },
      });

      res.json({ success: true, data: equipment });
    } catch (error) {
      console.error('Error updating equipment:', error);
      res.status(500).json({ success: false, error: 'Error al actualizar equipo' });
    }
  }

  async deleteEquipment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await prisma.equipment.delete({ where: { id } });

      res.json({ success: true, message: 'Equipo eliminado' });
    } catch (error) {
      console.error('Error deleting equipment:', error);
      res.status(500).json({ success: false, error: 'Error al eliminar equipo' });
    }
  }

  async getMaintenanceSchedules(req: Request, res: Response): Promise<void> {
    try {
      const { installationId, equipmentId, securitySystemId, status } = req.query;

      const where: any = {};
      if (installationId) {
        where.securitySystem = { installationId: String(installationId) };
      }
      if (equipmentId) where.equipmentId = String(equipmentId);
      if (securitySystemId) where.securitySystemId = String(securitySystemId);
      if (status) where.status = String(status);

      const schedules = await prisma.maintenanceSchedule.findMany({
        where,
        include: {
          equipment: { select: { id: true, name: true, type: true } },
          securitySystem: { select: { id: true, name: true, type: true } },
          technician: { select: { id: true, name: true, lastName: true } },
        },
        orderBy: { scheduledDate: 'asc' },
      });

      res.json({ success: true, data: schedules });
    } catch (error) {
      console.error('Error fetching maintenance schedules:', error);
      res.status(500).json({ success: false, error: 'Error al obtener cronogramas' });
    }
  }

  async createMaintenanceSchedule(req: Request, res: Response): Promise<void> {
    try {
      const { title, description, type, frequency, scheduledDate, equipmentId, securitySystemId, cost, provider } = req.body;

      if (!title || !type || !frequency || !scheduledDate) {
        res.status(400).json({ success: false, error: 'Campos requeridos faltantes' });
        return;
      }

      const schedule = await prisma.maintenanceSchedule.create({
        data: {
          title,
          description,
          type,
          frequency,
          scheduledDate: new Date(scheduledDate),
          equipmentId,
          securitySystemId,
          cost,
          provider,
        },
        include: {
          equipment: { select: { id: true, name: true, type: true } },
          securitySystem: { select: { id: true, name: true, type: true } },
        },
      });

      res.status(201).json({ success: true, data: schedule });
    } catch (error) {
      console.error('Error creating maintenance schedule:', error);
      res.status(500).json({ success: false, error: 'Error al crear cronograma' });
    }
  }

  async updateMaintenanceSchedule(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { title, description, type, frequency, status, scheduledDate, completedDate, cost, provider, notes, technicianId } = req.body;

      const schedule = await prisma.maintenanceSchedule.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(description !== undefined && { description }),
          ...(type && { type }),
          ...(frequency && { frequency }),
          ...(status && { status }),
          ...(scheduledDate && { scheduledDate: new Date(scheduledDate) }),
          ...(completedDate !== undefined && { completedDate: completedDate ? new Date(completedDate) : null }),
          ...(cost !== undefined && { cost }),
          ...(provider !== undefined && { provider }),
          ...(notes !== undefined && { notes }),
          ...(technicianId !== undefined && { technicianId }),
        },
      });

      res.json({ success: true, data: schedule });
    } catch (error) {
      console.error('Error updating maintenance schedule:', error);
      res.status(500).json({ success: false, error: 'Error al actualizar cronograma' });
    }
  }

  async getInventoryStats(req: Request, res: Response): Promise<void> {
    try {
      const { installationId } = req.query;

      const systemWhere: any = installationId ? { installationId: String(installationId) } : {};
      const equipmentWhere: any = installationId ? { securitySystem: systemWhere } : {};

      const [
        totalSystems,
        activeSystems,
        totalEquipments,
        equipmentStats,
        upcomingMaintenances,
        allEquipments,
        allMaintenances,
      ] = await Promise.all([
        prisma.securitySystem.count({ where: systemWhere }),
        prisma.securitySystem.count({ where: { ...systemWhere, isActive: true } }),
        prisma.equipment.count({ where: equipmentWhere }),
        prisma.equipment.groupBy({
          by: ['status'],
          where: equipmentWhere,
          _count: true,
        }),
        prisma.maintenanceSchedule.count({
          where: {
            status: 'SCHEDULED',
            scheduledDate: { gte: new Date() },
            ...(installationId ? { securitySystem: { installationId: String(installationId) } } : {}),
          },
        }),
        prisma.equipment.findMany({
          where: equipmentWhere,
          select: { specifications: true },
        }),
        prisma.maintenanceSchedule.findMany({
          where: installationId ? { securitySystem: { installationId: String(installationId) } } : {},
          select: { cost: true, status: true },
        }),
      ]);

      const equipmentCosts = allEquipments.reduce((sum: number, eq: any) => {
        if (eq.specifications?.cost) return sum + Number(eq.specifications.cost);
        return sum;
      }, 0);

      const completedMaintenanceCost = allMaintenances
        .filter((m: any) => m.status === 'COMPLETED')
        .reduce((sum: number, m: any) => sum + (m.cost || 0), 0);

      const scheduledMaintenanceCost = allMaintenances
        .filter((m: any) => m.status === 'SCHEDULED')
        .reduce((sum: number, m: any) => sum + (m.cost || 0), 0);

      const totalInvestment = equipmentCosts + completedMaintenanceCost;

      res.json({
        success: true,
        data: {
          totalSystems,
          activeSystems,
          totalEquipments,
          equipmentByStatus: equipmentStats.reduce((acc: any, item: any) => {
            acc[item.status] = item._count;
            return acc;
          }, {}),
          upcomingMaintenances,
          investment: {
            totalEquipmentCost: equipmentCosts,
            totalMaintenanceCost: completedMaintenanceCost,
            scheduledMaintenanceCost,
            totalInvestment,
          },
          stats: {
            activeEquipments: equipmentStats.find((e: any) => e.status === 'ACTIVE')?._count || 0,
            inRepairEquipments: equipmentStats.find((e: any) => e.status === 'IN_REPAIR')?._count || 0,
            decommissionedEquipments: equipmentStats.find((e: any) => e.status === 'DECOMMISSIONED')?._count || 0,
          },
        },
      });
    } catch (error) {
      console.error('Error fetching inventory stats:', error);
      res.status(500).json({ success: false, error: 'Error al obtener estadísticas' });
    }
  }
}

export const electronicSecurityController = new ElectronicSecurityController();