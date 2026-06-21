import { Router } from 'express';
import { contactController } from '../controllers/ContactController';
import { verifyToken, requireRole } from '../middleware/verify';

const router = Router();

router.use(verifyToken);

router.get('/', (req, res) => contactController.getAll(req, res));
router.get('/:id', (req, res) => contactController.getById(req, res));
router.post('/', requireRole('ADMIN', 'GERENTE_SEGURIDAD', 'COORDINADOR_FISICA'), (req, res) => contactController.create(req, res));
router.put('/:id', requireRole('ADMIN', 'GERENTE_SEGURIDAD', 'COORDINADOR_FISICA'), (req, res) => contactController.update(req, res));
router.delete('/:id', requireRole('ADMIN', 'GERENTE_SEGURIDAD'), (req, res) => contactController.delete(req, res));

export default router;