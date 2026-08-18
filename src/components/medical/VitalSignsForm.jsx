import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Thermometer, Activity, Wind, Droplets, Scale, Ruler } from 'lucide-react';

/**
 * Componente para entrada e gerenciamento de sinais vitais (PA, FC, temperatura, etc).
 * Exibe um formulário com campos para todas as medições de sinais vitais com indicadores visuais.
 *
 * @component
 * @param {Object} props - Props do componente.
 * @param {Object} props.vitalSigns - Objeto contendo valores atuais dos sinais vitais.
 * @param {string} [props.vitalSigns.blood_pressure] - Leitura de pressão arterial (ex: '120/80').
 * @param {string} [props.vitalSigns.heart_rate] - Frequência cardíaca em bpm.
 * @param {string} [props.vitalSigns.temperature] - Temperatura corporal em Celsius.
 * @param {string} [props.vitalSigns.respiratory_rate] - Frequência respiratória em irpm.
 * @param {string} [props.vitalSigns.oxygen_saturation] - Percentual de SpO2.
 * @param {string} [props.vitalSigns.weight] - Peso do paciente em kg.
 * @param {string} [props.vitalSigns.height] - Altura do paciente em metros.
 * @param {Function} props.onChange - Callback quando qualquer sinal vital muda. Recebe objeto atualizado.
 * @returns {JSX.Element} - Formulário com campos de entrada de sinais vitais.
 *
 * @example
 * const [vitais, setVitais] = useState({});
 * <VitalSignsForm vitalSigns={vitais} onChange={setVitais} />
 */
export default function VitalSignsForm({ vitalSigns, onChange }) {
    const handleChange = (field, value) => {
        onChange({
            ...vitalSigns,
            [field]: value
        });
    };

    const fields = [
        { key: 'blood_pressure', label: 'Pressão Arterial', placeholder: '120/80 mmHg', icon: Activity },
        { key: 'heart_rate', label: 'Freq. Cardíaca', placeholder: '72 bpm', icon: Heart },
        { key: 'temperature', label: 'Temperatura', placeholder: '36.5 °C', icon: Thermometer },
        { key: 'respiratory_rate', label: 'Freq. Respiratória', placeholder: '16 irpm', icon: Wind },
        { key: 'oxygen_saturation', label: 'Saturação O₂', placeholder: '98%', icon: Droplets },
        { key: 'weight', label: 'Peso', placeholder: '70 kg', icon: Scale },
        { key: 'height', label: 'Altura', placeholder: '1.70 m', icon: Ruler },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {fields.map(({ key, label, placeholder, icon: Icon }) => (
                <div key={key} className="space-y-1.5">
                    <Label className="text-xs text-slate-500 flex items-center gap-1.5">
                        <Icon className="h-3.5 w-3.5" />
                        {label}
                    </Label>
                    <Input
                        value={vitalSigns?.[key] || ''}
                        onChange={(e) => handleChange(key, e.target.value)}
                        placeholder={placeholder}
                        className="h-9 text-sm"
                    />
                </div>
            ))}
        </div>
    );
}
