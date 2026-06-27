"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthorityController_1 = require("../controllers/AuthorityController");
const verify_1 = require("../middleware/verify");
const router = (0, express_1.Router)();
router.use(verify_1.verifyToken);
router.get('/', (req, res) => AuthorityController_1.authorityController.getAll(req, res));
router.get('/:id', (req, res) => AuthorityController_1.authorityController.getById(req, res));
router.post('/', (0, verify_1.requireRole)('ADMIN', 'GERENTE_SEGURIDAD', 'COORDINADOR_FISICA'), (req, res) => AuthorityController_1.authorityController.create(req, res));
router.put('/:id', (0, verify_1.requireRole)('ADMIN', 'GERENTE_SEGURIDAD', 'COORDINADOR_FISICA'), (req, res) => AuthorityController_1.authorityController.update(req, res));
router.delete('/:id', (0, verify_1.requireRole)('ADMIN', 'GERENTE_SEGURIDAD'), (req, res) => AuthorityController_1.authorityController.delete(req, res));
exports.default = router;
//# sourceMappingURL=authority.routes.js.map