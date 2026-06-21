import { Request, Response } from 'express';
import prisma from '../config/database';

export class SecurityStudyController {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { installationId } = req.params;
      const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
      const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '20'), 10)));
      const skip = (page - 1) * limit;

      const where: any = { installationId };

      if (req.query.status) {
        where.status = req.query.status;
      }

      if (req.query.search) {
        where.OR = [
          { title: { contains: String(req.query.search), mode: 'insensitive' } },
          { description: { contains: String(req.query.search), mode: 'insensitive' } },
        ];
      }

      const [data, total] = await Promise.all([
        prisma.securityStudy.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.securityStudy.count({ where }),
      ]);

      res.json({
        success: true,
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('Error fetching security studies:', error);
      res.status(500).json({ success: false, error: 'Error al obtener estudios de seguridad' });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { installationId, id } = req.params;

      const study = await prisma.securityStudy.findFirst({
        where: { id, installationId },
        include: {
          installation: {
            select: { id: true, name: true, address: true, city: true },
          },
        },
      });

      if (!study) {
        res.status(404).json({ success: false, error: 'Estudio de seguridad no encontrado' });
        return;
      }

      res.json({ success: true, data: study });
    } catch (error) {
      console.error('Error fetching security study:', error);
      res.status(500).json({ success: false, error: 'Error al obtener estudio de seguridad' });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { installationId } = req.params;
      const { title, description, threatAnalysis, vulnerabilityAnalysis, recommendations, riskLevel, status } = req.body;

      if (!title) {
        res.status(400).json({ success: false, error: 'El título es requerido' });
        return;
      }

      const study = await prisma.securityStudy.create({
        data: {
          installationId,
          title,
          description,
          threatAnalysis,
          vulnerabilityAnalysis,
          recommendations,
          riskLevel,
          status: status || 'DRAFT',
        },
      });

      res.status(201).json({ success: true, data: study });
    } catch (error) {
      console.error('Error creating security study:', error);
      res.status(500).json({ success: false, error: 'Error al crear estudio de seguridad' });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { installationId, id } = req.params;
      const { title, description, threatAnalysis, vulnerabilityAnalysis, recommendations, riskLevel, status, approvedBy, approvedAt } = req.body;

      const study = await prisma.securityStudy.findFirst({
        where: { id, installationId },
      });

      if (!study) {
        res.status(404).json({ success: false, error: 'Estudio de seguridad no encontrado' });
        return;
      }

      const updated = await prisma.securityStudy.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(description !== undefined && { description }),
          ...(threatAnalysis !== undefined && { threatAnalysis }),
          ...(vulnerabilityAnalysis !== undefined && { vulnerabilityAnalysis }),
          ...(recommendations !== undefined && { recommendations }),
          ...(riskLevel !== undefined && { riskLevel }),
          ...(status && { status }),
          ...(approvedBy !== undefined && { approvedBy }),
          ...(approvedAt !== undefined && { approvedAt }),
        },
      });

      res.json({ success: true, data: updated });
    } catch (error) {
      console.error('Error updating security study:', error);
      res.status(500).json({ success: false, error: 'Error al actualizar estudio de seguridad' });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { installationId, id } = req.params;

      const study = await prisma.securityStudy.findFirst({
        where: { id, installationId },
      });

      if (!study) {
        res.status(404).json({ success: false, error: 'Estudio de seguridad no encontrado' });
        return;
      }

      await prisma.securityStudy.delete({ where: { id } });

      res.json({ success: true, message: 'Estudio de seguridad eliminado' });
    } catch (error) {
      console.error('Error deleting security study:', error);
      res.status(500).json({ success: false, error: 'Error al eliminar estudio de seguridad' });
    }
  }

  async generateWithAI(req: Request, res: Response): Promise<void> {
    try {
      const { installationId, id } = req.params;

      const study = await prisma.securityStudy.findFirst({
        where: { id, installationId },
        include: {
          installation: true,
        },
      });

      if (!study) {
        res.status(404).json({ success: false, error: 'Estudio de seguridad no encontrado' });
        return;
      }

      const modelConfig = await prisma.configuration.findUnique({
        where: { key: 'OLLAMA_MODEL' },
      });
      const urlConfig = await prisma.configuration.findUnique({
        where: { key: 'OLLAMA_BASE_URL' },
      });

      if (!modelConfig || !modelConfig.value) {
        res.status(400).json({
          success: false,
          error: 'No hay modelo de IA configurado. Vaya a Módulo de IA → Modelos Disponibles y seleccione un modelo predeterminado.',
        });
        return;
      }

      const ollamaModel = modelConfig.value;
      const ollamaUrl = urlConfig?.value || 'http://localhost:11434';

      const prompt = `Genera un estudio de seguridad para la instalación "${study.installation.name}" ubicada en ${study.installation.address}, ${study.installation.city}, ${study.installation.department}.

Descripción: ${study.installation.description || 'No disponible'}

Basándote en esta información, proporciona:

1. ANÁLISIS DE AMENAZAS: Identifica las principales amenazas de seguridad para esta instalación. Considera el tipo de instalación, ubicación y contexto.

2. ANÁLISIS DE VULNERABILIDADES: Identifica las vulnerabilidades potenciales, incluyendo puntos débiles en la seguridad física y electrónica.

3. RECOMENDACIONES: Proporciona recomendaciones específicas y prácticas para mejorar la seguridad.

4. NIVEL DE RIESGO: Clasifica el nivel de riesgo como BAJO, MEDIO, ALTO o CRÍTICO basado en el análisis.

Responde en formato JSON con las claves: threatAnalysis, vulnerabilityAnalysis, recommendations, riskLevel. Cada campo debe ser un texto detallado en español.`;

      const response = await fetch(`${ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: ollamaModel,
          prompt,
          stream: false,
          options: {
            temperature: 0.7,
            num_predict: 1024,
          },
        }),
      });

      if (!response.ok) {
        let errorMessage = `El modelo '${ollamaModel}' no está disponible`;
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = `Modelo '${ollamaModel}' no encontrado. Instale el modelo con: ollama pull ${ollamaModel}`;
          }
        } catch {
          errorMessage = `Error de Ollama (Status: ${response.status}). Verifique que Ollama esté ejecutándose.`;
        }
        res.status(503).json({
          success: false,
          error: errorMessage,
        });
        return;
      }

      const aiResponse = await response.json();
      const aiText = aiResponse.response || '';

      let threatAnalysis = study.threatAnalysis || '';
      let vulnerabilityAnalysis = study.vulnerabilityAnalysis || '';
      let recommendations = study.recommendations || '';
      let riskLevel = study.riskLevel || '';

      try {
        const jsonMatch = aiText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0]);
            threatAnalysis = parsed.threatAnalysis || threatAnalysis;
            vulnerabilityAnalysis = parsed.vulnerabilityAnalysis || vulnerabilityAnalysis;
            recommendations = parsed.recommendations || recommendations;
            riskLevel = parsed.riskLevel || riskLevel;
          } catch {
            recommendations = jsonMatch[0];
            riskLevel = aiText.match(/(BAJO|MEDIO|ALTO|CRÍTICO|CRITICAL)/i)?.[0] || riskLevel;
          }
        } else {
          const cleanedText = aiText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          const lines = cleanedText.split('\n');
          let currentSection = '';

          for (const line of lines) {
            const lowerLine = line.toLowerCase();
            if (lowerLine.includes('análisis de amenazas') || lowerLine.includes('threat')) {
              currentSection = 'threat';
            } else if (lowerLine.includes('vulnerabilidad')) {
              currentSection = 'vulnerability';
            } else if (lowerLine.includes('recomendacion')) {
              currentSection = 'recommendations';
            } else if (lowerLine.includes('nivel de riesgo') || lowerLine.includes('risk')) {
              currentSection = 'risk';
            } else if (currentSection && line.trim()) {
              if (currentSection === 'threat') threatAnalysis += line + '\n';
              else if (currentSection === 'vulnerability') vulnerabilityAnalysis += line + '\n';
              else if (currentSection === 'recommendations') recommendations += line + '\n';
              else if (currentSection === 'risk') {
                const riskMatch = line.match(/(BAJO|MEDIO|ALTO|CRÍTICO|CRITICAL)/i);
                if (riskMatch) riskLevel = riskMatch[0].toUpperCase();
              }
            }
          }

          if (!recommendations) recommendations = aiText;
        }
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        recommendations = aiText;
      }

      threatAnalysis = threatAnalysis.trim();
      vulnerabilityAnalysis = vulnerabilityAnalysis.trim();
      recommendations = recommendations.trim();

      const updated = await prisma.securityStudy.update({
        where: { id },
        data: {
          threatAnalysis,
          vulnerabilityAnalysis,
          recommendations,
          riskLevel,
          status: 'IN_REVIEW',
        },
      });

      res.json({ success: true, data: updated });
    } catch (error) {
      console.error('Error generating security study with AI:', error);
      res.status(500).json({ success: false, error: 'Error al generar estudio con IA' });
    }
  }
}

export const securityStudyController = new SecurityStudyController();