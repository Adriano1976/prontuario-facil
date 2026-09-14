import { useState, useCallback } from 'react';
import type { ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Upload, FileImage, FileText, X, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { logAccess, ACCESS_ACTIONS } from './AccessLogger';
import type { ExamType, Patient } from '@/types';

/**
 * Envio de exame com anexo e metadados.
 *
 * PARIDADE: comportamento idêntico ao anterior. Continuam iguais: o envio só é
 * permitido com arquivo E nome preenchidos, a data já vem com o dia corrente, a
 * pré-visualização aparece apenas para imagem, o anexo é enviado antes da gravação, e
 * uma falha apenas registra no console sem fechar o diálogo nem limpar o formulário.
 */

const EXAM_TYPES: readonly { value: ExamType; label: string }[] = [
  { value: 'laboratorial', label: 'Laboratorial' },
  { value: 'imagem', label: 'Imagem (RX, TC, RM, US)' },
  { value: 'cardiologico', label: 'Cardiológico' },
  { value: 'outros', label: 'Outros' },
];

/** Dados que o exame precisa receber; o identificador é preenchido pelo servidor. */
interface ExamPayload {
  patient_id: string | undefined;
  consultation_id: string | null;
  name: string;
  type: ExamType;
  date: string;
  file_url: string;
  file_type: 'pdf' | 'image';
  laboratory: string;
  results_summary: string;
  notes: string;
}

interface ExamFormState {
  name: string;
  type: ExamType;
  date: string;
  laboratory: string;
  results_summary: string;
  notes: string;
}

interface ExamUploaderProps {
  /** Controla a visibilidade do diálogo. */
  open: boolean;
  /** Chamado quando a visibilidade muda. */
  onOpenChange: (open: boolean) => void;
  /** Paciente a quem o exame pertence. */
  patient?: Patient | null;
  /** Consulta associada, quando houver. */
  consultationId?: string | null;
  /** Chamado com os dados do exame para gravação. */
  onSave: (exam: ExamPayload) => Promise<void> | void;
}

const today = () => new Date().toISOString().split('T')[0];

const emptyForm = (): ExamFormState => ({
  name: '',
  type: 'laboratorial',
  date: today(),
  laboratory: '',
  results_summary: '',
  notes: '',
});

export default function ExamUploader({
  open,
  onOpenChange,
  patient,
  consultationId,
  onSave,
}: ExamUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<ExamFormState>(emptyForm);

  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);

      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => setPreview(event.target?.result as string);
        reader.readAsDataURL(selectedFile);
      } else {
        setPreview(null);
      }
    }
  }, []);

  const resetForm = () => {
    setFile(null);
    setPreview(null);
    setFormData(emptyForm());
  };

  const handleSubmit = async () => {
    if (!file || !formData.name) return;

    setIsUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      const examData: ExamPayload = {
        patient_id: patient?.id,
        consultation_id: consultationId || null,
        name: formData.name,
        type: formData.type,
        date: formData.date,
        file_url,
        file_type: file.type.includes('pdf') ? 'pdf' : 'image',
        laboratory: formData.laboratory,
        results_summary: formData.results_summary,
        notes: formData.notes,
      };

      await onSave(examData);
      await logAccess(
        ACCESS_ACTIONS.UPLOAD_EXAM,
        'Exam',
        null,
        patient?.full_name ?? null,
        `Exame: ${formData.name}`,
      );

      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error('Error uploading exam:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-sky-500" />
            Upload de Exame
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Área de seleção de arquivo */}
          <div
            className={`
                            border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer
                            ${
                              file
                                ? 'border-emerald-300 bg-emerald-50'
                                : 'border-slate-200 hover:border-sky-300 hover:bg-sky-50'
                            }
                        `}
            onClick={() => document.getElementById('exam-file')?.click()}
          >
            <input
              id="exam-file"
              type="file"
              accept=".pdf,image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {file ? (
              <div className="space-y-2">
                {preview ? (
                  <img src={preview} alt="Preview" className="max-h-32 mx-auto rounded-lg" />
                ) : (
                  <FileText className="h-12 w-12 mx-auto text-emerald-500" />
                )}
                <p className="text-sm font-medium text-slate-700">{file.name}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    setPreview(null);
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Remover
                </Button>
              </div>
            ) : (
              <>
                <div className="flex justify-center gap-4 mb-3">
                  <FileImage className="h-8 w-8 text-slate-400" />
                  <FileText className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-600 font-medium">Clique para selecionar arquivo</p>
                <p className="text-sm text-slate-400">PDF ou Imagem (máx. 10MB)</p>
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome do Exame *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Hemograma Completo"
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={formData.type}
                onValueChange={(v) => setFormData({ ...formData, type: v as ExamType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXAM_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data do Exame</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Laboratório/Clínica</Label>
              <Input
                value={formData.laboratory}
                onChange={(e) => setFormData({ ...formData, laboratory: e.target.value })}
                placeholder="Ex: Lab Análises"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Resumo dos Resultados</Label>
            <Textarea
              value={formData.results_summary}
              onChange={(e) => setFormData({ ...formData, results_summary: e.target.value })}
              placeholder="Principais achados do exame..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Observações adicionais..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!file || !formData.name || isUploading}
            className="bg-gradient-to-r from-sky-500 to-emerald-500"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Salvar Exame
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
