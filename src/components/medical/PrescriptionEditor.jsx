import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Pill, FileText, Save, Printer } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

const DOCUMENT_TYPES = [
    { value: 'receita_simples', label: 'Receita Simples' },
    { value: 'receita_controlada', label: 'Receita Controlada' },
    { value: 'atestado', label: 'Atestado Médico' },
    { value: 'solicitacao_exame', label: 'Solicitação de Exame' },
    { value: 'encaminhamento', label: 'Encaminhamento' },
    { value: 'declaracao', label: 'Declaração' },
];

/**
 * Componente para criação e edição de prescrições médicas.
 * Suporta múltiplos tipos de documentos (receitas, atestados, solicitações de exame).
 * Permite gerenciamento de medicações e seleção de templates.
 *
 * @component
 * @param {Object} props - Props do componente.
 * @param {boolean} props.open - Se o diálogo do editor está visível.
 * @param {Function} props.onOpenChange - Callback para controlar visibilidade do diálogo.
 * @param {Object} props.patient - Paciente para o qual prescrição está sendo criada.
 * @param {string} props.consultationId - ID da consulta associada.
 * @param {Function} props.onSave - Callback quando prescrição é salva com sucesso.
 * @param {Object} [props.initialData] - Dados pré-preenchidos para edição.
 * @param {string} [props.initialData.type] - Tipo de documento.
 * @param {string} [props.initialData.content] - Conteúdo do documento.
 * @param {Array<Object>} [props.initialData.medications] - Lista de medicações.
 * @param {number} [props.initialData.valid_days] - Validade da prescrição em dias.
 * @returns {JSX.Element} - Diálogo modal com formulário de editor de prescrição.
 *
 * @example
 * <PrescriptionEditor
 *   open={editorAberto}
 *   onOpenChange={setEditorAberto}
 *   patient={paciente}
 *   consultationId="consulta-123"
 *   onSave={() => atualizarPrescricoes()}
 * />
 */
export default function PrescriptionEditor({ 
    open, 
    onOpenChange, 
    patient, 
    consultationId, 
    onSave,
    initialData 
}) {
    const [type, setType] = useState('receita_simples');
    const [content, setContent] = useState('');
    const [medications, setMedications] = useState([]);
    const [validDays, setValidDays] = useState('');
    const [notes, setNotes] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState('');

    const { data: templates } = useQuery({
        queryKey: ['templates', type],
        queryFn: () => base44.entities.Template.filter({ type, is_active: true }),
        enabled: open,
    });

    useEffect(() => {
        if (initialData) {
            setType(initialData.type || 'receita_simples');
            setContent(initialData.content || '');
            setMedications(initialData.medications || []);
            setValidDays(initialData.valid_days?.toString() || '');
            setNotes(initialData.notes || '');
        } else {
            resetForm();
        }
    }, [initialData, open]);

    const resetForm = () => {
        setType('receita_simples');
        setContent('');
        setMedications([]);
        setValidDays('');
        setNotes('');
        setSelectedTemplate('');
    };

    const applyTemplate = (templateId) => {
        const template = templates?.find(t => t.id === templateId);
        if (template) {
            let processedContent = template.content;
            // Replace variables
            processedContent = processedContent.replace(/\{PACIENTE_NOME\}/g, patient?.full_name || '');
            processedContent = processedContent.replace(/\{PACIENTE_CPF\}/g, patient?.cpf || '');
            processedContent = processedContent.replace(/\{DATA\}/g, new Date().toLocaleDateString('pt-BR'));
            processedContent = processedContent.replace(/\{DATA_EXTENSO\}/g, new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }));
            setContent(processedContent);
            setSelectedTemplate(templateId);
        }
    };

    const addMedication = () => {
        setMedications([...medications, {
            name: '',
            dosage: '',
            frequency: '',
            duration: '',
            instructions: ''
        }]);
    };

    const updateMedication = (index, field, value) => {
        const updated = [...medications];
        updated[index][field] = value;
        setMedications(updated);
    };

    const removeMedication = (index) => {
        setMedications(medications.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        const data = {
            patient_id: patient?.id,
            consultation_id: consultationId,
            type,
            content,
            medications: type.includes('receita') ? medications : [],
            valid_days: type === 'atestado' ? parseInt(validDays) || null : null,
            notes,
            template_name: templates?.find(t => t.id === selectedTemplate)?.name || null
        };
        onSave(data);
        onOpenChange(false);
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>${DOCUMENT_TYPES.find(d => d.value === type)?.label || 'Documento'}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                        h1 { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; }
                        .content { white-space: pre-wrap; line-height: 1.6; }
                        .medications { margin-top: 20px; }
                        .med-item { margin-bottom: 15px; padding: 10px; border: 1px solid #ddd; }
                        .footer { margin-top: 40px; text-align: center; }
                        .signature { margin-top: 60px; border-top: 1px solid #000; width: 200px; margin-left: auto; margin-right: auto; padding-top: 5px; }
                    </style>
                </head>
                <body>
                    <h1>${DOCUMENT_TYPES.find(d => d.value === type)?.label || 'Documento'}</h1>
                    <p><strong>Paciente:</strong> ${patient?.full_name || ''}</p>
                    <p><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
                    <hr />
                    <div class="content">${content}</div>
                    ${medications.length > 0 ? `
                        <div class="medications">
                            <h3>Medicamentos:</h3>
                            ${medications.map(m => `
                                <div class="med-item">
                                    <strong>${m.name}</strong> - ${m.dosage}<br/>
                                    ${m.frequency} por ${m.duration}<br/>
                                    <em>${m.instructions}</em>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                    <div class="footer">
                        <div class="signature">Assinatura do Médico</div>
                        <p>CRM: ___________</p>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-sky-500" />
                        {initialData ? 'Editar Documento' : 'Novo Documento'}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Tipo de Documento</Label>
                            <Select value={type} onValueChange={setType}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {DOCUMENT_TYPES.map(dt => (
                                        <SelectItem key={dt.value} value={dt.value}>{dt.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Template</Label>
                            <Select value={selectedTemplate} onValueChange={applyTemplate}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecionar template..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {templates?.map(t => (
                                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {type === 'atestado' && (
                        <div className="space-y-2">
                            <Label>Dias de Afastamento</Label>
                            <Input 
                                type="number" 
                                value={validDays} 
                                onChange={(e) => setValidDays(e.target.value)}
                                placeholder="Ex: 3"
                                className="w-32"
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Conteúdo</Label>
                        <Textarea 
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Digite o conteúdo do documento..."
                            className="min-h-[150px]"
                        />
                    </div>

                    {type.includes('receita') && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="flex items-center gap-2">
                                    <Pill className="h-4 w-4" />
                                    Medicamentos
                                </Label>
                                <Button variant="outline" size="sm" onClick={addMedication}>
                                    <Plus className="h-4 w-4 mr-1" />
                                    Adicionar
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {medications.map((med, index) => (
                                    <Card key={index} className="p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="text-sm font-medium text-slate-500">Medicamento {index + 1}</span>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-8 w-8 text-rose-500"
                                                onClick={() => removeMedication(index)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <Input 
                                                placeholder="Nome do medicamento"
                                                value={med.name}
                                                onChange={(e) => updateMedication(index, 'name', e.target.value)}
                                            />
                                            <Input 
                                                placeholder="Dosagem (ex: 500mg)"
                                                value={med.dosage}
                                                onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                                            />
                                            <Input 
                                                placeholder="Frequência (ex: 8/8h)"
                                                value={med.frequency}
                                                onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                                            />
                                            <Input 
                                                placeholder="Duração (ex: 7 dias)"
                                                value={med.duration}
                                                onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                                            />
                                        </div>
                                        <Textarea 
                                            placeholder="Instruções especiais..."
                                            value={med.instructions}
                                            onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                                            className="mt-3"
                                            rows={2}
                                        />
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Observações</Label>
                        <Textarea 
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Observações adicionais..."
                            rows={2}
                        />
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={handlePrint}>
                        <Printer className="h-4 w-4 mr-2" />
                        Imprimir
                    </Button>
                    <Button onClick={handleSave} className="bg-gradient-to-r from-sky-500 to-emerald-500">
                        <Save className="h-4 w-4 mr-2" />
                        Salvar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
