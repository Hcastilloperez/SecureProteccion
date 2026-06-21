import { Router } from 'express';
import { electronicSecurityController } from '../controllers/ElectronicSecurityController';
import { verifyToken, requireRole } from '../middleware/verify';

const router = Router();

router.use(verifyToken);

router.get('/systems', (req, res) => electronicSecurityController.getSystems(req, res));
router.post('/systems', requireRole('ADMIN', 'COORDINADOR_ELECTRONICA', 'GERENTE_SEGURIDAD'), (req, res) => electronicSecurityController.createSystem(req, res));
router.put('/systems/:id', requireRole('ADMIN', 'COORDINADOR_ELECTRONICA', 'GERENTE_SEGURIDAD'), (req, res) => electronicSecurityController.updateSystem(req, res));
router.delete('/systems/:id', requireRole('ADMIN', 'GERENTE_SEGURIDAD'), (req, res) => electronicSecurityController.deleteSystem(req, res));

router.get('/equipments', (req, res) => electronicSecurityController.getEquipments(req, res));
router.post('/equipments', requireRole('ADMIN', 'COORDINADOR_ELECTRONICA', 'GERENTE_SEGURIDAD'), (req, res) => electronicSecurityController.createEquipment(req, res));
router.post('/equipments/assign', requireRole('ADMIN', 'COORDINADOR_ELECTRONICA', 'GERENTE_SEGURIDAD'), (req, res) => electronicSecurityController.assignEquipment(req, res));
router.put('/equipments/:id', requireRole('ADMIN', 'COORDINADOR_ELECTRONICA', 'GERENTE_SEGURIDAD'), (req, res) => electronicSecurityController.updateEquipment(req, res));
router.delete('/equipments/:id', requireRole('ADMIN', 'GERENTE_SEGURIDAD'), (req, res) => electronicSecurityController.deleteEquipment(req, res));

router.get('/maintenance', (req, res) => electronicSecurityController.getMaintenanceSchedules(req, res));
router.post('/maintenance', requireRole('ADMIN', 'COORDINADOR_ELECTRONICA', 'GERENTE_SEGURIDAD'), (req, res) => electronicSecurityController.createMaintenanceSchedule(req, res));
router.put('/maintenance/:id', requireRole('ADMIN', 'COORDINADOR_ELECTRONICA', 'GERENTE_SEGURIDAD'), (req, res) => electronicSecurityController.updateMaintenanceSchedule(req, res));

router.get('/stats', (req, res) => electronicSecurityController.getInventoryStats(req, res));

export default router;