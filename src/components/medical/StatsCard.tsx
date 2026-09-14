import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

/**
 * Cartão de estatística com ícone e tendência opcional.
 *
 * PARIDADE: comportamento e aparência idênticos ao componente anterior. A conversão é
 * de linguagem e de tipos; nenhuma regra nem texto mudou.
 */

/** Esquemas de cor aceitos. */
type StatsColor = 'sky' | 'emerald' | 'violet' | 'amber' | 'rose';

interface StatsCardProps {
  /** Título do cartão, por exemplo "Total de Pacientes". */
  title: string;
  /** Valor principal exibido. */
  value: number | string;
  /** Ícone exibido no canto. */
  icon: LucideIcon;
  /** Esquema de cor do ícone. */
  color: StatsColor;
  /** Tendência percentual; quando presente, aparece em verde (positiva) ou vermelho. */
  trend?: number;
  /** Atraso da animação, em segundos. */
  delay?: number;
}

const colorClasses: Record<StatsColor, string> = {
  sky: 'from-sky-500 to-sky-600 shadow-sky-500/25',
  emerald: 'from-emerald-500 to-emerald-600 shadow-emerald-500/25',
  violet: 'from-violet-500 to-violet-600 shadow-violet-500/25',
  amber: 'from-amber-500 to-amber-600 shadow-amber-500/25',
  rose: 'from-rose-500 to-rose-600 shadow-rose-500/25',
};

export default function StatsCard({
  title,
  value,
  icon: Icon,
  color,
  trend,
  delay = 0,
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-900">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 ${trend > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {trend > 0 ? '+' : ''}
              {trend}% este mês
            </p>
          )}
        </div>
        <div
          className={`h-12 w-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} shadow-lg flex items-center justify-center`}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </motion.div>
  );
}
