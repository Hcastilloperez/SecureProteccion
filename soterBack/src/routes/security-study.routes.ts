import { Router } from 'express';
import { securityStudyController } from '../controllers/SecurityStudyController';
import { verifyToken, requireRole } from '../middleware/verify';

const router = Router();

router.use(verifyToken);

router.get('/', (req, res) => securityStudyController.getAll(req, res));
router.get('/:id', (req, res) => securityStudyController.getById(req, res));
router.post('/', requireRole('ADMIN', 'GERENTE_SEGURIDAD', 'COORDINADOR_FISICA'), (req, res) => securityStudyController.create(req, res));
router.put('/:id', requireRole('ADMIN', 'GERENTE_SEGURIDAD', 'COORDINADOR_FISICA'), (req, res) => securityStudyController.update(req, res));
router.delete('/:id', requireRole('ADMIN', 'GERENTE_SEGURIDAD'), (req, res) => securityStudyController.delete(req, res));
router.post('/:id/generate', requireRole('ADMIN', 'GERENTE_SEGURIDAD'), (req, res) => securityStudyController.generateWithAI(req, res));

export default router;