import { Router } from 'express';
import { physicalSecurityController } from '../controllers/PhysicalSecurityController';
import { verifyToken, requireRole } from '../middleware/verify';

const router = Router();

router.use(verifyToken);

router.get('/guards', (req, res) => physicalSecurityController.getSecurityGuards(req, res));
router.post('/guards', requireRole('ADMIN', 'GERENTE_SEGURIDAD', 'COORDINADOR_FISICA'), (req, res) => physicalSecurityController.createSecurityGuard(req, res));
router.put('/guards/:id', requireRole('ADMIN', 'GERENTE_SEGURIDAD', 'COORDINADOR_FISICA'), (req, res) => physicalSecurityController.updateSecurityGuard(req, res));
router.delete('/guards/:id', requireRole('ADMIN', 'GERENTE_SEGURIDAD'), (req, res) => physicalSecurityController.deleteSecurityGuard(req, res));
router.get('/stats', (req, res) => physicalSecurityController.getPhysicalSecurityStats(req, res));

router.get('/companies', (req, res) => physicalSecurityController.getCompanies(req, res));
router.post('/companies', requireRole('ADMIN', 'GERENTE_SEGURIDAD'), (req, res) => physicalSecurityController.createCompany(req, res));
router.put('/companies/:id', requireRole('ADMIN', 'GERENTE_SEGURIDAD'), (req, res) => physicalSecurityController.updateCompany(req, res));
router.delete('/companies/:id', requireRole('ADMIN', 'GERENTE_SEGURIDAD'), (req, res) => physicalSecurityController.deleteCompany(req, res));

router.get('/posts', (req, res) => physicalSecurityController.getPosts(req, res));
router.post('/posts', requireRole('ADMIN', 'GERENTE_SEGURIDAD', 'COORDINADOR_FISICA'), (req, res) => physicalSecurityController.createPost(req, res));
router.put('/posts/:id', requireRole('ADMIN', 'GERENTE_SEGURIDAD', 'COORDINADOR_FISICA'), (req, res) => physicalSecurityController.updatePost(req, res));
router.delete('/posts/:id', requireRole('ADMIN', 'GERENTE_SEGURIDAD'), (req, res) => physicalSecurityController.deletePost(req, res));

export default router;