import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { resolveScope } from '@/api/sessionScope';
import { toSessionUser } from '@/lib/session';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Save,
  User,
  Phone,
  Mail,
  Heart,
  AlertTriangle,
  Shield,
  Loader2,
  Camera,
} from 'lucide-react';
import { motion } from 'framer-motion';
import LGPDConsent from '@/components/medical/LGPDConsent';
import { logAccess, ACCESS_ACTIONS } from '@/components/medical/AccessLogger';
import { useToast } from '@/components/ui/use-toast';
import type { BloodType, EntityStatus, Gender, Patient } from '@/types';
import type { WriteInput } from '@/api/registry';

/**
 * Cadastro e alteração de paciente.
 *
 * PARIDADE: comportamento, textos e validação idênticos ao anterior. Continuam iguais:
 * a máscara de CPF e de telefone, o carregamento do registro quando há identificador na
 * URL, a exigência de consentimento apenas no cadastro novo (a alteração não reexige), a
 * gravação da data e do endereço de rede do consentimento no momento do aceite, o envio
 * da foto antes de salvar, a invalidação da lista e o aviso de falha.
 *
 * PARIDADE DE LEITURA: a busca do registro passa a declarar o escopo de acesso — mesma
 * condição que a regra de acesso do servidor já aplicava.
 *
 * Nota sobre o consentimento: o endereço de rede é gravado como `'client-side'` porque
 * o navegador não tem acesso ao endereço real do cliente. É o valor que o sistema já
 * usava, e está registrado como pendência de codificação — não é corrigido aqui.
 */

const BLOOD_TYPES: readonly BloodType[] = [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
  'desconhecido',
];

const GENDERS: readonly { value: Gender; label: string }[] = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'feminino', label: 'Feminino' },
  { value: 'outro', label: 'Outro' },
  { value: 'prefiro_nao_informar', label: 'Prefiro não informar' },
];

/**
 * Estado do formulário.
 *
 * Os campos de consentimento são declarados aqui de forma aberta porque o formulário
 * começa sem consentimento e passa a tê-lo no aceite. O tipo do registro exige data e
 * endereço de rede QUANDO o consentimento é aceito — invariante verificado na gravação.
 */
interface PatientFormState {
  full_name: string;
  cpf: string;
  birth_date: string;
  gender: string;
  phone: string;
  email: string;
  address: string;
  emergency_contact: string;
  emergency_phone: string;
  health_insurance: string;
  insurance_number: string;
  blood_type: string;
  allergies: string;
  chronic_conditions: string;
  medications_in_use: string;
  notes: string;
  status: string;
  lgpd_consent: boolean;
  lgpd_consent_date: string | null;
  lgpd_consent_ip?: string;
  photo_url: string;
}

const estadoInicial = (): PatientFormState => ({
  full_name: '',
  cpf: '',
  birth_date: '',
  gender: '',
  phone: '',
  email: '',
  address: '',
  emergency_contact: '',
  emergency_phone: '',
  health_insurance: '',
  insurance_number: '',
  blood_type: 'desconhecido',
  allergies: '',
  chronic_conditions: '',
  medications_in_use: '',
  notes: '',
  status: 'ativo',
  lgpd_consent: false,
  lgpd_consent_date: null,
  photo_url: '',
});

/** Formata o CPF enquanto o usuário digita. */
function formatCPF(value: string): string {
  const numbers = value.replace(/\D/g, '');
  return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/** Formata o telefone enquanto o usuário digita. */
function formatPhone(value: string): string {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
}

export default function PatientForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const urlParams = new URLSearchParams(window.location.search);
  const patientId = urlParams.get('id');

  const [showLGPDConsent, setShowLGPDConsent] = useState(false);
  const [lgpdAccepted, setLgpdAccepted] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<PatientFormState>(estadoInicial);

  const { data: patient, isLoading: loadingPatient } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: async () => {
      const user = toSessionUser(await base44.auth.me());
      const scope = resolveScope(user);
      if (scope.kind === 'admin') {
        return base44.entities.Patient.filterAsAdmin(scope, { id: patientId ?? '' });
      }
      return base44.entities.Patient.filterOwned(scope, { id: patientId ?? '' });
    },
    enabled: !!patientId,
  });

  useEffect(() => {
    const registro = patient?.[0];
    if (registro) {
      setFormData(registro as unknown as PatientFormState);
      setLgpdAccepted(Boolean(registro.lgpd_consent));
      if (registro.photo_url) {
        setPhotoPreview(registro.photo_url);
      }
    }
  }, [patient]);

  const saveMutation = useMutation({
    mutationFn: async (data: PatientFormState) => {
      let photoUrl = formData.photo_url;
      if (photoFile) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: photoFile });
        photoUrl = file_url;
      }

      const saveData = { ...data, photo_url: photoUrl } as unknown as WriteInput<Patient>;

      if (patientId) {
        await base44.entities.Patient.update(patientId, saveData);
        await logAccess(ACCESS_ACTIONS.EDIT_PATIENT, 'Patient', patientId, data.full_name);
      } else {
        await base44.entities.Patient.create(saveData);
        await logAccess(ACCESS_ACTIONS.CREATE_PATIENT, 'Patient', null, data.full_name);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      navigate(createPageUrl('Patients'));
    },
    onError: (error: unknown) => {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message?: unknown }).message ?? '')
          : '';
      toast({
        variant: 'destructive',
        title: 'Não foi possível salvar o paciente',
        description: message || 'Verifique a conexão com o servidor e tente novamente.',
      });
    },
  });

  const handleChange = (field: keyof PatientFormState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (event) => setPhotoPreview(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleLGPDAccept = () => {
    setLgpdAccepted(true);
    setFormData((prev) => ({
      ...prev,
      lgpd_consent: true,
      lgpd_consent_date: new Date().toISOString(),
      lgpd_consent_ip: 'client-side',
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lgpdAccepted && !patientId) {
      setShowLGPDConsent(true);
      return;
    }
    saveMutation.mutate(formData);
  };

  if (loadingPatient && patientId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold text-slate-900">
            {patientId ? 'Editar Paciente' : 'Novo Paciente'}
          </h1>
          <p className="text-slate-500 mt-1">
            {patientId ? 'Atualize os dados do paciente' : 'Preencha a ficha completa do paciente'}
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Foto e dados básicos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-sky-500" />
                  Dados Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex flex-col items-center">
                    <div
                      className="relative h-32 w-32 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer overflow-hidden hover:border-sky-400 transition-colors"
                      onClick={() => document.getElementById('photo-input')?.click()}
                    >
                      {photoPreview ? (
                        <img
                          src={photoPreview}
                          alt="Foto"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Camera className="h-8 w-8 text-slate-400" />
                      )}
                    </div>
                    <input
                      id="photo-input"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <p className="text-xs text-slate-500 mt-2">Clique para adicionar foto</p>
                  </div>

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 space-y-2">
                      <Label>Nome Completo *</Label>
                      <Input
                        value={formData.full_name}
                        onChange={(e) => handleChange('full_name', e.target.value)}
                        placeholder="Nome completo do paciente"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>CPF *</Label>
                      <Input
                        value={formData.cpf}
                        onChange={(e) => handleChange('cpf', formatCPF(e.target.value))}
                        placeholder="000.000.000-00"
                        maxLength={14}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Data de Nascimento *</Label>
                      <Input
                        type="date"
                        value={formData.birth_date}
                        onChange={(e) => handleChange('birth_date', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Gênero</Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(v) => handleChange('gender', v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {GENDERS.map((g) => (
                            <SelectItem key={g.value} value={g.value}>
                              {g.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo Sanguíneo</Label>
                      <Select
                        value={formData.blood_type}
                        onValueChange={(v) => handleChange('blood_type', v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {BLOOD_TYPES.map((bt) => (
                            <SelectItem key={bt} value={bt}>
                              {bt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contato */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-emerald-500" />
                  Contato
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Telefone *</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', formatPhone(e.target.value))}
                      placeholder="(00) 00000-0000"
                      maxLength={15}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label>Endereço</Label>
                    <Input
                      value={formData.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      placeholder="Rua, número, bairro, cidade - UF"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Contato de Emergência</Label>
                    <Input
                      value={formData.emergency_contact}
                      onChange={(e) => handleChange('emergency_contact', e.target.value)}
                      placeholder="Nome do contato"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone de Emergência</Label>
                    <Input
                      value={formData.emergency_phone}
                      onChange={(e) => handleChange('emergency_phone', formatPhone(e.target.value))}
                      placeholder="(00) 00000-0000"
                      maxLength={15}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Convênio */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-violet-500" />
                  Convênio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Convênio Médico</Label>
                    <Input
                      value={formData.health_insurance}
                      onChange={(e) => handleChange('health_insurance', e.target.value)}
                      placeholder="Nome do convênio"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Número da Carteirinha</Label>
                    <Input
                      value={formData.insurance_number}
                      onChange={(e) => handleChange('insurance_number', e.target.value)}
                      placeholder="Número do plano"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Informações médicas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-rose-500" />
                  Informações Médicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    Alergias
                  </Label>
                  <Textarea
                    value={formData.allergies}
                    onChange={(e) => handleChange('allergies', e.target.value)}
                    placeholder="Liste todas as alergias conhecidas..."
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Condições Crônicas</Label>
                  <Textarea
                    value={formData.chronic_conditions}
                    onChange={(e) => handleChange('chronic_conditions', e.target.value)}
                    placeholder="Diabetes, hipertensão, etc..."
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Medicamentos em Uso Contínuo</Label>
                  <Textarea
                    value={formData.medications_in_use}
                    onChange={(e) => handleChange('medications_in_use', e.target.value)}
                    placeholder="Liste os medicamentos de uso contínuo..."
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Observações Gerais</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="Outras informações relevantes..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Aviso de consentimento */}
          {!patientId && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card
                className={`border-2 ${
                  lgpdAccepted
                    ? 'border-emerald-200 bg-emerald-50/50'
                    : 'border-amber-200 bg-amber-50/50'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Shield
                      className={`h-6 w-6 ${
                        lgpdAccepted ? 'text-emerald-500' : 'text-amber-500'
                      }`}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">
                        {lgpdAccepted
                          ? 'Consentimento LGPD aceito'
                          : 'Consentimento LGPD pendente'}
                      </p>
                      <p className="text-sm text-slate-600">
                        {lgpdAccepted
                          ? 'O paciente autorizou o tratamento de dados pessoais.'
                          : 'O termo de consentimento será exibido ao salvar.'}
                      </p>
                    </div>
                    {!lgpdAccepted && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowLGPDConsent(true)}
                      >
                        Ver Termo
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Ações */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex justify-end gap-4"
          >
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saveMutation.isPending}
              className="bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-600 hover:to-emerald-600"
            >
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Paciente
                </>
              )}
            </Button>
          </motion.div>
        </form>
      </div>

      <LGPDConsent
        open={showLGPDConsent}
        onOpenChange={setShowLGPDConsent}
        onAccept={handleLGPDAccept}
      />
    </div>
  );
}
