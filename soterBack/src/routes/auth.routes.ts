import { Router } from 'express';
import { authController } from '../controllers/AuthController';
import { verifyToken } from '../middleware/verify';
import { loginRateLimiter } from '../middleware/rateLimit';

const router = Router();

router.post('/login', loginRateLimiter, (req, res) => authController.login(req, res));
router.post('/register', loginRateLimiter, (req, res) => authController.register(req, res));
router.get('/profile', verifyToken, (req, res) => authController.profile(req, res));
router.post('/change-password', verifyToken, (req, res) => authController.changePassword(req, res));

export default router;