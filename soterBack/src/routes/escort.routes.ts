import { Router } from 'express';
import { escortController } from '../controllers/EscortController';
import { verifyToken, requireRole } from '../middleware/verify';

const router = Router();

router.use(verifyToken);

router.get('/escorts', (req, res) => escortController.getAll(req, res));
router.post('/escorts', requireRole('ADMIN', 'GERENTE_SEGURIDAD'), (req, res) => escortController.create(req, res));
router.put('/escorts/:id', requireRole('ADMIN', 'GERENTE_SEGURIDAD'), (req, res) => escortController.update(req, res));
router.delete('/escorts/:id', requireRole('ADMIN', 'GERENTE_SEGURIDAD'), (req, res) => escortController.delete(req, res));

router.get('/routes', (req, res) => escortController.getRoutes(req, res));
router.post('/routes', requireRole('ADMIN', 'GERENTE_SEGURIDAD', 'ESCOLTA'), (req, res) => escortController.createRoute(req, res));
router.put('/routes/:id', requireRole('ADMIN', 'GERENTE_SEGURIDAD', 'ESCOLTA'), (req, res) => escortController.updateRoute(req, res));

router.get('/movements', (req, res) => escortController.getMovements(req, res));
router.post('/movements', requireRole('ADMIN', 'GERENTE_SEGURIDAD', 'ESCOLTA'), (req, res) => escortController.createMovement(req, res));
router.put('/movements/:id', requireRole('ADMIN', 'GERENTE_SEGURIDAD', 'ESCOLTA'), (req, res) => escortController.updateMovement(req, res));
router.get('/movements/today', (req, res) => escortController.getTodayMovements(req, res));

router.get('/assignments', (req, res) => escortController.getAssignments(req, res));
router.post('/assignments', requireRole('ADMIN', 'GERENTE_SEGURIDAD'), (req, res) => escortController.createAssignment(req, res));
router.put('/assignments/:id', requireRole('ADMIN', 'GERENTE_SEGURIDAD'), (req, res) => escortController.updateAssignment(req, res));

export default router;