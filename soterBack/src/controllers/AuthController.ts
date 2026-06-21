import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { config } from '../config';
import { AuthenticatedRequest } from '../middleware/verify';

export class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ success: false, error: 'Email y contraseña son requeridos' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { email },
        include: { installation: true },
      });

      if (!user) {
        res.status(401).json({ success: false, error: 'Credenciales inválidas' });
        return;
      }

      if (user.status !== 'ACTIVE') {
        res.status(401).json({ success: false, error: 'Usuario inactivo' });
        return;
      }

      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        res.status(401).json({ success: false, error: 'Credenciales inválidas' });
        return;
      }

      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      res.json({
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            lastName: user.lastName,
            role: user.role,
            installation: user.installation,
          },
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, error: 'Error en el servidor' });
    }
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name, lastName, phone, role, installationId } = req.body;

      if (!email || !password || !name || !lastName || !role) {
        res.status(400).json({ success: false, error: 'Todos los campos son requeridos' });
        return;
      }

      const existingUser = await prisma.user.findUnique({ where: { email } });

      if (existingUser) {
        res.status(400).json({ success: false, error: 'El email ya está registrado' });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          lastName,
          phone,
          role,
          installationId,
        },
        include: { installation: true },
      });

      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      res.status(201).json({
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            lastName: user.lastName,
            role: user.role,
            installation: user.installation,
          },
        },
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ success: false, error: 'Error en el servidor' });
    }
  }

  async profile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { installation: true },
        select: {
          id: true,
          email: true,
          name: true,
          lastName: true,
          phone: true,
          role: true,
          status: true,
          installation: true,
          createdAt: true,
        },
      });

      if (!user) {
        res.status(404).json({ success: false, error: 'Usuario no encontrado' });
        return;
      }

      res.json({ success: true, data: user });
    } catch (error) {
      console.error('Profile error:', error);
      res.status(500).json({ success: false, error: 'Error en el servidor' });
    }
  }

  async changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        res.status(400).json({ success: false, error: 'Contraseñas requeridas' });
        return;
      }

      const user = await prisma.user.findUnique({ where: { id: userId } });

      if (!user) {
        res.status(404).json({ success: false, error: 'Usuario no encontrado' });
        return;
      }

      const isValidPassword = await bcrypt.compare(currentPassword, user.password);

      if (!isValidPassword) {
        res.status(401).json({ success: false, error: 'Contraseña actual incorrecta' });
        return;
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);

      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      res.json({ success: true, message: 'Contraseña actualizada' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ success: false, error: 'Error en el servidor' });
    }
  }
}

export const authController = new AuthController();