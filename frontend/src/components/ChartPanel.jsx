import GlassCard from './GlassCard';

export default function ChartPanel({ title, subtitle, children, className = '' }) {
  return (
    <GlassCard className={`p-5 ${className}`}>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-xl font-semibold text-white">{title}</h3>
          {subtitle ? <p className="mt-1 text-sm text-slate-400">{subtitle}</p> : null}
        </div>
      </div>
      <div className="h-[280px]">{children}</div>
    </GlassCard>
  );
}