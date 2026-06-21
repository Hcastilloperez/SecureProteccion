import { Router } from 'express';
import { incidentController } from '../controllers/IncidentController';
import { verifyToken, requireRole } from '../middleware/verify';

const router = Router();

router.use(verifyToken);

router.get('/', (req, res) => incidentController.getAll(req, res));
router.get('/stats', (req, res) => incidentController.getStats(req, res));
router.get('/:id', (req, res) => incidentController.getById(req, res));
router.post('/', requireRole('ADMIN', 'OPERADOR_CENTRO', 'GERENTE_SEGURIDAD'), (req, res) => incidentController.create(req, res));
router.put('/:id', requireRole('ADMIN', 'OPERADOR_CENTRO', 'GERENTE_SEGURIDAD', 'COORDINADOR_FISICA', 'COORDINADOR_ELECTRONICA', 'COORDINADOR_INVESTIGACIONES'), (req, res) => incidentController.update(req, res));
router.post('/:id/timeline', requireRole('ADMIN', 'OPERADOR_CENTRO', 'GERENTE_SEGURIDAD', 'COORDINADOR_FISICA', 'COORDINADOR_ELECTRONICA', 'COORDINADOR_INVESTIGACIONES'), (req, res) => incidentController.addTimeline(req, res));
router.post('/:id/verify', requireRole('ADMIN', 'OPERADOR_CENTRO', 'GERENTE_SEGURIDAD'), (req, res) => incidentController.verify(req, res));
router.post('/:id/escalate', requireRole('ADMIN', 'OPERADOR_CENTRO', 'GERENTE_SEGURIDAD', 'COORDINADOR_FISICA', 'COORDINADOR_ELECTRONICA', 'COORDINADOR_INVESTIGACIONES'), (req, res) => incidentController.escalate(req, res));
router.post('/:id/receive', requireRole('ADMIN', 'COORDINADOR_FISICA', 'COORDINADOR_ELECTRONICA', 'COORDINADOR_INVESTIGACIONES', 'GERENTE_SEGURIDAD'), (req, res) => incidentController.receive(req, res));
router.post('/:id/close', requireRole('ADMIN', 'GERENTE_SEGURIDAD', 'COORDINADOR_FISICA', 'COORDINADOR_ELECTRONICA', 'COORDINADOR_INVESTIGACIONES'), (req, res) => incidentController.close(req, res));

export default router;