import { Router } from 'express';
import { aiController } from '../controllers/AIController';
import { verifyToken, requireRole } from '../middleware/verify';
import { aiRateLimiter } from '../middleware/rateLimit';

const router = Router();

router.use(verifyToken);

router.get('/recommendations', (req, res) => aiController.getRecommendations(req, res));
router.post('/analyze', aiRateLimiter, requireRole('ADMIN', 'GERENTE_SEGURIDAD', 'COORDINADOR_FISICA', 'COORDINADOR_ELECTRONICA', 'COORDINADOR_INVESTIGACIONES'), (req, res) => aiController.analyzeIncident(req, res));
router.post('/security-study', aiRateLimiter, requireRole('ADMIN', 'GERENTE_SEGURIDAD', 'COORDINADOR_FISICA', 'COORDINADOR_ELECTRONICA', 'COORDINADOR_INVESTIGACIONES'), (req, res) => aiController.analyzeSecurityStudy(req, res));

router.get('/configurations', (req, res) => aiController.getConfigurations(req, res));
router.post('/configurations', requireRole('ADMIN', 'GERENTE_SEGURIDAD'), (req, res) => aiController.createConfiguration(req, res));
router.put('/configurations/:id', requireRole('ADMIN', 'GERENTE_SEGURIDAD'), (req, res) => aiController.updateConfiguration(req, res));
router.post('/configurations/:id/test', aiRateLimiter, requireRole('ADMIN', 'GERENTE_SEGURIDAD', 'COORDINADOR_ELECTRONICA'), (req, res) => aiController.testConfiguration(req, res));
router.get('/models', (req, res) => aiController.getAvailableModels(req, res));
router.post('/set-default-model', requireRole('ADMIN', 'GERENTE_SEGURIDAD'), (req, res) => aiController.setDefaultModel(req, res));
router.get('/default-config', (req, res) => aiController.getDefaultConfig(req, res));

export default router;