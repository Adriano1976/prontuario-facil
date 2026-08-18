import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { 
    Plus, 
    FileText, 
    Edit, 
    Trash2, 
    ArrowLeft,
    Save,
    Loader2,
    Copy,
    Info
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

const TEMPLATE_TYPES = [
    { value: 'receita_simples', label: 'Receita Simples' },
    { value: 'receita_controlada', label: 'Receita Controlada' },
    { value: 'atestado', label: 'Atestado Médico' },
    { value: 'solicitacao_exame', label: 'Solicitação de Exame' },
    { value: 'encaminhamento', label: 'Encaminhamento' },
    { value: 'declaracao', label: 'Declaração' },
    { value: 'anamnese', label: 'Anamnese' },
];

const AVAILABLE_VARIABLES = [
    { var: '{PACIENTE_NOME}', desc: 'Nome completo do paciente' },
    { var: '{PACIENTE_CPF}', desc: 'CPF do paciente' },
    { var: '{DATA}', desc: 'Data atual (DD/MM/YYYY)' },
    { var: '{DATA_EXTENSO}', desc: 'Data por extenso' },
    { var: '{DIAS_AFASTAMENTO}', desc: 'Dias de afastamento (atestados)' },
];

export default function Templates() {
    const queryClient = useQueryClient();
    const [showEditor, setShowEditor] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [templateToDelete, setTemplateToDelete] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        type: 'receita_simples',
        content: '',
        is_default: false,
        is_active: true
    });

    const { data: templates, isLoading } = useQuery({
        queryKey: ['templates'],
        queryFn: () => base44.entities.Template.list('-created_date'),
    });

    const saveMutation = useMutation({
        mutationFn: async (data) => {
            if (editingTemplate) {
                await base44.entities.Template.update(editingTemplate.id, data);
            } else {
                await base44.entities.Template.create(data);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['templates'] });
            setShowEditor(false);
            setEditingTemplate(null);
            resetForm();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => base44.entities.Template.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['templates'] });
            setShowDeleteDialog(false);
            setTemplateToDelete(null);
        }
    });

    const resetForm = () => {
        setFormData({
            name: '',
            type: 'receita_simples',
            content: '',
            is_default: false,
            is_active: true
        });
    };

    const handleEdit = (template) => {
        setEditingTemplate(template);
        setFormData({
            name: template.name,
            type: template.type,
            content: template.content,
            is_default: template.is_default || false,
            is_active: template.is_active !== false
        });
        setShowEditor(true);
    };

    const handleDelete = (template) => {
        setTemplateToDelete(template);
        setShowDeleteDialog(true);
    };

    const insertVariable = (variable) => {
        setFormData(prev => ({
            ...prev,
            content: prev.content + variable
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        saveMutation.mutate(formData);
    };

    const groupedTemplates = templates?.reduce((acc, t) => {
        if (!acc[t.type]) acc[t.type] = [];
        acc[t.type].push(t);
        return acc;
    }, {}) || {};

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
                >
                    <div className="flex items-center gap-4">
                        <Link to={createPageUrl('Dashboard')}>
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                                <FileText className="h-8 w-8 text-violet-500" />
                                Templates
                            </h1>
                            <p className="text-slate-500 mt-1">Modelos de documentos editáveis</p>
                        </div>
                    </div>
                    <Button 
                        onClick={() => { resetForm(); setEditingTemplate(null); setShowEditor(true); }}
                        className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Template
                    </Button>
                </motion.div>

                {/* Template List */}
                {isLoading ? (
                    <div className="grid gap-4">
                        {[1,2,3].map(i => (
                            <Card key={i} className="p-6 animate-pulse">
                                <div className="h-6 bg-slate-200 rounded w-1/4 mb-4" />
                                <div className="h-4 bg-slate-200 rounded w-1/2" />
                            </Card>
                        ))}
                    </div>
                ) : templates?.length > 0 ? (
                    <div className="space-y-8">
                        {TEMPLATE_TYPES.map(type => {
                            const typeTemplates = groupedTemplates[type.value] || [];
                            if (typeTemplates.length === 0) return null;

                            return (
                                <motion.div
                                    key={type.value}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <h2 className="text-lg font-semibold text-slate-900 mb-4">{type.label}</h2>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {typeTemplates.map(template => (
                                            <Card key={template.id} className="hover:shadow-md transition-shadow">
                                                <CardContent className="p-5">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <FileText className="h-5 w-5 text-violet-500" />
                                                            <h3 className="font-semibold text-slate-900">{template.name}</h3>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {template.is_default && (
                                                                <Badge className="bg-violet-100 text-violet-700">Padrão</Badge>
                                                            )}
                                                            {!template.is_active && (
                                                                <Badge variant="outline" className="text-slate-500">Inativo</Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                                                        {template.content?.substring(0, 150)}...
                                                    </p>
                                                    <div className="flex gap-2">
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm"
                                                            onClick={() => handleEdit(template)}
                                                        >
                                                            <Edit className="h-4 w-4 mr-1" />
                                                            Editar
                                                        </Button>
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm"
                                                            className="text-rose-600 hover:bg-rose-50"
                                                            onClick={() => handleDelete(template)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    <Card className="p-12 text-center">
                        <FileText className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhum template criado</h3>
                        <p className="text-slate-500 mb-6">Crie templates para agilizar a emissão de documentos</p>
                        <Button onClick={() => setShowEditor(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Criar Primeiro Template
                        </Button>
                    </Card>
                )}
            </div>

            {/* Editor Dialog */}
            <Dialog open={showEditor} onOpenChange={setShowEditor}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingTemplate ? 'Editar Template' : 'Novo Template'}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Nome do Template *</Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ex: Atestado Padrão"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Tipo *</Label>
                                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {TEMPLATE_TYPES.map(t => (
                                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Variables Helper */}
                        <div className="p-4 bg-slate-50 rounded-xl">
                            <div className="flex items-center gap-2 mb-3">
                                <Info className="h-4 w-4 text-slate-500" />
                                <span className="text-sm font-medium text-slate-700">Variáveis disponíveis</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <TooltipProvider>
                                    {AVAILABLE_VARIABLES.map(v => (
                                        <Tooltip key={v.var}>
                                            <TooltipTrigger asChild>
                                                <Button 
                                                    type="button"
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => insertVariable(v.var)}
                                                    className="text-xs"
                                                >
                                                    <Copy className="h-3 w-3 mr-1" />
                                                    {v.var}
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{v.desc}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    ))}
                                </TooltipProvider>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Conteúdo do Template *</Label>
                            <Textarea
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                placeholder="Digite o conteúdo do template. Use as variáveis acima para campos dinâmicos."
                                rows={12}
                                className="font-mono text-sm"
                                required
                            />
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <Switch 
                                    id="is_default"
                                    checked={formData.is_default}
                                    onCheckedChange={(checked) => setFormData({ ...formData, is_default: checked })}
                                />
                                <Label htmlFor="is_default">Template padrão</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch 
                                    id="is_active"
                                    checked={formData.is_active}
                                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                                />
                                <Label htmlFor="is_active">Ativo</Label>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowEditor(false)}>
                                Cancelar
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={saveMutation.isPending}
                                className="bg-gradient-to-r from-violet-500 to-purple-500"
                            >
                                {saveMutation.isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Salvando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Salvar
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir template?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir "{templateToDelete?.name}"? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={() => deleteMutation.mutate(templateToDelete?.id)}
                            className="bg-rose-600 hover:bg-rose-700"
                        >
                            Excluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
