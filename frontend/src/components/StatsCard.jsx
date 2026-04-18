import { motion } from 'framer-motion';
import GlassCard from './GlassCard';

const tones = {
  cyan: 'from-cyan/35 to-transparent text-cyan',
  neon: 'from-neon/35 to-transparent text-violet-300',
  emerald: 'from-emerald/35 to-transparent text-emerald',
  alert: 'from-alert/35 to-transparent text-rose-300',
};

export default function StatsCard({ item, index = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}>
      <GlassCard className="relative overflow-hidden p-5">
        <div className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-b ${tones[item.tone]}`} />
        <div className="relative z-10 space-y-2">
          <span className="text-xs uppercase tracking-[0.32em] text-slate-400">{item.label}</span>
          <div className="font-display text-3xl font-bold text-white">{item.value}</div>
          <p className="text-sm font-medium text-slate-300">{item.trend}</p>
        </div>
      </GlassCard>
    </motion.div>
  );
}