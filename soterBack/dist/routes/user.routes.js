"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UserController_1 = require("../controllers/UserController");
const verify_1 = require("../middleware/verify");
const router = (0, express_1.Router)();
router.use(verify_1.verifyToken);
router.get('/', (req, res) => UserController_1.userController.getAll(req, res));
router.get('/:id', (req, res) => UserController_1.userController.getById(req, res));
router.post('/', (0, verify_1.requireRole)('ADMIN'), (req, res) => UserController_1.userController.create(req, res));
router.put('/:id', (0, verify_1.requireRole)('ADMIN'), (req, res) => UserController_1.userController.update(req, res));
router.post('/:id/password', (0, verify_1.requireRole)('ADMIN'), (req, res) => UserController_1.userController.updatePassword(req, res));
router.delete('/:id', (0, verify_1.requireRole)('ADMIN'), (req, res) => UserController_1.userController.delete(req, res));
exports.default = router;
//# sourceMappingURL=user.routes.js.map