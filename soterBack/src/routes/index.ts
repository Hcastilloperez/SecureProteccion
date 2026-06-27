import { Router } from 'express';
import authRoutes from './auth.routes';
import incidentRoutes from './incident.routes';
import installationRoutes from './installation.routes';
import userRoutes from './user.routes';
import electronicSecurityRoutes from './electronicSecurity.routes';
import escortRoutes from './escort.routes';
import physicalSecurityRoutes from './physicalSecurity.routes';
import aiRoutes from './ai.routes';
import adminRoutes from './admin.routes';
import uploadRoutes from './upload.routes';
import inventoryRoutes from './inventory.routes';
import { apiRateLimiter } from '../middleware/rateLimit';

const router = Router();

router.use('/auth', authRoutes);
router.use('/', uploadRoutes);
router.use('/incidents', apiRateLimiter, incidentRoutes);
router.use('/installations', apiRateLimiter, installationRoutes);
router.use('/users', apiRateLimiter, userRoutes);
router.use('/electronic-security', apiRateLimiter, electronicSecurityRoutes);
router.use('/escorts', apiRateLimiter, escortRoutes);
router.use('/physical-security', apiRateLimiter, physicalSecurityRoutes);
router.use('/ai', aiRoutes);
router.use('/admin', apiRateLimiter, adminRoutes);
router.use('/inventory', apiRateLimiter, inventoryRoutes);

export default router;