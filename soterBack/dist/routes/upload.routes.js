"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const verify_1 = require("../middleware/verify");
const database_1 = __importDefault(require("../config/database"));
const config_1 = require("../config");
const router = (0, express_1.Router)();
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, config_1.config.upload.dir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${(0, uuid_1.v4)()}${path_1.default.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'video/webm', 'video/ogg',
        'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3',
        'application/pdf',
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Tipo de archivo no permitido'));
    }
};
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: config_1.config.upload.maxFileSize },
});
router.use(verify_1.verifyToken);
router.post('/incidents/:id/attachments', upload.array('files', 10), async (req, res) => {
    try {
        const { id } = req.params;
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({ success: false, error: 'No se proporcionaron archivos' });
        }
        const incident = await database_1.default.incident.findUnique({ where: { id } });
        if (!incident) {
            return res.status(404).json({ success: false, error: 'Incidente no encontrado' });
        }
        const attachments = await Promise.all(files.map(async (file) => {
            return database_1.default.incidentAttachment.create({
                data: {
                    incidentId: id,
                    fileName: file.originalname,
                    fileUrl: `/uploads/${file.filename}`,
                    fileType: file.mimetype.startsWith('image/') ? 'image' :
                        file.mimetype.startsWith('video/') ? 'video' :
                            file.mimetype.startsWith('audio/') ? 'audio' : 'document',
                    fileSize: file.size,
                    mimeType: file.mimetype,
                },
            });
        }));
        res.status(201).json({ success: true, data: attachments });
    }
    catch (error) {
        console.error('Error uploading files:', error);
        res.status(500).json({ success: false, error: error.message || 'Error al subir archivos' });
    }
});
router.get('/incidents/:id/attachments', async (req, res) => {
    try {
        const { id } = req.params;
        const attachments = await database_1.default.incidentAttachment.findMany({
            where: { incidentId: id },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ success: true, data: attachments });
    }
    catch (error) {
        console.error('Error fetching attachments:', error);
        res.status(500).json({ success: false, error: 'Error al obtener archivos' });
    }
});
router.delete('/attachments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await database_1.default.incidentAttachment.delete({ where: { id } });
        res.json({ success: true, message: 'Archivo eliminado' });
    }
    catch (error) {
        console.error('Error deleting attachment:', error);
        res.status(500).json({ success: false, error: 'Error al eliminar archivo' });
    }
});
exports.default = router;
//# sourceMappingURL=upload.routes.js.map