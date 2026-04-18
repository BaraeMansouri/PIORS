import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import SectionHeader from '../../components/SectionHeader';
import StatsCard from '../../components/StatsCard';
import ChartPanel from '../../components/ChartPanel';
import GlassCard from '../../components/GlassCard';
import PrimaryButton from '../../components/PrimaryButton';
import { dashboardService } from '../../services/dashboardService';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function StudentDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    dashboardService.getDashboard('stagiaire').then(setData);
  }, []);

  if (!data) return <div className="text-slate-300">Chargement...</div>;

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Phase 3 - Dashboard Stagiaire"
        title="Tableau de bord personnel"
        subtitle="Vision claire de la progression, alertes de risque et recommandations intelligentes pour accelerer la reussite."
        actions={<PrimaryButton>Voir mon parcours IA</PrimaryButton>}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.stats.map((item, index) => <StatsCard key={item.label} item={item} index={index} />)}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <ChartPanel title="Progression academique" subtitle="Courbe de notes sur les dernieres sequences pedagogiques.">
          <Line data={data.charts.studentProgress} options={{ maintainAspectRatio: false, plugins: { legend: { labels: { color: '#cbd5e1' } } }, scales: { x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }, y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } } } }} />
        </ChartPanel>
        <GlassCard className="space-y-5 p-5">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-emerald/80">IA Coach</p>
            <h3 className="mt-2 font-display text-2xl font-semibold text-white">Recommandations instantanees</h3>
          </div>
          <div className="rounded-[24px] border border-emerald/20 bg-emerald/10 p-4">
            <p className="text-sm font-semibold text-white">Orientation suggeree</p>
            <p className="mt-2 text-2xl font-display font-semibold text-emerald">{data.ai.orientation.title}</p>
            <p className="mt-2 text-sm text-slate-300">Confiance {data.ai.orientation.confidence}%</p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-semibold text-white">Analyse de risque</p>
            <p className="mt-2 text-sm text-slate-400">{data.ai.risk.summary}</p>
          </div>
          <div className="space-y-3">
            {data.ai.risk.actions.map((action) => (
              <div key={action} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">{action}</div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}