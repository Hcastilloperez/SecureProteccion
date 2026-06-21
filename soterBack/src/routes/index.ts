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

const router = Router();

router.use('/auth', authRoutes);
router.use('/', uploadRoutes);
router.use('/incidents', incidentRoutes);
router.use('/installations', installationRoutes);
router.use('/users', userRoutes);
router.use('/electronic-security', electronicSecurityRoutes);
router.use('/escorts', escortRoutes);
router.use('/physical-security', physicalSecurityRoutes);
router.use('/ai', aiRoutes);
router.use('/admin', adminRoutes);
router.use('/inventory', inventoryRoutes);

export default router;