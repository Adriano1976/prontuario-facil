import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, CheckCircle2, FileText } from 'lucide-react';

/**
 * Componente de diálogo para consentimento LGPD (Lei Geral de Proteção de Dados).
 * Exibe termos e condições que devem ser aceitos antes de usar o sistema.
 * Garante conformidade com regulamentos de proteção de dados.
 *
 * @component
 * @param {Object} props - Props do componente.
 * @param {boolean} props.open - Se o diálogo está visível.
 * @param {Function} props.onOpenChange - Callback para controlar visibilidade do diálogo.
 * @param {Function} props.onAccept - Callback quando usuário aceita os termos LGPD.
 * @returns {JSX.Element} - Diálogo modal com termos LGPD e checkbox de aceitação.
 *
 * @example
 * const [consentAberto, setConsentAberto] = useState(false);
 * <LGPDConsent
 *   open={consentAberto}
 *   onOpenChange={setConsentAberto}
 *   onAccept={() => salvarPreferenciasConsentimento()}
 * />
 */
export default function LGPDConsent({ open, onOpenChange, onAccept }) {
    const [accepted, setAccepted] = useState(false);

    const handleAccept = () => {
        if (accepted) {
            onAccept();
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh]">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center">
                            <Shield className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl">Termo de Consentimento LGPD</DialogTitle>
                            <DialogDescription>Lei Geral de Proteção de Dados - Lei nº 13.709/2018</DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4 text-sm text-slate-600">
                        <section>
                            <h3 className="font-semibold text-slate-900 mb-2">1. IDENTIFICAÇÃO DO CONTROLADOR</h3>
                            <p>A clínica médica, na qualidade de controladora de dados pessoais, compromete-se a proteger os dados pessoais coletados de seus pacientes, em conformidade com a Lei Geral de Proteção de Dados (LGPD).</p>
                        </section>

                        <section>
                            <h3 className="font-semibold text-slate-900 mb-2">2. DADOS COLETADOS</h3>
                            <p>Serão coletados os seguintes dados pessoais:</p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>Dados de identificação: nome completo, CPF, data de nascimento, gênero</li>
                                <li>Dados de contato: endereço, telefone, e-mail</li>
                                <li>Dados de saúde: histórico médico, exames, diagnósticos, prescrições</li>
                                <li>Dados de convênio: número da carteirinha, operadora</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="font-semibold text-slate-900 mb-2">3. FINALIDADE DO TRATAMENTO</h3>
                            <p>Os dados serão utilizados para:</p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>Prestação de serviços de saúde e atendimento médico</li>
                                <li>Elaboração de prontuário eletrônico</li>
                                <li>Emissão de receitas, atestados e documentos médicos</li>
                                <li>Comunicação sobre consultas e tratamentos</li>
                                <li>Cumprimento de obrigações legais e regulatórias</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="font-semibold text-slate-900 mb-2">4. COMPARTILHAMENTO DE DADOS</h3>
                            <p>Os dados poderão ser compartilhados com:</p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>Operadoras de planos de saúde (para faturamento)</li>
                                <li>Laboratórios e clínicas de diagnóstico (quando necessário)</li>
                                <li>Órgãos públicos de saúde (quando exigido por lei)</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="font-semibold text-slate-900 mb-2">5. DIREITOS DO TITULAR</h3>
                            <p>O paciente tem direito a:</p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>Confirmar a existência de tratamento de seus dados</li>
                                <li>Acessar seus dados pessoais</li>
                                <li>Corrigir dados incompletos ou desatualizados</li>
                                <li>Solicitar a anonimização ou eliminação de dados desnecessários</li>
                                <li>Revogar o consentimento a qualquer momento</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="font-semibold text-slate-900 mb-2">6. ARMAZENAMENTO E SEGURANÇA</h3>
                            <p>Os dados serão armazenados em ambiente seguro, com criptografia e controle de acesso, pelo prazo mínimo de 20 anos conforme resolução CFM nº 1.821/2007, ou pelo prazo necessário ao cumprimento de obrigações legais.</p>
                        </section>

                        <section>
                            <h3 className="font-semibold text-slate-900 mb-2">7. CONSENTIMENTO</h3>
                            <p>Ao aceitar este termo, o paciente declara que leu, compreendeu e concorda com o tratamento de seus dados pessoais conforme descrito acima.</p>
                        </section>
                    </div>
                </ScrollArea>

                <div className="border-t pt-4">
                    <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                        <Checkbox 
                            id="consent" 
                            checked={accepted} 
                            onCheckedChange={setAccepted}
                            className="mt-0.5"
                        />
                        <label htmlFor="consent" className="text-sm text-slate-700 cursor-pointer">
                            Declaro que li e compreendi o Termo de Consentimento para Tratamento de Dados Pessoais acima e <strong>AUTORIZO</strong> a coleta, uso, armazenamento e compartilhamento dos meus dados pessoais e de saúde conforme descrito.
                        </label>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleAccept} 
                        disabled={!accepted}
                        className="bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-600 hover:to-emerald-600"
                    >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Aceitar e Continuar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
