import { Router } from 'express';
import { inventoryController } from '../controllers/InventoryController';
import { verifyToken, requireRole } from '../middleware/verify';

const router = Router();

router.use(verifyToken);

router.get('/contracts', (req, res) => inventoryController.getContracts(req, res));
router.post('/contracts', requireRole('ADMIN', 'GERENTE_SEGURIDAD', 'COORDINADOR_ELECTRONICA'), (req, res) => inventoryController.createContract(req, res));
router.put('/contracts/:id', requireRole('ADMIN', 'GERENTE_SEGURIDAD', 'COORDINADOR_ELECTRONICA'), (req, res) => inventoryController.updateContract(req, res));
router.delete('/contracts/:id', requireRole('ADMIN', 'GERENTE_SEGURIDAD'), (req, res) => inventoryController.deleteContract(req, res));

router.get('/equipments', (req, res) => inventoryController.getEquipments(req, res));
router.post('/equipments', requireRole('ADMIN', 'GERENTE_SEGURIDAD', 'COORDINADOR_ELECTRONICA'), (req, res) => inventoryController.createEquipment(req, res));
router.put('/equipments/:id', requireRole('ADMIN', 'GERENTE_SEGURIDAD', 'COORDINADOR_ELECTRONICA'), (req, res) => inventoryController.updateEquipment(req, res));
router.delete('/equipments/:id', requireRole('ADMIN', 'GERENTE_SEGURIDAD'), (req, res) => inventoryController.deleteEquipment(req, res));

router.get('/movements', (req, res) => inventoryController.getMovements(req, res));
router.post('/movements', requireRole('ADMIN', 'GERENTE_SEGURIDAD', 'COORDINADOR_ELECTRONICA'), (req, res) => inventoryController.createMovement(req, res));
router.delete('/movements/:id', requireRole('ADMIN', 'GERENTE_SEGURIDAD'), (req, res) => inventoryController.deleteMovement(req, res));
router.get('/stats', (req, res) => inventoryController.getStats(req, res));

export default router;
