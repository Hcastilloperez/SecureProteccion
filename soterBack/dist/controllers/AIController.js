"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiController = exports.AIController = void 0;
const database_1 = __importDefault(require("../config/database"));
const config_1 = require("../config");
class AIController {
    async getRecommendations(req, res) {
        try {
            const { installationId, incidentId } = req.query;
            const where = {};
            if (installationId)
                where.installationId = String(installationId);
            if (incidentId)
                where.incidentId = String(incidentId);
            const recommendations = await database_1.default.incidentRecommendation.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take: 20,
            });
            res.json({ success: true, data: recommendations });
        }
        catch (error) {
            console.error('Error fetching recommendations:', error);
            res.status(500).json({ success: false, error: 'Error al obtener recomendaciones' });
        }
    }
    async analyzeIncident(req, res) {
        try {
            const { incidentId, installationId } = req.body;
            if (!incidentId && !installationId) {
                res.status(400).json({ success: false, error: 'incidentId o installationId requerido' });
                return;
            }
            const modelConfig = await database_1.default.configuration.findUnique({
                where: { key: 'OLLAMA_MODEL' },
            });
            const urlConfig = await database_1.default.configuration.findUnique({
                where: { key: 'OLLAMA_BASE_URL' },
            });
            if (!modelConfig || !modelConfig.value) {
                res.status(400).json({
                    success: false,
                    error: 'No hay modelo de IA configurado. Vaya a Módulo de IA → Modelos Disponibles y seleccione un modelo predeterminado.',
                });
                return;
            }
            let ollamaModel = modelConfig.value;
            const ollamaUrl = urlConfig?.value || config_1.config.ollama.baseUrl;
            let context = '';
            if (incidentId) {
                const incident = await database_1.default.incident.findUnique({
                    where: { id: incidentId },
                    include: {
                        incidentType: true,
                        installation: true,
                        timelines: {
                            include: { user: true },
                            orderBy: { createdAt: 'desc' },
                            take: 10,
                        },
                    },
                });
                if (!incident) {
                    res.status(404).json({ success: false, error: 'Incidente no encontrado' });
                    return;
                }
                context = `Analiza el siguiente incidente de seguridad:
Título: ${incident.title}
Descripción: ${incident.description}
Tipo: ${incident.incidentType.name}
Instalación: ${incident.installation.name}
Ubicación: ${incident.location || 'No especificada'}
Prioridad: ${incident.priority}
Fecha: ${incident.createdAt.toLocaleDateString()}

Comentarios anteriores:
${incident.timelines.map((t) => `- ${t.user?.name || 'Usuario'}: ${t.comment}`).join('\n')}

Basándote en el historial de incidentes similares y las mejores prácticas de seguridad, proporciona:
1. Análisis del incidente
2. Recomendaciones de acción inmediata
3. Medidas preventivas para el futuro
4. Nivel de riesgo estimado (bajo, medio, alto, crítico)`;
            }
            else if (installationId) {
                const installation = await database_1.default.installation.findUnique({
                    where: { id: installationId },
                    include: {
                        incidents: {
                            where: { status: { code: { not: 'CLOSED' } } },
                            include: { incidentType: true },
                            take: 10,
                        },
                    },
                });
                if (!installation) {
                    res.status(404).json({ success: false, error: 'Instalación no encontrada' });
                    return;
                }
                const recentIncidents = installation.incidents
                    .map((i) => `- ${i.title} (${i.incidentType.name})`)
                    .join('\n');
                context = `Realiza un análisis predictivo de seguridad para la instalación:

Instalación: ${installation.name}
Dirección: ${installation.address}
 Ciudad: ${installation.city}

 Incidentes abiertos recientes:
 ${recentIncidents || 'No hay incidentes abiertos'}

 Basándote en los patrones de incidentes, proporciona:
 1. Análisis de vulnerabilidades identificadas
 2. Recomendaciones de seguridad prioritarias
 3. Predicción de riesgos potenciales
 4. Medidas preventivas recomendadas`;
            }
            const ollamaResponse = await fetch(`${ollamaUrl}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: ollamaModel,
                    prompt: context,
                    stream: false,
                    options: {
                        temperature: 0.7,
                        num_predict: 512,
                    },
                }),
            });
            if (!ollamaResponse.ok) {
                let errorMessage = `El modelo '${ollamaModel}' no está disponible`;
                try {
                    const errorData = await ollamaResponse.json();
                    if (errorData.error) {
                        errorMessage = `Modelo '${ollamaModel}' no encontrado. Instale el modelo con: ollama pull ${ollamaModel}`;
                    }
                }
                catch {
                    errorMessage = `Error de Ollama (Status: ${ollamaResponse.status}). Verifique que Ollama esté ejecutándose.`;
                }
                res.status(503).json({
                    success: false,
                    error: errorMessage,
                });
                return;
            }
            const aiData = await ollamaResponse.json();
            const recommendation = await database_1.default.incidentRecommendation.create({
                data: {
                    incidentId: incidentId || null,
                    installationId: installationId || null,
                    recommendation: aiData.response,
                    source: `ollama:${ollamaModel}`,
                },
            });
            res.json({ success: true, data: recommendation });
        }
        catch (error) {
            console.error('Error analyzing with AI:', error);
            res.status(500).json({
                success: false,
                error: 'Error al analizar con IA. Verifique que Ollama esté ejecutándose y el modelo esté instalado.',
            });
        }
    }
    async analyzeSecurityStudy(req, res) {
        try {
            const { installationId, title, threatAnalysis, vulnerabilityAnalysis } = req.body;
            if (!installationId) {
                res.status(400).json({ success: false, error: 'installationId requerido' });
                return;
            }
            const modelConfig = await database_1.default.configuration.findUnique({
                where: { key: 'OLLAMA_MODEL' },
            });
            const urlConfig = await database_1.default.configuration.findUnique({
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
            const ollamaUrl = urlConfig?.value || config_1.config.ollama.baseUrl;
            const installation = await database_1.default.installation.findUnique({
                where: { id: installationId },
                include: {
                    incidents: {
                        where: {
                            createdAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
                        },
                        include: { incidentType: true },
                    },
                    contacts: true,
                    authorities: true,
                },
            });
            if (!installation) {
                res.status(404).json({ success: false, error: 'Instalación no encontrada' });
                return;
            }
            const context = `Realiza un estudio completo de seguridad para la siguiente instalación:

INSTALACIÓN:
Nombre: ${installation.name}
Dirección: ${installation.address}
Ciudad: ${installation.city}

CONTACTO DE EMERGENCIA:
${installation.contacts
                .filter((c) => c.isEmergency)
                .map((c) => `${c.name} - ${c.position} - ${c.phone}`)
                .join('\n') || 'No hay contactos de emergencia configurados'}

AUTORIDADES CERCANAS:
${installation.authorities
                .map((a) => `${a.name} (${a.type}) - ${a.phone}`)
                .join('\n') || 'No hay autoridades configuradas'}

INCIDENTES RECIENTES (últimos 90 días):
${installation.incidents
                .map((i) => `- ${i.title} (${i.incidentType.name}) - ${i.priority}`)
                .join('\n') || 'No hay incidentes recientes'}

ANÁLISIS PREVIO PROPORCIONADO:
Amenazas identificadas: ${threatAnalysis || 'No proporcionado'}
Análisis de vulnerabilidades: ${vulnerabilityAnalysis || 'No proporcionado'}

Proporciona un estudio de seguridad completo que incluya:
1. Resumen ejecutivo
2. Análisis de amenazas actualizado
3. Análisis de vulnerabilidades actualizado
4. Evaluación de riesgo por áreas
5. Recomendaciones de seguridad priorizadas
6. Plan de acción sugerido`;
            const ollamaResponse = await fetch(`${ollamaUrl}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: ollamaModel,
                    prompt: context,
                    stream: false,
                    options: {
                        temperature: 0.7,
                        num_predict: 1024,
                    },
                }),
            });
            if (!ollamaResponse.ok) {
                let errorMessage = `El modelo '${ollamaModel}' no está disponible`;
                try {
                    const errorData = await ollamaResponse.json();
                    if (errorData.error) {
                        errorMessage = `Modelo '${ollamaModel}' no encontrado. Instale el modelo con: ollama pull ${ollamaModel}`;
                    }
                }
                catch {
                    errorMessage = `Error de Ollama (Status: ${ollamaResponse.status}). Verifique que Ollama esté ejecutándose.`;
                }
                res.status(503).json({
                    success: false,
                    error: errorMessage,
                });
                return;
            }
            const aiData = await ollamaResponse.json();
            const study = await database_1.default.securityStudy.create({
                data: {
                    installationId,
                    title: title || `Estudio de Seguridad - ${installation.name}`,
                    recommendations: aiData.response,
                    status: 'DRAFT',
                },
            });
            res.json({ success: true, data: study });
        }
        catch (error) {
            console.error('Error analyzing security study:', error);
            res.status(500).json({
                success: false,
                error: 'Error al generar estudio de seguridad',
            });
        }
    }
    async getConfigurations(req, res) {
        try {
            const { installationId } = req.query;
            const where = installationId ? { installationId: String(installationId) } : {};
            const configurations = await database_1.default.aIConfiguration.findMany({
                where,
                include: {
                    installation: { select: { id: true, name: true } },
                },
                orderBy: { createdAt: 'desc' },
            });
            res.json({ success: true, data: configurations });
        }
        catch (error) {
            console.error('Error fetching AI configurations:', error);
            res.status(500).json({ success: false, error: 'Error al obtener configuraciones' });
        }
    }
    async createConfiguration(req, res) {
        try {
            const { name, model, baseUrl, temperature, maxTokens, systemPrompt, isActive, installationId } = req.body;
            if (!name) {
                res.status(400).json({ success: false, error: 'Nombre requerido' });
                return;
            }
            const configuration = await database_1.default.aIConfiguration.create({
                data: {
                    name,
                    model: model || 'llama3',
                    baseUrl: baseUrl || 'http://localhost:11434',
                    temperature: temperature || 0.7,
                    maxTokens: maxTokens || 512,
                    systemPrompt,
                    isActive: isActive ?? true,
                    installationId,
                },
            });
            res.status(201).json({ success: true, data: configuration });
        }
        catch (error) {
            console.error('Error creating AI configuration:', error);
            res.status(500).json({ success: false, error: 'Error al crear configuración' });
        }
    }
    async updateConfiguration(req, res) {
        try {
            const { id } = req.params;
            const { name, model, baseUrl, temperature, maxTokens, systemPrompt, isActive } = req.body;
            const configuration = await database_1.default.aIConfiguration.update({
                where: { id },
                data: {
                    ...(name && { name }),
                    ...(model && { model }),
                    ...(baseUrl && { baseUrl }),
                    ...(temperature !== undefined && { temperature }),
                    ...(maxTokens !== undefined && { maxTokens }),
                    ...(systemPrompt !== undefined && { systemPrompt }),
                    ...(isActive !== undefined && { isActive }),
                },
            });
            res.json({ success: true, data: configuration });
        }
        catch (error) {
            console.error('Error updating AI configuration:', error);
            res.status(500).json({ success: false, error: 'Error al actualizar configuración' });
        }
    }
    async testConfiguration(req, res) {
        try {
            const { id } = req.params;
            const configuration = await database_1.default.aIConfiguration.findUnique({
                where: { id },
            });
            if (!configuration) {
                res.status(404).json({ success: false, error: 'Configuración no encontrada' });
                return;
            }
            const testPrompt = 'Responde solo con "OK" si puedes leer este mensaje.';
            const ollamaResponse = await fetch(`${configuration.baseUrl}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: configuration.model,
                    prompt: testPrompt,
                    stream: false,
                    options: {
                        temperature: configuration.temperature,
                        num_predict: configuration.maxTokens,
                    },
                }),
            });
            if (!ollamaResponse.ok) {
                let errorMessage = 'Error de conexión con Ollama';
                try {
                    const errorData = await ollamaResponse.json();
                    if (errorData.error) {
                        errorMessage = `Modelo '${configuration.model}' no encontrado. Instale el modelo con: ollama pull ${configuration.model}`;
                    }
                }
                catch {
                    errorMessage = `Error de Ollama (Status: ${ollamaResponse.status})`;
                }
                res.status(503).json({
                    success: false,
                    error: errorMessage,
                });
                return;
            }
            const aiData = await ollamaResponse.json();
            res.json({
                success: true,
                data: {
                    message: 'Conexión exitosa',
                    response: aiData.response,
                    model: configuration.model,
                    baseUrl: configuration.baseUrl,
                },
            });
        }
        catch (error) {
            console.error('Error testing AI configuration:', error);
            res.status(503).json({
                success: false,
                error: 'Error de conexión con Ollama',
                details: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    async getAvailableModels(req, res) {
        try {
            const { baseUrl } = req.query;
            const url = baseUrl ? String(baseUrl) : config_1.config.ollama.baseUrl;
            const ollamaResponse = await fetch(`${url}/api/tags`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!ollamaResponse.ok) {
                res.status(503).json({
                    success: false,
                    error: 'Error de conexión con Ollama',
                    details: `Status: ${ollamaResponse.status}`,
                });
                return;
            }
            const data = await ollamaResponse.json();
            const models = (data.models || []).map((m) => ({
                name: m.name,
                model: m.model || m.name,
                size: m.size,
                modifiedAt: m.modified_at,
            }));
            res.json({ success: true, data: models });
        }
        catch (error) {
            console.error('Error fetching available models:', error);
            res.status(503).json({
                success: false,
                error: 'Error de conexión con Ollama',
                details: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    async setDefaultModel(req, res) {
        try {
            const { model, baseUrl } = req.body;
            if (!model) {
                res.status(400).json({ success: false, error: 'Modelo requerido' });
                return;
            }
            const configModel = baseUrl || config_1.config.ollama.model;
            await database_1.default.configuration.upsert({
                where: { key: 'OLLAMA_MODEL' },
                update: { value: model },
                create: {
                    key: 'OLLAMA_MODEL',
                    value: model,
                    type: 'string',
                    description: 'Modelo de Ollama por defecto',
                    category: 'ai',
                },
            });
            if (baseUrl && baseUrl !== config_1.config.ollama.baseUrl) {
                await database_1.default.configuration.upsert({
                    where: { key: 'OLLAMA_BASE_URL' },
                    update: { value: baseUrl },
                    create: {
                        key: 'OLLAMA_BASE_URL',
                        value: baseUrl,
                        type: 'string',
                        description: 'URL base de Ollama',
                        category: 'ai',
                    },
                });
            }
            res.json({
                success: true,
                message: `Modelo predeterminado actualizado a: ${model}`,
                data: { model, baseUrl: baseUrl || config_1.config.ollama.baseUrl },
            });
        }
        catch (error) {
            console.error('Error setting default model:', error);
            res.status(500).json({ success: false, error: 'Error al guardar configuración' });
        }
    }
    async getDefaultConfig(req, res) {
        try {
            const modelConfig = await database_1.default.configuration.findUnique({
                where: { key: 'OLLAMA_MODEL' },
            });
            const urlConfig = await database_1.default.configuration.findUnique({
                where: { key: 'OLLAMA_BASE_URL' },
            });
            res.json({
                success: true,
                data: {
                    model: modelConfig?.value || config_1.config.ollama.model,
                    baseUrl: urlConfig?.value || config_1.config.ollama.baseUrl,
                },
            });
        }
        catch (error) {
            console.error('Error fetching default config:', error);
            res.status(500).json({ success: false, error: 'Error al obtener configuración' });
        }
    }
}
exports.AIController = AIController;
exports.aiController = new AIController();
//# sourceMappingURL=AIController.js.map