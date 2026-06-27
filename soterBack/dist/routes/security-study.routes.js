"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const SecurityStudyController_1 = require("../controllers/SecurityStudyController");
const verify_1 = require("../middleware/verify");
const router = (0, express_1.Router)();
router.use(verify_1.verifyToken);
router.get('/', (req, res) => SecurityStudyController_1.securityStudyController.getAll(req, res));
router.get('/:id', (req, res) => SecurityStudyController_1.securityStudyController.getById(req, res));
router.post('/', (0, verify_1.requireRole)('ADMIN', 'GERENTE_SEGURIDAD', 'COORDINADOR_FISICA'), (req, res) => SecurityStudyController_1.securityStudyController.create(req, res));
router.put('/:id', (0, verify_1.requireRole)('ADMIN', 'GERENTE_SEGURIDAD', 'COORDINADOR_FISICA'), (req, res) => SecurityStudyController_1.securityStudyController.update(req, res));
router.delete('/:id', (0, verify_1.requireRole)('ADMIN', 'GERENTE_SEGURIDAD'), (req, res) => SecurityStudyController_1.securityStudyController.delete(req, res));
router.post('/:id/generate', (0, verify_1.requireRole)('ADMIN', 'GERENTE_SEGURIDAD'), (req, res) => SecurityStudyController_1.securityStudyController.generateWithAI(req, res));
exports.default = router;
//# sourceMappingURL=security-study.routes.js.map