import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { verifyToken } from '../middleware/verify';
import prisma from '../config/database';
import { config } from '../config';

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.upload.dir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/webm', 'video/ogg',
    'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3',
    'application/pdf',
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.upload.maxFileSize },
});

router.use(verifyToken);

router.post('/incidents/:id/attachments', upload.array('files', 10), async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, error: 'No se proporcionaron archivos' });
    }

    const incident = await prisma.incident.findUnique({ where: { id } });
    if (!incident) {
      return res.status(404).json({ success: false, error: 'Incidente no encontrado' });
    }

    const attachments = await Promise.all(
      files.map(async (file) => {
        return prisma.incidentAttachment.create({
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
      })
    );

    res.status(201).json({ success: true, data: attachments });
  } catch (error: any) {
    console.error('Error uploading files:', error);
    res.status(500).json({ success: false, error: error.message || 'Error al subir archivos' });
  }
});

router.get('/incidents/:id/attachments', async (req, res) => {
  try {
    const { id } = req.params;

    const attachments = await prisma.incidentAttachment.findMany({
      where: { incidentId: id },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: attachments });
  } catch (error) {
    console.error('Error fetching attachments:', error);
    res.status(500).json({ success: false, error: 'Error al obtener archivos' });
  }
});

router.delete('/attachments/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.incidentAttachment.delete({ where: { id } });

    res.json({ success: true, message: 'Archivo eliminado' });
  } catch (error) {
    console.error('Error deleting attachment:', error);
    res.status(500).json({ success: false, error: 'Error al eliminar archivo' });
  }
});

export default router;