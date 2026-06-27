"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const IncidentController_1 = require("../controllers/IncidentController");
const verify_1 = require("../middleware/verify");
const router = (0, express_1.Router)();
router.use(verify_1.verifyToken);
router.get('/', (req, res) => IncidentController_1.incidentController.getAll(req, res));
router.get('/stats', (req, res) => IncidentController_1.incidentController.getStats(req, res));
router.get('/:id', (req, res) => IncidentController_1.incidentController.getById(req, res));
router.post('/', (0, verify_1.requireRole)('ADMIN', 'OPERADOR_CENTRO', 'GERENTE_SEGURIDAD'), (req, res) => IncidentController_1.incidentController.create(req, res));
router.put('/:id', (0, verify_1.requireRole)('ADMIN', 'OPERADOR_CENTRO', 'GERENTE_SEGURIDAD', 'COORDINADOR_FISICA', 'COORDINADOR_ELECTRONICA', 'COORDINADOR_INVESTIGACIONES'), (req, res) => IncidentController_1.incidentController.update(req, res));
router.post('/:id/timeline', (0, verify_1.requireRole)('ADMIN', 'OPERADOR_CENTRO', 'GERENTE_SEGURIDAD', 'COORDINADOR_FISICA', 'COORDINADOR_ELECTRONICA', 'COORDINADOR_INVESTIGACIONES'), (req, res) => IncidentController_1.incidentController.addTimeline(req, res));
router.post('/:id/verify', (0, verify_1.requireRole)('ADMIN', 'OPERADOR_CENTRO', 'GERENTE_SEGURIDAD'), (req, res) => IncidentController_1.incidentController.verify(req, res));
router.post('/:id/escalate', (0, verify_1.requireRole)('ADMIN', 'OPERADOR_CENTRO', 'GERENTE_SEGURIDAD', 'COORDINADOR_FISICA', 'COORDINADOR_ELECTRONICA', 'COORDINADOR_INVESTIGACIONES'), (req, res) => IncidentController_1.incidentController.escalate(req, res));
router.post('/:id/receive', (0, verify_1.requireRole)('ADMIN', 'COORDINADOR_FISICA', 'COORDINADOR_ELECTRONICA', 'COORDINADOR_INVESTIGACIONES', 'GERENTE_SEGURIDAD'), (req, res) => IncidentController_1.incidentController.receive(req, res));
router.post('/:id/close', (0, verify_1.requireRole)('ADMIN', 'GERENTE_SEGURIDAD', 'COORDINADOR_FISICA', 'COORDINADOR_ELECTRONICA', 'COORDINADOR_INVESTIGACIONES'), (req, res) => IncidentController_1.incidentController.close(req, res));
exports.default = router;
//# sourceMappingURL=incident.routes.js.map