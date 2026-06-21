import { Router } from 'express';
import { userController } from '../controllers/UserController';
import { verifyToken, requireRole } from '../middleware/verify';

const router = Router();

router.use(verifyToken);

router.get('/', (req, res) => userController.getAll(req, res));
router.get('/:id', (req, res) => userController.getById(req, res));
router.post('/', requireRole('ADMIN'), (req, res) => userController.create(req, res));
router.put('/:id', requireRole('ADMIN'), (req, res) => userController.update(req, res));
router.post('/:id/password', requireRole('ADMIN'), (req, res) => userController.updatePassword(req, res));
router.delete('/:id', requireRole('ADMIN'), (req, res) => userController.delete(req, res));

export default router;