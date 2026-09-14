import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart, Thermometer, Activity, Wind, Droplets, Scale, Ruler } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { VitalSigns } from '@/types';

/**
 * Entrada dos sinais vitais de uma consulta.
 *
 * PARIDADE: comportamento e aparência idênticos ao componente anterior. A conversão é
 * de linguagem e de tipos; nenhum campo, texto ou validação mudou.
 *
 * Nota de contrato: os valores são texto livre (o profissional digita "120/80"), não
 * números — o tipo dos sinais vitais reflete isso.
 */

interface VitalField {
  key: keyof VitalSigns;
  label: string;
  placeholder: string;
  icon: LucideIcon;
}

interface VitalSignsFormProps {
  /** Valores atuais dos sinais vitais. */
  vitalSigns?: VitalSigns;
  /** Chamado com o objeto completo sempre que um campo muda. */
  onChange: (next: VitalSigns) => void;
}

const fields: VitalField[] = [
  { key: 'blood_pressure', label: 'Pressão Arterial', placeholder: '120/80 mmHg', icon: Activity },
  { key: 'heart_rate', label: 'Freq. Cardíaca', placeholder: '72 bpm', icon: Heart },
  { key: 'temperature', label: 'Temperatura', placeholder: '36.5 °C', icon: Thermometer },
  { key: 'respiratory_rate', label: 'Freq. Respiratória', placeholder: '16 irpm', icon: Wind },
  { key: 'oxygen_saturation', label: 'Saturação O₂', placeholder: '98%', icon: Droplets },
  { key: 'weight', label: 'Peso', placeholder: '70 kg', icon: Scale },
  { key: 'height', label: 'Altura', placeholder: '1.70 m', icon: Ruler },
];

export default function VitalSignsForm({ vitalSigns, onChange }: VitalSignsFormProps) {
  const handleChange = (field: keyof VitalSigns, value: string) => {
    onChange({
      ...vitalSigns,
      [field]: value,
    });
  };

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
