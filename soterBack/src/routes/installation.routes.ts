import { Router } from 'express';
import { installationController } from '../controllers/InstallationController';
import { contactController } from '../controllers/ContactController';
import { authorityController } from '../controllers/AuthorityController';
import { securityGuardController } from '../controllers/SecurityGuardController';
import { securityStudyController } from '../controllers/SecurityStudyController';
import { verifyToken, requireRole } from '../middleware/verify';

const router = Router({ mergeParams: true });

router.use(verifyToken);

router.get('/', (req, res) => installationController.getAll(req, res));
router.get('/:id', (req, res) => installationController.getById(req, res));
router.post('/', requireRole('ADMIN', 'GERENTE_SEGURIDAD'), (req, res) => installationController.create(req, res));
router.put('/:id', requireRole('ADMIN', 'GERENTE_SEGURIDAD'), (req, res) => installationController.update(req, res));
router.delete('/:id', requireRole('ADMIN', 'GERENTE_SEGURIDAD'), (req, res) => installationController.delete(req, res));

router.get('/:installationId/contacts', (req, res) => contactController.getAll(req, res));
router.get('/:installationId/contacts/:id', (req, res) => contactController.getById(req, res));
router.post('/:installationId/contacts', requireRole('ADMIN', 'GERENTE_SEGURIDAD', 'COORDINADOR_FISICA'), (req, res) => contactController.create(req, res));
router.put('/:installationId/contacts/:id', requireRole('ADMIN', 'GERENTE_SEGURIDAD', 'COORDINADOR_FISICA'), (req, res) => contactController.update(req, res));
router.delete('/:installationId/contacts/:id', requireRole('ADMIN', 'GERENTE_SEGURIDAD'), (req, res) => contactController.delete(req, res));

router.get('/:installationId/authorities', (req, res) => authorityController.getAll(req, res));
router.get('/:installationId/authorities/:id', (req, res) => authorityController.getById(req, res));
router.post('/:installationId/authorities', requireRole('ADMIN', 'GERENTE_SEGURIDAD', 'COORDINADOR_FISICA'), (req, res) => authorityController.create(req, res));
router.put('/:installationId/authorities/:id', requireRole('ADMIN', 'GERENTE_SEGURIDAD', 'COORDINADOR_FISICA'), (req, res) => authorityController.update(req, res));
router.delete('/:installationId/authorities/:id', requireRole('ADMIN', 'GERENTE_SEGURIDAD'), (req, res) => authorityController.delete(req, res));

router.get('/:installationId/security-systems', (req, res) => installationController.getSecuritySystems(req, res));

router.get('/:installationId/security-guards', (req, res) => securityGuardController.getAll(req, res));
router.get('/:installationId/security-guards/:id', (req, res) => securityGuardController.getById(req, res));
router.post('/:installationId/security-guards', requireRole('ADMIN', 'GERENTE_SEGURIDAD', 'COORDINADOR_FISICA'), (req, res) => securityGuardController.create(req, res));
router.put('/:installationId/security-guards/:id', requireRole('ADMIN', 'GERENTE_SEGURIDAD', 'COORDINADOR_FISICA'), (req, res) => securityGuardController.update(req, res));
router.delete('/:installationId/security-guards/:id', requireRole('ADMIN', 'GERENTE_SEGURIDAD'), (req, res) => securityGuardController.delete(req, res));

router.get('/:installationId/security-studies', (req, res) => securityStudyController.getAll(req, res));
router.get('/:installationId/security-studies/:id', (req, res) => securityStudyController.getById(req, res));
router.post('/:installationId/security-studies', requireRole('ADMIN', 'GERENTE_SEGURIDAD', 'COORDINADOR_FISICA'), (req, res) => securityStudyController.create(req, res));
router.put('/:installationId/security-studies/:id', requireRole('ADMIN', 'GERENTE_SEGURIDAD', 'COORDINADOR_FISICA'), (req, res) => securityStudyController.update(req, res));
router.delete('/:installationId/security-studies/:id', requireRole('ADMIN', 'GERENTE_SEGURIDAD'), (req, res) => securityStudyController.delete(req, res));
router.post('/:installationId/security-studies/:id/generate', requireRole('ADMIN', 'GERENTE_SEGURIDAD'), (req, res) => securityStudyController.generateWithAI(req, res));

export default router;