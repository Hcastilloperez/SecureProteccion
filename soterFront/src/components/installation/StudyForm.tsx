import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { securityStudySchema, SecurityStudyFormData } from '@/lib/schemas';

interface StudyFormProps {
  defaultValues?: Partial<SecurityStudyFormData>;
  onSubmit: (data: SecurityStudyFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function StudyForm({ defaultValues, onSubmit, onCancel, isLoading }: StudyFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<SecurityStudyFormData>({
    resolver: zodResolver(securityStudySchema),
    defaultValues: {
      title: '',
      description: '',
      threatAnalysis: '',
      vulnerabilityAnalysis: '',
      recommendations: '',
      riskLevel: '',
      status: 'DRAFT',
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Título *</label>
        <input {...register('title')} className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm" />
        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
      </div>
      <div>
        <label className="text-sm font-medium">Descripción</label>
        <textarea {...register('description')} rows={2} className="w-full rounded-md border border-input bg-transparent px-3 text-sm" />
      </div>
      <div>
        <label className="text-sm font-medium">Análisis de Amenazas</label>
        <textarea {...register('threatAnalysis')} rows={4} placeholder="Describa las principales amenazas de seguridad..." className="w-full rounded-md border border-input bg-transparent px-3 text-sm" />
      </div>
      <div>
        <label className="text-sm font-medium">Análisis de Vulnerabilidades</label>
        <textarea {...register('vulnerabilityAnalysis')} rows={4} placeholder="Identifique las vulnerabilidades potenciales..." className="w-full rounded-md border border-input bg-transparent px-3 text-sm" />
      </div>
      <div>
        <label className="text-sm font-medium">Recomendaciones</label>
        <textarea {...register('recommendations')} rows={4} placeholder="Proporcione recomendaciones específicas..." className="w-full rounded-md border border-input bg-transparent px-3 text-sm" />
      </div>
      <div>
        <label className="text-sm font-medium">Nivel de Riesgo</label>
        <select {...register('riskLevel')} className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm">
          <option value="">Seleccionar</option>
          <option value="BAJO">Bajo</option>
          <option value="MEDIO">Medio</option>
          <option value="ALTO">Alto</option>
          <option value="CRÍTICO">Crítico</option>
        </select>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Guardando...' : defaultValues?.title ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
}
