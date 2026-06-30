'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { aiConfigurationSchema, AIConfigurationFormData } from '@/lib/schemas';
import { aiConfigurationService, OllamaModel } from '@/services/ai-configuration.service';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

interface AIConfiguration {
  id: string;
  name: string;
  model: string;
  baseUrl: string;
  temperature: number;
  maxTokens: number;
  systemPrompt?: string;
  isActive: boolean;
}

interface AIConfigFormProps {
  config?: AIConfiguration | null;
  onSubmit: (data: AIConfigurationFormData & { installationId?: string }) => void;
  onCancel: () => void;
}

export function AIConfigForm({ config, onSubmit, onCancel }: AIConfigFormProps) {
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
