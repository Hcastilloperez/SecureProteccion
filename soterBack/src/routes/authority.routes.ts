import { Router } from 'express';
import { authorityController } from '../controllers/AuthorityController';
import { verifyToken, requireRole } from '../middleware/verify';

const router = Router();

router.use(verifyToken);

router.get('/', (req, res) => authorityController.getAll(req, res));
router.get('/:id', (req, res) => authorityController.getById(req, res));
router.post('/', requireRole('ADMIN', 'GERENTE_SEGURIDAD', 'COORDINADOR_FISICA'), (req, res) => authorityController.create(req, res));
router.put('/:id', requireRole('ADMIN', 'GERENTE_SEGURIDAD', 'COORDINADOR_FISICA'), (req, res) => authorityController.update(req, res));
router.delete('/:id', requireRole('ADMIN', 'GERENTE_SEGURIDAD'), (req, res) => authorityController.delete(req, res));

export default router;