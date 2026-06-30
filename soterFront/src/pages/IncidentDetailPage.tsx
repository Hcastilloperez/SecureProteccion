import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { incidentService } from '@/services/incident.service';
import { uploadService } from '@/services/upload.service';
import { Incident, IncidentAttachment } from '@/types';
import { formatDateTime, getPriorityColor, getStatusColor } from '@/lib/utils';
import api from '@/config/axios';
import { CloseIncidentDialog } from '@/components/incidents/CloseIncidentDialog';
import {
  ArrowLeft, Send, AlertTriangle, MapPin, User as UserIcon,
  Paperclip, X, FileText, Image, Video, Music, Sparkles,
  CheckCircle, Upload, Trash2, MessageSquare,
  AlertCircle, ArrowUp
} from 'lucide-react';

export default function IncidentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [incident, setIncident] = useState<Incident | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<IncidentAttachment[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [finalReport, setFinalReport] = useState('');
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);

  useEffect(() => {
    fetchIncident();
  }, [id]);

  const fetchIncident = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await incidentService.getById(id!);
      if (response.success && response.data) {
        setIncident(response.data);
        setAttachments(response.data.attachments || []);
        setFinalReport(response.data.finalReport || '');
      }
    } catch (error) {
      console.error('Error fetching incident:', error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const handleAddComment = useCallback(async () => {
    if (!newComment.trim()) return;
    try {
      setIsSubmitting(true);
      await incidentService.addTimeline(id!, { comment: newComment, isInternal });
      setNewComment('');
      setIsInternal(false);
      fetchIncident();
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [newComment, isInternal, id, fetchIncident]);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      setUploadingFiles(true);
      const response = await uploadService.uploadIncidentFiles(id!, Array.from(files));
      if (response.success) {
        setAttachments(prev => [...response.data, ...prev]);
        fetchIncident();
      }
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setUploadingFiles(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [id, fetchIncident]);

  const handleDeleteFile = useCallback(async (attachmentId: string) => {
    if (!confirm('¿Eliminar este archivo?')) return;
    try {
      await uploadService.deleteAttachment(attachmentId);
      setAttachments(prev => prev.filter(a => a.id !== attachmentId));
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }, []);

  const handleReceive = useCallback(async () => {
    try {
      setIsSubmitting(true);
      await incidentService.receive(id!);
      fetchIncident();
    } catch (error) {
      console.error('Error receiving incident:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [id, fetchIncident]);

  const handleEscalateToGerente = useCallback(async () => {
    try {
      setIsSubmitting(true);
      await incidentService.escalate(id!, {
        assignedToId: incident?.assignedToId || user?.id || '',
        comment: 'Escalado a Gerente de Seguridad para revisión',
        escalateTo: 'GERENTE',
      });
      fetchIncident();
    } catch (error) {
      console.error('Error escalating to gerente:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [id, incident?.assignedToId, user?.id, fetchIncident]);

  const handleCloseIncident = useCallback(async () => {
    if (!finalReport.trim()) {
      alert('El informe final es obligatorio para cerrar el incidente');
      return;
    }
    try {
      setIsSubmitting(true);
      await incidentService.close(id!, { finalReport });
      setCloseDialogOpen(false);
      fetchIncident();
    } catch (error) {
      console.error('Error closing incident:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [finalReport, id, fetchIncident]);

  const handleAIAnalysis = useCallback(async () => {
    try {
      setIsAnalyzingAI(true);
      const response = await api.post('/ai/analyze', { incidentId: id });
      if (response.data.success) {
        setAiRecommendation(response.data.data.recommendation);
        fetchIncident();
      }
    } catch (error) {
      console.error('Error analyzing with AI:', error);
      alert('Error al analizar con IA. Verifique que Ollama esté ejecutándose.');
    } finally {
      setIsAnalyzingAI(false);
    }
  }, [id, fetchIncident]);

  const getFileIcon = useCallback((mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="h-5 w-5 text-green-500" />;
    if (mimeType.startsWith('video/')) return <Video className="h-5 w-5 text-purple-500" />;
    if (mimeType.startsWith('audio/')) return <Music className="h-5 w-5 text-orange-500" />;
    return <FileText className="h-5 w-5 text-blue-500" />;
  }, []);

  const statusCode = incident?.status.code || '';

  const isCoordinador = useMemo(() => {
    return user?.role?.includes('COORDINADOR') || user?.role === 'GERENTE_SEGURIDAD' || user?.role === 'ADMIN';
  }, [user?.role]);

  const canReceive = useMemo(() => {
    return statusCode === 'ESCALATED' && isCoordinador;
  }, [statusCode, isCoordinador]);

  const canEscalateToGerente = useMemo(() => {
    return (statusCode === 'IN_PROGRESS' || statusCode === 'ESCALATED') && isCoordinador;
  }, [statusCode, isCoordinador]);

  const canClose = useMemo(() => {
    return (statusCode === 'IN_PROGRESS' || statusCode === 'ESCALATED') && isCoordinador;
  }, [statusCode, isCoordinador]);

  const canEdit = useMemo(() => {
    return statusCode !== 'CLOSED' && statusCode !== 'CANCELLED';
  }, [statusCode]);

  const handleCloseDialogOpenChange = useCallback((open: boolean) => {
    setCloseDialogOpen(open);
  }, []);

  const handleFinalReportChange = useCallback((value: string) => {
    setFinalReport(value);
  }, []);

  const handleInternalToggle = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setIsInternal(e.target.checked);
  }, []);

  const handleCommentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewComment(e.target.value);
  }, []);

  const closeAiRecommendation = useCallback(() => {
    setAiRecommendation(null);
  }, []);

  const handleFileInputClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">Incidente no encontrado</h3>
        <Button onClick={() => navigate('/incidents')} className="mt-4">
          Volver a incidentes
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/incidents')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {incident.title}
              <Badge className={getStatusColor(incident.status.code)}>{incident.status.name}</Badge>
              <Badge className={getPriorityColor(incident.priority)}>{incident.priority}</Badge>
            </h1>
            <p className="text-muted-foreground">
              {incident.incidentType.name} • {incident.installation.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" onClick={handleAIAnalysis} disabled={isAnalyzingAI} size="sm">
            <Sparkles className={`mr-2 h-4 w-4 ${isAnalyzingAI ? 'animate-spin' : ''}`} />
            {isAnalyzingAI ? 'Analizando...' : 'Análisis IA'}
          </Button>

          {canReceive && (
            <Button size="sm" onClick={handleReceive} disabled={isSubmitting}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Recibir Incidente
            </Button>
          )}

          {canEscalateToGerente && (
            <Button variant="outline" size="sm" onClick={handleEscalateToGerente} disabled={isSubmitting}>
              <ArrowUp className="mr-2 h-4 w-4" />
              Escalar a Gerente
            </Button>
          )}

          {canClose && (
            <CloseIncidentDialog
              open={closeDialogOpen}
              onOpenChange={handleCloseDialogOpenChange}
              finalReport={finalReport}
              onFinalReportChange={handleFinalReportChange}
              onClose={handleCloseIncident}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">Flujo de Gestión:</span>
        </div>
        <div className="flex items-center gap-1 text-sm">
          <Badge variant="outline" className={statusCode === 'OPEN' ? 'bg-orange-100 border-orange-300' : ''}>
            1. Abierto (Minuta)
          </Badge>
          <span>→</span>
          <Badge variant="outline" className={statusCode === 'VERIFIED' ? 'bg-green-100 border-green-300' : ''}>
            2. Verificado (Minuta)
          </Badge>
          <span>→</span>
          <Badge variant="outline" className={statusCode === 'ESCALATED' ? 'bg-purple-100 border-purple-300' : ''}>
            3. Escalado (Incidentes)
          </Badge>
          <span>→</span>
          <Badge variant="outline" className={statusCode === 'IN_PROGRESS' ? 'bg-yellow-100 border-yellow-300' : ''}>
            4. En Investigación
          </Badge>
          <span>→</span>
          <Badge variant="outline" className={statusCode === 'CLOSED' ? 'bg-green-100 border-green-300' : ''}>
            5. Cerrado
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del Incidente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Tipo</Label>
                  <p className="font-medium">{incident.incidentType.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Instalación</Label>
                  <p className="font-medium">{incident.installation.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Reportado Por</Label>
                  <p className="font-medium">{incident.reportedBy}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Fecha de Creación</Label>
                  <p className="font-medium">{formatDateTime(incident.createdAt)}</p>
                </div>
                {incident.location && (
                  <div>
                    <Label className="text-muted-foreground">Ubicación</Label>
                    <p className="font-medium flex items-center gap-1">
                      <MapPin className="h-4 w-4" /> {incident.location}
                    </p>
                  </div>
                )}
                {incident.assignedTo && (
                  <div>
                    <Label className="text-muted-foreground">Asignado A</Label>
                    <p className="font-medium flex items-center gap-1">
                      <UserIcon className="h-4 w-4" /> {incident.assignedTo.name} {incident.assignedTo.lastName}
                    </p>
                  </div>
                )}
              </div>
              <div>
                <Label className="text-muted-foreground">Descripción</Label>
                <p className="mt-1 p-3 bg-gray-50 rounded-md">{incident.description}</p>
              </div>
            </CardContent>
          </Card>

          {aiRecommendation && (
            <Card className="border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-700">
                  <Sparkles className="h-5 w-5" />
                  Recomendación de IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm">{aiRecommendation}</p>
                <Button variant="ghost" size="sm" onClick={closeAiRecommendation} className="mt-2">
                  <X className="h-4 w-4 mr-1" /> Cerrar
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Bitácora / Timeline
                </CardTitle>
                <span className="text-sm text-muted-foreground">
                  {incident.timelines?.length || 0} comentarios
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-80 overflow-y-auto mb-4">
                {incident.timelines && incident.timelines.length > 0 ? (
                  incident.timelines.map((entry) => (
                    <div
                      key={entry.id}
                      className={`p-3 rounded-lg ${
                        entry.isInternal
                          ? 'bg-gray-100 border-l-4 border-gray-400'
                          : 'bg-blue-50 border-l-4 border-blue-500'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">
                          {entry.user.name} {entry.user.lastName}
                          <span className="text-muted-foreground ml-2">({entry.user.role})</span>
                        </span>
                        <div className="flex items-center gap-2">
                          {entry.isInternal && <Badge variant="secondary" className="text-xs">Interno</Badge>}
                          <span className="text-xs text-muted-foreground">{formatDateTime(entry.createdAt)}</span>
                        </div>
                      </div>
                      <p className="mt-1 text-sm">{entry.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">Sin comentarios</p>
                )}
              </div>

              {canEdit && (
                <div className="space-y-2 border-t pt-4">
                  <Textarea
                    placeholder="Agregar comentario..."
                    value={newComment}
                    onChange={handleCommentChange}
                    rows={2}
                  />
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={isInternal} onChange={handleInternalToggle} className="rounded" />
                      Marcar como interno
                    </label>
                    <Button onClick={handleAddComment} disabled={!newComment.trim() || isSubmitting} size="sm">
                      <Send className="mr-2 h-4 w-4" /> Agregar
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Paperclip className="h-5 w-5" />
                  Archivos Adjuntos
                </CardTitle>
                {canEdit && (
                  <div>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} multiple accept="image/*,video/*,audio/*,application/pdf" className="hidden" />
                    <Button variant="outline" size="sm" onClick={handleFileInputClick} disabled={uploadingFiles}>
                      <Upload className="mr-2 h-4 w-4" />
                      {uploadingFiles ? 'Subiendo...' : 'Adjuntar'}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {attachments.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No hay archivos</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {attachments.map((attachment) => (
                    <div key={attachment.id} className="p-3 border rounded-lg hover:bg-gray-50 group relative">
                      <div className="flex items-start gap-2">
                        {getFileIcon(attachment.mimeType)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{attachment.fileName}</p>
                          <p className="text-xs text-muted-foreground">{(attachment.fileSize! / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      {canEdit && (
                        <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => handleDeleteFile(attachment.id)}>
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detalles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Estado Actual</Label>
                <div className="mt-1">
                  <Badge className={getStatusColor(incident.status.code)}>{incident.status.name}</Badge>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Prioridad</Label>
                <div className="mt-1">
                  <Badge className={getPriorityColor(incident.priority)}>{incident.priority}</Badge>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Creado</Label>
                <p className="text-sm">{formatDateTime(incident.createdAt)}</p>
              </div>
              {incident.closedAt && (
                <>
                  <div>
                    <Label className="text-muted-foreground">Cerrado</Label>
                    <p className="text-sm">{formatDateTime(incident.closedAt)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Duración</Label>
                    <p className="text-sm">
                      {Math.ceil((new Date(incident.closedAt).getTime() - new Date(incident.createdAt).getTime()) / (1000 * 60 * 60 * 24))} días
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {incident.finalReport && (
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  Informe Final
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap font-mono bg-green-50 p-3 rounded">
                  {incident.finalReport}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
