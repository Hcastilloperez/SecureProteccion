import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { aiConfigurationService, OllamaModel } from '@/services/ai-configuration.service';
import api from '@/config/axios';
import { AIConfiguration, IncidentRecommendation } from '@/types';
import { aiConfigurationSchema, AIConfigurationFormData } from '@/lib/schemas';
import { Plus, Pencil, Trash2, Brain, Wifi, WifiOff, Clock, AlertCircle, CheckCircle, Loader2, Activity, Star, RefreshCw } from 'lucide-react';

export default function AIPage() {
  const [configurations, setConfigurations] = useState<AIConfiguration[]>([]);
  const [recommendations, setRecommendations] = useState<IncidentRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<AIConfiguration | null>(null);
  const [testingConfigId, setTestingConfigId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [defaultConfig, setDefaultConfig] = useState<{ model: string; baseUrl: string } | null>(null);
  const [stats, setStats] = useState({ totalConfigs: 0, activeConfigs: 0, totalAnalyses: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [configsRes, recsRes, defaultRes] = await Promise.all([
        aiConfigurationService.getAll(),
        api.get<{ success: boolean; data: IncidentRecommendation[] }>('/ai/recommendations'),
        aiConfigurationService.getDefaultConfig(),
      ]);
      
      if (configsRes.success) {
        setConfigurations(configsRes.data || []);
        setStats({
          totalConfigs: (configsRes.data || []).length,
          activeConfigs: (configsRes.data || []).filter(c => c.isActive).length,
          totalAnalyses: recsRes.data.data?.length || 0,
        });
      }
      if (recsRes.data.success) {
        setRecommendations(recsRes.data.data || []);
      }
      if (defaultRes.success) {
        setDefaultConfig(defaultRes.data);
      }
    } catch (error) {
      console.error('Error fetching AI data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (data: AIConfigurationFormData & { installationId?: string }) => {
    try {
      if (editingConfig) {
        await aiConfigurationService.update(editingConfig.id, data);
      } else {
        await aiConfigurationService.create(data);
      }
      setDialogOpen(false);
      setEditingConfig(null);
      fetchData();
    } catch (error) {
      console.error('Error saving config:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar esta configuración?')) return;
    try {
      await api.delete(`/ai/configurations/${id}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting config:', error);
    }
  };

  const handleTest = async (config: AIConfiguration) => {
    setTestingConfigId(config.id);
    setTestResult(null);
    try {
      const response = await aiConfigurationService.test(config.id);
      setTestResult({ success: true, message: response.data?.response || 'Conexión exitosa' });
    } catch (error: any) {
      setTestResult({ 
        success: false, 
        message: error.response?.data?.error || 'Error de conexión con Ollama' 
      });
    } finally {
      setTestingConfigId(null);
    }
  };

  const handleSetDefault = async (model: string, baseUrl?: string) => {
    try {
      await aiConfigurationService.setDefaultModel(model, baseUrl);
      fetchData();
      alert(`Modelo predeterminado actualizado a: ${model}`);
    } catch (error) {
      console.error('Error setting default model:', error);
      alert('Error al guardar configuración');
    }
  };

  const openEdit = (config: AIConfiguration) => {
    setEditingConfig(config);
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditingConfig(null);
    setDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Brain className="h-8 w-8" />
          Módulo de Inteligencia Artificial
        </h1>
        <p className="text-muted-foreground">Configuración y gestión de Ollama para análisis de seguridad</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Configuraciones</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalConfigs}</div>
            <p className="text-xs text-muted-foreground">Total configuradas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeConfigs}</div>
            <p className="text-xs text-muted-foreground">Conectadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Análisis</CardTitle>
            <Brain className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAnalyses}</div>
            <p className="text-xs text-muted-foreground">Realizados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modelo Predeterminado</CardTitle>
            {configurations.some(c => c.isActive) ? (
              <Star className="h-4 w-4 text-yellow-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{defaultConfig?.model || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">{defaultConfig?.baseUrl || 'Sin URL'}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="configurations" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="configurations">Configuraciones</TabsTrigger>
          <TabsTrigger value="history">Historial de Análisis</TabsTrigger>
          <TabsTrigger value="models">Modelos Disponibles</TabsTrigger>
        </TabsList>

        <TabsContent value="configurations" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Configuraciones de Ollama</CardTitle>
                <CardDescription>Administre las conexiones a servidores Ollama</CardDescription>
              </div>
              <Button size="sm" onClick={openCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Configuración
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {configurations.map((config) => (
                  <div key={config.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{config.name}</h3>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            config.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {config.isActive ? 'Activo' : 'Inactivo'}
                          </span>
                          {defaultConfig?.model === config.model && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700 flex items-center gap-1">
                              <Star className="h-3 w-3" /> Predeterminado
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground">
                          <p><span className="font-medium">URL:</span> {config.baseUrl}</p>
                          <p><span className="font-medium">Modelo:</span> {config.model}</p>
                          <p><span className="font-medium">Temperatura:</span> {config.temperature} | <span className="font-medium">Max Tokens:</span> {config.maxTokens}</p>
                          {config.installation && (
                            <p><span className="font-medium">Instalación:</span> {config.installation.name}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTest(config)}
                          disabled={testingConfigId === config.id}
                        >
                          {testingConfigId === config.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Wifi className="h-4 w-4" />
                          )}
                          <span className="ml-2">Probar</span>
                        </Button>
                        {config.isActive && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSetDefault(config.model, config.baseUrl)}
                          >
                            <Star className="h-4 w-4" />
                            <span className="ml-2">Predeterminado</span>
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => openEdit(config)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(config.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    {testResult && editingConfig?.id === config.id && (
                      <div className={`mt-3 p-3 rounded-lg text-sm ${
                        testResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {testResult.success ? <CheckCircle className="h-4 w-4 inline mr-2" /> : <AlertCircle className="h-4 w-4 inline mr-2" />}
                        {testResult.message}
                      </div>
                    )}
                  </div>
                ))}
                {configurations.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Brain className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No hay configuraciones de IA registradas</p>
                    <p className="text-sm">Cree una nueva configuración para comenzar</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Análisis</CardTitle>
              <CardDescription>Análisis realizados por la IA</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.slice(0, 20).map((rec) => (
                  <div key={rec.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            rec.incidentId ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {rec.incidentId ? 'Incidente' : 'Instalación'}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(rec.createdAt).toLocaleString('es-CO')}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{rec.recommendation}</p>
                        {rec.source && (
                          <p className="text-xs text-muted-foreground mt-2">Fuente: {rec.source}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {recommendations.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No hay análisis realizados</p>
                    <p className="text-sm">Los análisis de incidentes aparecerán aquí</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="models" className="space-y-4">
          <AvailableModelsTab
            defaultConfig={defaultConfig}
            onSetDefault={handleSetDefault}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingConfig ? 'Editar' : 'Nueva'} Configuración de IA</DialogTitle>
            <DialogDescription>
              Configure la conexión a un servidor Ollama
            </DialogDescription>
          </DialogHeader>
          <AIConfigForm
            config={editingConfig}
            onSubmit={handleSave}
            onCancel={() => {
              setDialogOpen(false);
              setEditingConfig(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AvailableModelsTab({
  defaultConfig,
  onSetDefault,
}: {
  defaultConfig?: { model: string; baseUrl: string } | null;
  onSetDefault: (model: string, baseUrl?: string) => void;
}) {
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [baseUrl, setBaseUrl] = useState(defaultConfig?.baseUrl || 'http://localhost:11434');

  const fetchModels = async (url: string) => {
    setIsLoading(true);
    setError(null);
    setConnected(false);
    try {
      const response = await aiConfigurationService.getAvailableModels(url);
      if (response.success) {
        setModels(response.data || []);
        setConnected(true);
      } else {
        setError('Error al cargar modelos');
      }
    } catch (err) {
      setError('No se pudo conectar al servidor Ollama');
      setModels([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchModels(baseUrl);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Modelos Disponibles en Ollama</CardTitle>
        <CardDescription>
          Modelos instalados en su servidor Ollama. Seleccione uno para usarlo como predeterminado.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="http://localhost:11434"
            className="flex-1"
          />
          {connected && !error && (
            <div className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-2 rounded-md">
              <Wifi className="h-4 w-4" />
              <span className="text-xs font-medium">Conectado</span>
            </div>
          )}
          {!connected && !isLoading && error && (
            <div className="flex items-center gap-1 text-red-600 bg-red-50 px-3 py-2 rounded-md">
              <WifiOff className="h-4 w-4" />
              <span className="text-xs font-medium">Error</span>
            </div>
          )}
          <Button onClick={() => fetchModels(baseUrl)} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-destructive">
            <AlertCircle className="h-12 w-12 mx-auto mb-4" />
            <p>{error}</p>
            <p className="text-sm mt-2">Verifique que Ollama esté ejecutándose y la URL sea correcta</p>
          </div>
        ) : models.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No se encontraron modelos</p>
            <p className="text-sm">Instale modelos con: ollama pull nombre_modelo</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {models.map((model) => (
              <div key={model.name} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold flex items-center gap-2">
                      {model.name}
                      {defaultConfig?.model === model.name && (
                        <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded-full flex items-center gap-1">
                          <Star className="h-3 w-3" /> Predeterminado
                        </span>
                      )}
                    </h3>
                    {model.size && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Tamaño: {(model.size / 1024 / 1024 / 1024).toFixed(2)} GB
                      </p>
                    )}
                    {model.modifiedAt && (
                      <p className="text-xs text-muted-foreground">
                        Modificado: {new Date(model.modifiedAt).toLocaleDateString('es-CO')}
                      </p>
                    )}
                  </div>
                  <Button
                    variant={defaultConfig?.model === model.name ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onSetDefault(model.name, baseUrl)}
                  >
                    <Star className="h-4 w-4 mr-2" />
                    {defaultConfig?.model === model.name ? 'Usando' : 'Usar como predeterminado'}
                  </Button>
                </div>
              </div>
            ))}
            {connected && models.length > 0 && (
              <div className="text-center py-2 text-green-600 text-sm">
                <CheckCircle className="h-4 w-4 inline mr-1" />
                {models.length} modelo(s) cargado(s) correctamente
              </div>
            )}
          </div>
        )}

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">Instalación de modelos</h4>
          <p className="text-sm text-muted-foreground mb-2">
            Para instalar nuevos modelos en Ollama, ejecute en su terminal:
          </p>
          <code className="text-xs bg-background px-2 py-1 rounded block mb-1">
            ollama pull llama3.2
          </code>
          <code className="text-xs bg-background px-2 py-1 rounded block mb-1">
            ollama pull mistral
          </code>
          <code className="text-xs bg-background px-2 py-1 rounded block">
            ollama pull codellama
          </code>
        </div>
      </CardContent>
    </Card>
  );
}

function AIConfigForm({
  config,
  onSubmit,
  onCancel,
}: {
  config?: AIConfiguration | null;
  onSubmit: (data: AIConfigurationFormData & { installationId?: string }) => void;
  onCancel: () => void;
}) {
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);
  const [urlStatus, setUrlStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<AIConfigurationFormData>({
    resolver: zodResolver(aiConfigurationSchema),
    defaultValues: {
      name: config?.name || '',
      model: config?.model || 'llama3',
      baseUrl: config?.baseUrl || 'http://localhost:11434',
      temperature: config?.temperature || 0.7,
      maxTokens: config?.maxTokens || 512,
      systemPrompt: config?.systemPrompt || '',
      isActive: config?.isActive ?? true,
    },
  });

  const baseUrlValue = watch('baseUrl');

  const fetchAvailableModels = async (url: string) => {
    setLoadingModels(true);
    setModelError(null);
    setUrlStatus('idle');
    try {
      const response = await aiConfigurationService.getAvailableModels(url);
      if (response.success) {
        setModels(response.data || []);
        setUrlStatus('success');
        if (response.data && response.data.length > 0) {
          const firstModel = response.data[0].name;
          setValue('model', firstModel);
        }
      } else {
        setModelError('No se pudieron cargar los modelos');
        setModels([]);
        setUrlStatus('error');
      }
    } catch {
      setModelError('Error de conexión con Ollama');
      setModels([]);
      setUrlStatus('error');
    } finally {
      setLoadingModels(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (baseUrlValue) {
        fetchAvailableModels(baseUrlValue);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [baseUrlValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label>Nombre de la Configuración *</Label>
        <Input {...register('name')} placeholder="Ej: Ollama Local, Producción" />
        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
      </div>

      <div>
        <Label>URL del Servidor Ollama *</Label>
        <div className="flex items-center gap-2">
          <Input {...register('baseUrl')} placeholder="http://localhost:11434" className="flex-1" />
          {urlStatus === 'success' && (
            <div className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-2 rounded-md">
              <Wifi className="h-4 w-4" />
              <span className="text-xs font-medium">Conectado</span>
            </div>
          )}
          {urlStatus === 'error' && (
            <div className="flex items-center gap-1 text-red-600 bg-red-50 px-3 py-2 rounded-md">
              <WifiOff className="h-4 w-4" />
              <span className="text-xs font-medium">Error</span>
            </div>
          )}
        </div>
        {errors.baseUrl && <p className="text-sm text-red-500">{errors.baseUrl.message}</p>}
        <p className="text-xs text-muted-foreground mt-1">Escriba la URL y se cargarán los modelos disponibles</p>
      </div>

      <div>
        <Label>Modelo *</Label>
        <div className="relative">
          <select
            {...register('model')}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm appearance-none"
          >
            {loadingModels ? (
              <option value="">Cargando modelos...</option>
            ) : models.length > 0 ? (
              models.map((m) => (
                <option key={m.name} value={m.name}>
                  {m.name}
                </option>
              ))
            ) : (
              <option value="">Escriba la URL para cargar modelos</option>
            )}
          </select>
          {loadingModels && (
            <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
        {errors.model && <p className="text-sm text-red-500">{errors.model.message}</p>}
        {modelError && <p className="text-sm text-amber-500">{modelError}</p>}
        {models.length > 0 && (
          <p className="text-xs text-green-600 mt-1">{models.length} modelo(s) disponible(s)</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Temperatura</Label>
          <Input
            type="number"
            step="0.1"
            min="0"
            max="2"
            {...register('temperature')}
          />
          {errors.temperature && <p className="text-sm text-red-500">{errors.temperature.message}</p>}
          <p className="text-xs text-muted-foreground mt-1">0-2 (0.7 recomendado)</p>
        </div>
        <div>
          <Label>Max Tokens</Label>
          <Input
            type="number"
            min="1"
            max="4096"
            {...register('maxTokens')}
          />
          {errors.maxTokens && <p className="text-sm text-red-500">{errors.maxTokens.message}</p>}
          <p className="text-xs text-muted-foreground mt-1">Máx. tokens de respuesta</p>
        </div>
      </div>

      <div>
        <Label>System Prompt (Opcional)</Label>
        <textarea
          {...register('systemPrompt')}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
          placeholder="Instrucciones especiales para el modelo..."
        />
        {errors.systemPrompt && <p className="text-sm text-red-500">{errors.systemPrompt.message}</p>}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          {...register('isActive')}
          id="isActive"
          className="rounded border-input"
        />
        <Label htmlFor="isActive" className="cursor-pointer">Configuración activa</Label>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {config ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
}
