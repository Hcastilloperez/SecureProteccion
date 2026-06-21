import { Request, Response } from 'express';
import prisma from '../config/database';

export class SecurityGuardController {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { installationId } = req.params;

      const guards = await prisma.securityGuard.findMany({
        where: { installationId },
        include: {
          user: {
            select: { id: true, name: true, lastName: true, email: true },
          },
        },
        orderBy: { name: 'asc' },
      });

      res.json({ success: true, data: guards });
    } catch (error) {
      console.error('Error fetching security guards:', error);
      res.status(500).json({ success: false, error: 'Error al obtener vigilantes' });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { installationId, id } = req.params;

      const guard = await prisma.securityGuard.findFirst({
        where: { id, installationId },
        include: {
          user: {
            select: { id: true, name: true, lastName: true, email: true },
          },
        },
      });

      if (!guard) {
        res.status(404).json({ success: false, error: 'Vigilante no encontrado' });
        return;
      }

      res.json({ success: true, data: guard });
    } catch (error) {
      console.error('Error fetching security guard:', error);
      res.status(500).json({ success: false, error: 'Error al obtener vigilante' });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { installationId } = req.params;
      const { userId, documentType, documentNumber, name, lastName, phone, email, position, company, schedule, isActive, observations } = req.body;

      if (!documentType || !documentNumber || !name || !lastName || !phone || !position || !company) {
        res.status(400).json({ success: false, error: 'Campos requeridos faltantes' });
        return;
      }

      const existingGuard = await prisma.securityGuard.findUnique({
        where: { documentNumber },
      });

      if (existingGuard) {
        res.status(400).json({ success: false, error: 'Ya existe un vigilante con este número de documento' });
        return;
      }

      const guard = await prisma.securityGuard.create({
        data: {
          installationId,
          userId,
          documentType,
          documentNumber,
          name,
          lastName,
          phone,
          email,
          position,
          company,
          schedule,
          isActive: isActive ?? true,
          observations,
        },
      });

      res.status(201).json({ success: true, data: guard });
    } catch (error) {
      console.error('Error creating security guard:', error);
      res.status(500).json({ success: false, error: 'Error al crear vigilante' });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { installationId, id } = req.params;
      const { userId, documentType, documentNumber, name, lastName, phone, email, position, company, schedule, isActive, observations } = req.body;

      const guard = await prisma.securityGuard.findFirst({
        where: { id, installationId },
      });

      if (!guard) {
        res.status(404).json({ success: false, error: 'Vigilante no encontrado' });
        return;
      }

      if (documentNumber && documentNumber !== guard.documentNumber) {
        const existingGuard = await prisma.securityGuard.findUnique({
          where: { documentNumber },
        });
        if (existingGuard) {
          res.status(400).json({ success: false, error: 'Ya existe un vigilante con este número de documento' });
          return;
        }
      }

      const updated = await prisma.securityGuard.update({
        where: { id },
        data: {
          ...(userId !== undefined && { userId }),
          ...(documentType && { documentType }),
          ...(documentNumber && { documentNumber }),
          ...(name && { name }),
          ...(lastName && { lastName }),
          ...(phone && { phone }),
          ...(email !== undefined && { email }),
          ...(position && { position }),
          ...(company && { company }),
          ...(schedule !== undefined && { schedule }),
          ...(isActive !== undefined && { isActive }),
          ...(observations !== undefined && { observations }),
        },
      });

      res.json({ success: true, data: updated });
    } catch (error) {
      console.error('Error updating security guard:', error);
      res.status(500).json({ success: false, error: 'Error al actualizar vigilante' });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { installationId, id } = req.params;

      const guard = await prisma.securityGuard.findFirst({
        where: { id, installationId },
      });

      if (!guard) {
        res.status(404).json({ success: false, error: 'Vigilante no encontrado' });
        return;
      }

      await prisma.securityGuard.delete({ where: { id } });

      res.json({ success: true, message: 'Vigilante eliminado' });
    } catch (error) {
      console.error('Error deleting security guard:', error);
      res.status(500).json({ success: false, error: 'Error al eliminar vigilante' });
    }
  }
}

export const securityGuardController = new SecurityGuardController();