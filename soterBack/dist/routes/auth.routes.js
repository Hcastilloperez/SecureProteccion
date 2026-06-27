"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = require("../controllers/AuthController");
const verify_1 = require("../middleware/verify");
const rateLimit_1 = require("../middleware/rateLimit");
const router = (0, express_1.Router)();
router.post('/login', rateLimit_1.loginRateLimiter, (req, res) => AuthController_1.authController.login(req, res));
router.post('/register', rateLimit_1.loginRateLimiter, (req, res) => AuthController_1.authController.register(req, res));
router.get('/profile', verify_1.verifyToken, (req, res) => AuthController_1.authController.profile(req, res));
router.post('/change-password', verify_1.verifyToken, (req, res) => AuthController_1.authController.changePassword(req, res));
exports.default = router;
//# sourceMappingURL=auth.routes.js.map