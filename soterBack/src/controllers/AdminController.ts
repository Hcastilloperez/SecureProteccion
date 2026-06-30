import { Request, Response } from 'express';
import prisma from '../config/database';

export class AdminController {
  async getStatuses(req: Request, res: Response): Promise<void> {
    try {
      const { type } = req.query;

      const where: any = {};
      if (type) where.type = String(type);

      const statuses = await prisma.status.findMany({
        where,
        orderBy: [{ isActive: 'desc' }, { order: 'asc' }],
      });

      res.json({ success: true, data: statuses });
    } catch (error) {
      console.error('Error fetching statuses:', error);
      res.status(500).json({ success: false, error: 'Error al obtener estados' });
    }
  }

  async createStatus(req: Request, res: Response): Promise<void> {
    try {
      const { code, name, type, description, order } = req.body;

      if (!code || !name || !type) {
        res.status(400).json({ success: false, error: 'Code, name y type son requeridos' });
        return;
      }

      const existingStatus = await prisma.status.findUnique({ where: { code } });

      if (existingStatus) {
        res.status(400).json({ success: false, error: 'Código ya existe' });
        return;
      }

      const status = await prisma.status.create({
        data: { code, name, type, description, order: order || 0 },
      });

      res.status(201).json({ success: true, data: status });
    } catch (error) {
      console.error('Error creating status:', error);
      res.status(500).json({ success: false, error: 'Error al crear estado' });
    }
  }

  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { code, name, description, isActive, order } = req.body;

      const status = await prisma.status.update({
        where: { id },
        data: {
          ...(code && { code }),
          ...(name && { name }),
          ...(description !== undefined && { description }),
          ...(isActive !== undefined && { isActive }),
          ...(order !== undefined && { order }),
        },
      });

      res.json({ success: true, data: status });
    } catch (error) {
      console.error('Error updating status:', error);
      res.status(500).json({ success: false, error: 'Error al actualizar estado' });
    }
  }

  async deleteStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await prisma.status.update({
        where: { id },
        data: { isActive: false },
      });

      res.json({ success: true, message: 'Estado desactivado' });
    } catch (error) {
      console.error('Error deleting status:', error);
      res.status(500).json({ success: false, error: 'Error al eliminar estado' });
    }
  }

  async getIncidentTypes(req: Request, res: Response): Promise<void> {
    try {
      const types = await prisma.incidentType.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
      });

      res.json({ success: true, data: types });
    } catch (error) {
      console.error('Error fetching incident types:', error);
      res.status(500).json({ success: false, error: 'Error al obtener tipos de incidente' });
    }
  }

  async createIncidentType(req: Request, res: Response): Promise<void> {
    try {
      const { code, name, description, category, coordinatorType, slaHours } = req.body;

      if (!code || !name || !category) {
        res.status(400).json({ success: false, error: 'Code, name y category son requeridos' });
        return;
      }

      const existingType = await prisma.incidentType.findUnique({ where: { code } });

      if (existingType) {
        res.status(400).json({ success: false, error: 'Código ya existe' });
        return;
      }

      const incidentType = await prisma.incidentType.create({
        data: { code, name, description, category, coordinatorType, slaHours },
      });

      res.status(201).json({ success: true, data: incidentType });
    } catch (error) {
      console.error('Error creating incident type:', error);
      res.status(500).json({ success: false, error: 'Error al crear tipo de incidente' });
    }
  }

  async updateIncidentType(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { code, name, description, category, coordinatorType, slaHours, isActive } = req.body;

      const incidentType = await prisma.incidentType.update({
        where: { id },
        data: {
          ...(code && { code }),
          ...(name && { name }),
          ...(description !== undefined && { description }),
          ...(category && { category }),
          ...(coordinatorType !== undefined && { coordinatorType }),
          ...(slaHours !== undefined && { slaHours }),
          ...(isActive !== undefined && { isActive }),
        },
      });

      res.json({ success: true, data: incidentType });
    } catch (error) {
      console.error('Error updating incident type:', error);
      res.status(500).json({ success: false, error: 'Error al actualizar tipo de incidente' });
    }
  }

  async deleteIncidentType(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await prisma.incidentType.update({
        where: { id },
        data: { isActive: false },
      });

      res.json({ success: true, message: 'Tipo de incidente desactivado' });
    } catch (error) {
      console.error('Error deleting incident type:', error);
      res.status(500).json({ success: false, error: 'Error al eliminar tipo de incidente' });
    }
  }

  async getConfigurations(req: Request, res: Response): Promise<void> {
    try {
      const { category, isPublic } = req.query;

      const where: any = {};
      if (category) where.category = String(category);
      if (isPublic !== undefined) where.isPublic = isPublic === 'true';

      const configurations = await prisma.configuration.findMany({
        where,
        orderBy: { category: 'asc' },
      });

      res.json({ success: true, data: configurations });
    } catch (error) {
      console.error('Error fetching configurations:', error);
      res.status(500).json({ success: false, error: 'Error al obtener configuraciones' });
    }
  }

  async createConfiguration(req: Request, res: Response): Promise<void> {
    try {
      const { key, value, type, description, isPublic, category } = req.body;

      if (!key || !value || !type) {
        res.status(400).json({ success: false, error: 'Key, value y type son requeridos' });
        return;
      }

      const existingConfig = await prisma.configuration.findUnique({ where: { key } });

      if (existingConfig) {
        res.status(400).json({ success: false, error: 'Key ya existe' });
        return;
      }

      const configuration = await prisma.configuration.create({
        data: { key, value, type, description, isPublic: isPublic || false, category: category || 'general' },
      });

      res.status(201).json({ success: true, data: configuration });
    } catch (error) {
      console.error('Error creating configuration:', error);
      res.status(500).json({ success: false, error: 'Error al crear configuración' });
    }
  }

  async updateConfiguration(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { value, description, isPublic } = req.body;

      const configuration = await prisma.configuration.update({
        where: { id },
        data: {
          ...(value && { value }),
          ...(description !== undefined && { description }),
          ...(isPublic !== undefined && { isPublic }),
        },
      });

      res.json({ success: true, data: configuration });
    } catch (error) {
      console.error('Error updating configuration:', error);
      res.status(500).json({ success: false, error: 'Error al actualizar configuración' });
    }
  }

  async deleteConfiguration(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await prisma.configuration.delete({ where: { id } });

      res.json({ success: true, message: 'Configuración eliminada' });
    } catch (error) {
      console.error('Error deleting configuration:', error);
      res.status(500).json({ success: false, error: 'Error al eliminar configuración' });
    }
  }

  async getRoles(req: Request, res: Response): Promise<void> {
    try {
      const roles = await prisma.role.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
      });

      res.json({ success: true, data: roles });
    } catch (error) {
      console.error('Error fetching roles:', error);
      res.status(500).json({ success: false, error: 'Error al obtener roles' });
    }
  }

  async createRole(req: Request, res: Response): Promise<void> {
    try {
      const { name, description, permissions } = req.body;

      if (!name) {
        res.status(400).json({ success: false, error: 'Nombre requerido' });
        return;
      }

      const existingRole = await prisma.role.findUnique({ where: { name } });
      if (existingRole) {
        res.status(400).json({ success: false, error: 'Ya existe un rol con este nombre' });
        return;
      }

      const role = await prisma.role.create({
        data: { name, description, permissions: permissions || {} },
      });

      res.status(201).json({ success: true, data: role });
    } catch (error) {
      console.error('Error creating role:', error);
      res.status(500).json({ success: false, error: 'Error al crear rol' });
    }
  }

  async updateRole(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, description, permissions, isActive } = req.body;

      if (name) {
        const existingRole = await prisma.role.findFirst({
          where: { name, id: { not: id } },
        });
        if (existingRole) {
          res.status(400).json({ success: false, error: 'Ya existe un rol con este nombre' });
          return;
        }
      }

      const role = await prisma.role.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(description !== undefined && { description }),
          ...(permissions !== undefined && { permissions }),
          ...(isActive !== undefined && { isActive }),
        },
      });

      res.json({ success: true, data: role });
    } catch (error) {
      console.error('Error updating role:', error);
      res.status(500).json({ success: false, error: 'Error al actualizar rol' });
    }
  }

  async deleteRole(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await prisma.role.update({
        where: { id },
        data: { isActive: false },
      });
      res.json({ success: true, message: 'Rol eliminado' });
    } catch (error) {
      console.error('Error deleting role:', error);
      res.status(500).json({ success: false, error: 'Error al eliminar rol' });
    }
  }

  async getEquipmentTypes(req: Request, res: Response): Promise<void> {
    try {
      const equipmentTypes = await prisma.equipmentType.findMany({
        orderBy: { name: 'asc' },
      });
      res.json(equipmentTypes);
    } catch (error) {
      console.error('Error getting equipment types:', error);
      res.status(500).json({ success: false, error: 'Error al obtener tipos de equipo' });
    }
  }

  async createEquipmentType(req: Request, res: Response): Promise<void> {
    try {
      const { code, name, description, category, systemType } = req.body;
      const existing = await prisma.equipmentType.findUnique({ where: { code } });
      if (existing) {
        res.status(400).json({ success: false, error: 'Ya existe un tipo de equipo con este código' });
        return;
      }
      const equipmentType = await prisma.equipmentType.create({
        data: { code, name, description, category, systemType },
      });
      res.status(201).json(equipmentType);
    } catch (error) {
      console.error('Error creating equipment type:', error);
      res.status(500).json({ success: false, error: 'Error al crear tipo de equipo' });
    }
  }

  async updateEquipmentType(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, description, category, isActive } = req.body;
      const equipmentType = await prisma.equipmentType.update({
        where: { id },
        data: { name, description, category, isActive },
      });
      res.json(equipmentType);
    } catch (error) {
      console.error('Error updating equipment type:', error);
      res.status(500).json({ success: false, error: 'Error al actualizar tipo de equipo' });
    }
  }

  async deleteEquipmentType(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await prisma.equipmentType.update({
        where: { id },
        data: { isActive: false },
      });
      res.json({ success: true, message: 'Tipo de equipo eliminado' });
    } catch (error) {
      console.error('Error deleting equipment type:', error);
      res.status(500).json({ success: false, error: 'Error al eliminar tipo de equipo' });
    }
  }

  async getDashboardStats(req: Request, res: Response): Promise<void> {
    try {
      const userRole = (req as any).user?.role;
      const userInstallationId = (req as any).user?.installationId;

      const installationFilter = userRole === 'GERENTE_SEGURIDAD' || userRole === 'ADMIN'
        ? {}
        : userInstallationId
          ? { installationId: userInstallationId }
          : {};

      const [
        totalIncidents,
        openIncidents,
        installationsCount,
        securityGuardsCount,
        escortsCount,
        activeSystems,
        recentIncidents,
      ] = await Promise.all([
        prisma.incident.count({ where: installationFilter }),
        prisma.incident.count({
          where: {
            ...installationFilter,
            status: { code: { not: 'CLOSED' } },
          },
        }),
        prisma.installation.count(),
        prisma.securityGuard.count({ where: { ...installationFilter, isActive: true } }),
        prisma.escort.count({ where: { isActive: true } }),
        prisma.securitySystem.count({ where: { ...installationFilter, isActive: true } }),
        prisma.incident.findMany({
          where: installationFilter,
          include: {
            incidentType: true,
            installation: true,
            status: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
      ]);

      const incidentsByStatus = await prisma.incident.groupBy({
        by: ['priority'],
        where: installationFilter,
        _count: true,
      });

      res.json({
        success: true,
        data: {
          totalIncidents,
          openIncidents,
          installationsCount,
          securityGuardsCount,
          escortsCount,
          activeSystems,
          incidentsByPriority: incidentsByStatus.reduce((acc: any, item) => {
            acc[item.priority] = item._count;
            return acc;
          }, {}),
          recentIncidents,
        },
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ success: false, error: 'Error al obtener estadísticas del dashboard' });
    }
  }

  async getMaintenanceStats(req: Request, res: Response): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      const [
        totalCount,
        scheduledCount,
        inProgressCount,
        completedCount,
        recent,
      ] = await Promise.all([
        prisma.maintenanceSchedule.count(),
        prisma.maintenanceSchedule.count({ where: { status: 'SCHEDULED' } }),
        prisma.maintenanceSchedule.count({ where: { status: 'IN_PROGRESS' } }),
        prisma.maintenanceSchedule.count({
          where: {
            status: 'COMPLETED',
            completedDate: { gte: startOfMonth },
          },
        }),
        prisma.maintenanceSchedule.findMany({
          take: 5,
          orderBy: { scheduledDate: 'desc' },
          include: {
            equipment: { select: { id: true, name: true } },
            securitySystem: { select: { id: true, name: true } },
          },
        }),
      ]);

      res.json({
        success: true,
        data: {
          totalCount,
          scheduledCount,
          inProgressCount,
          completedCount,
          recent,
        },
      });
    } catch (error) {
      console.error('Error fetching maintenance stats:', error);
      res.status(500).json({ success: false, error: 'Error al obtener estadísticas de mantenimiento' });
    }
  }

  async getPermissionDefinitions(req: Request, res: Response): Promise<void> {
    try {
      const permissions = await prisma.permissionDefinition.findMany({
        where: { isActive: true },
        orderBy: { key: 'asc' },
      });
      res.json({ success: true, data: permissions });
    } catch (error) {
      console.error('Error fetching permission definitions:', error);
      res.status(500).json({ success: false, error: 'Error al obtener definiciones de permisos' });
    }
  }

  async createPermissionDefinition(req: Request, res: Response): Promise<void> {
    try {
      const { key, label, description } = req.body;

      if (!key || !label) {
        res.status(400).json({ success: false, error: 'key y label son requeridos' });
        return;
      }

      const existing = await prisma.permissionDefinition.findUnique({ where: { key } });
      if (existing) {
        res.status(400).json({ success: false, error: 'La clave ya existe' });
        return;
      }

      const permission = await prisma.permissionDefinition.create({
        data: { key, label, description },
      });

      res.status(201).json({ success: true, data: permission });
    } catch (error) {
      console.error('Error creating permission definition:', error);
      res.status(500).json({ success: false, error: 'Error al crear definición de permiso' });
    }
  }

  async deletePermissionDefinition(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await prisma.permissionDefinition.update({
        where: { id },
        data: { isActive: false },
      });
      res.json({ success: true, message: 'Permiso eliminado' });
    } catch (error) {
      console.error('Error deleting permission definition:', error);
      res.status(500).json({ success: false, error: 'Error al eliminar definición de permiso' });
    }
  }
}

export const adminController = new AdminController();