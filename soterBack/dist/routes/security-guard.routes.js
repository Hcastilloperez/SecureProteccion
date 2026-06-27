"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const SecurityGuardController_1 = require("../controllers/SecurityGuardController");
const verify_1 = require("../middleware/verify");
const router = (0, express_1.Router)();
router.use(verify_1.verifyToken);
router.get('/', (req, res) => SecurityGuardController_1.securityGuardController.getAll(req, res));
router.get('/:id', (req, res) => SecurityGuardController_1.securityGuardController.getById(req, res));
router.post('/', (0, verify_1.requireRole)('ADMIN', 'GERENTE_SEGURIDAD', 'COORDINADOR_FISICA'), (req, res) => SecurityGuardController_1.securityGuardController.create(req, res));
router.put('/:id', (0, verify_1.requireRole)('ADMIN', 'GERENTE_SEGURIDAD', 'COORDINADOR_FISICA'), (req, res) => SecurityGuardController_1.securityGuardController.update(req, res));
router.delete('/:id', (0, verify_1.requireRole)('ADMIN', 'GERENTE_SEGURIDAD'), (req, res) => SecurityGuardController_1.securityGuardController.delete(req, res));
exports.default = router;
//# sourceMappingURL=security-guard.routes.js.map