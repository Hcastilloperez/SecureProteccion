import { Request, Response } from 'express';
import prisma from '../config/database';

export class InstallationController {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
      const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '20'), 10)));
      const skip = (page - 1) * limit;

      const where: any = {};

      if (req.query.status) {
        where.status = req.query.status;
      }

      if (req.query.search) {
        where.OR = [
          { name: { contains: String(req.query.search), mode: 'insensitive' } },
          { address: { contains: String(req.query.search), mode: 'insensitive' } },
          { city: { contains: String(req.query.search), mode: 'insensitive' } },
        ];
      }

      const [data, total] = await Promise.all([
        prisma.installation.findMany({
          where,
          skip,
          take: limit,
          orderBy: { name: 'asc' },
          include: {
            _count: {
              select: {
                incidents: true,
                contacts: true,
                authorities: true,
                securitySystems: true,
              },
            },
          },
        }),
        prisma.installation.count({ where }),
      ]);

      res.json({
        success: true,
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('Error fetching installations:', error);
      res.status(500).json({ success: false, error: 'Error al obtener instalaciones' });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const installation = await prisma.installation.findUnique({
        where: { id },
        include: {
          contacts: true,
          authorities: true,
          securitySystems: {
            include: {
              equipments: true,
              maintenanceSchedules: {
                where: { status: 'SCHEDULED' },
                take: 5,
                orderBy: { scheduledDate: 'asc' },
              },
            },
          },
          securityGuards: true,
          incidents: {
            where: {
              status: {
                isNot: {
                  code: 'CLOSED',
                },
              },
            },
            include: {
              incidentType: true,
              status: true,
            },
            take: 10,
            orderBy: { createdAt: 'desc' },
          },
          _count: {
            select: {
              incidents: true,
              contacts: true,
              authorities: true,
              securitySystems: true,
            },
          },
        },
      });

      if (!installation) {
        res.status(404).json({ success: false, error: 'Instalación no encontrada' });
        return;
      }

      res.json({ success: true, data: installation });
    } catch (error) {
      console.error('Error fetching installation:', error);
      res.status(500).json({ success: false, error: 'Error al obtener instalación' });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { name, address, city, department, latitude, longitude, description } = req.body;

      if (!name || !address || !city || !department) {
        res.status(400).json({ success: false, error: 'Campos requeridos faltantes' });
        return;
      }

      const installation = await prisma.installation.create({
        data: {
          name,
          address,
          city,
          department,
          latitude,
          longitude,
          description,
        },
      });

      res.status(201).json({ success: true, data: installation });
    } catch (error) {
      console.error('Error creating installation:', error);
      res.status(500).json({ success: false, error: 'Error al crear instalación' });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, address, city, department, latitude, longitude, description, status } =
        req.body;

      const installation = await prisma.installation.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(address && { address }),
          ...(city && { city }),
          ...(department && { department }),
          ...(latitude !== undefined && { latitude }),
          ...(longitude !== undefined && { longitude }),
          ...(description && { description }),
          ...(status && { status }),
        },
      });

      res.json({ success: true, data: installation });
    } catch (error) {
      console.error('Error updating installation:', error);
      res.status(500).json({ success: false, error: 'Error al actualizar instalación' });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await prisma.installation.delete({ where: { id } });

      res.json({ success: true, message: 'Instalación eliminada' });
    } catch (error) {
      console.error('Error deleting installation:', error);
      res.status(500).json({ success: false, error: 'Error al eliminar instalación' });
    }
  }

  async getSecuritySystems(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const systems = await prisma.securitySystem.findMany({
        where: { installationId: id },
        include: {
          _count: {
            select: { equipments: true, maintenanceSchedules: true },
          },
        },
        orderBy: { name: 'asc' },
      });

      res.json({ success: true, data: systems });
    } catch (error) {
      console.error('Error fetching security systems:', error);
      res.status(500).json({ success: false, error: 'Error al obtener sistemas' });
    }
  }
}

export const installationController = new InstallationController();