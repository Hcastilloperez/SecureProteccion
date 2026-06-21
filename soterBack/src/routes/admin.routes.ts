import { Router } from 'express';
import { adminController } from '../controllers/AdminController';
import { verifyToken, requireRole } from '../middleware/verify';

const router = Router();

router.use(verifyToken);

router.get('/statuses', (req, res) => adminController.getStatuses(req, res));
router.post('/statuses', requireRole('ADMIN'), (req, res) => adminController.createStatus(req, res));
router.put('/statuses/:id', requireRole('ADMIN'), (req, res) => adminController.updateStatus(req, res));
router.delete('/statuses/:id', requireRole('ADMIN'), (req, res) => adminController.deleteStatus(req, res));

router.get('/incident-types', (req, res) => adminController.getIncidentTypes(req, res));
router.post('/incident-types', requireRole('ADMIN'), (req, res) => adminController.createIncidentType(req, res));
router.put('/incident-types/:id', requireRole('ADMIN'), (req, res) => adminController.updateIncidentType(req, res));
router.delete('/incident-types/:id', requireRole('ADMIN'), (req, res) => adminController.deleteIncidentType(req, res));

router.get('/configurations', (req, res) => adminController.getConfigurations(req, res));
router.post('/configurations', requireRole('ADMIN'), (req, res) => adminController.createConfiguration(req, res));
router.put('/configurations/:id', requireRole('ADMIN'), (req, res) => adminController.updateConfiguration(req, res));
router.delete('/configurations/:id', requireRole('ADMIN'), (req, res) => adminController.deleteConfiguration(req, res));

router.get('/roles', (req, res) => adminController.getRoles(req, res));
router.post('/roles', requireRole('ADMIN'), (req, res) => adminController.createRole(req, res));
router.put('/roles/:id', requireRole('ADMIN'), (req, res) => adminController.updateRole(req, res));
router.delete('/roles/:id', requireRole('ADMIN'), (req, res) => adminController.deleteRole(req, res));

router.get('/equipment-types', (req, res) => adminController.getEquipmentTypes(req, res));
router.post('/equipment-types', requireRole('ADMIN'), (req, res) => adminController.createEquipmentType(req, res));
router.put('/equipment-types/:id', requireRole('ADMIN'), (req, res) => adminController.updateEquipmentType(req, res));
router.delete('/equipment-types/:id', requireRole('ADMIN'), (req, res) => adminController.deleteEquipmentType(req, res));

router.get('/dashboard/stats', (req, res) => adminController.getDashboardStats(req, res));
router.get('/maintenance/stats', (req, res) => adminController.getMaintenanceStats(req, res));

export default router;