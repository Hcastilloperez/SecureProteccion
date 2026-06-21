import { Router } from 'express';
import { securityGuardController } from '../controllers/SecurityGuardController';
import { verifyToken, requireRole } from '../middleware/verify';

const router = Router();

router.use(verifyToken);

router.get('/', (req, res) => securityGuardController.getAll(req, res));
router.get('/:id', (req, res) => securityGuardController.getById(req, res));
router.post('/', requireRole('ADMIN', 'GERENTE_SEGURIDAD', 'COORDINADOR_FISICA'), (req, res) => securityGuardController.create(req, res));
router.put('/:id', requireRole('ADMIN', 'GERENTE_SEGURIDAD', 'COORDINADOR_FISICA'), (req, res) => securityGuardController.update(req, res));
router.delete('/:id', requireRole('ADMIN', 'GERENTE_SEGURIDAD'), (req, res) => securityGuardController.delete(req, res));

export default router;