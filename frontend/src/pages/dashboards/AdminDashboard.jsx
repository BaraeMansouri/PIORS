import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend, ArcElement } from 'chart.js';
import { FiActivity, FiCpu, FiShield } from 'react-icons/fi';
import SectionHeader from '../../components/SectionHeader';
import StatsCard from '../../components/StatsCard';
import ChartPanel from '../../components/ChartPanel';
import GlassCard from '../../components/GlassCard';
import PrimaryButton from '../../components/PrimaryButton';
import DataTable from '../../components/DataTable';
import { dashboardService } from '../../services/dashboardService';
import { communityPosts } from '../../services/mockData';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend, ArcElement);

const moderationRows = communityPosts.map((post, index) => ({
  id: post.id,
  author: post.author.name,
  className: post.author.className,
  status: index === 0 ? 'Valide' : 'A surveiller',
  engagement: `${post.likes} likes`,
}));

export default function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    dashboardService.getDashboard('admin').then(setData);
  }, []);

  if (!data) return <div className="text-slate-300">Chargement du dashboard...</div>;

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Phase 3 - Dashboard Admin"
        title="Cockpit decisionnel premium"
        subtitle="Pilotage global des stagiaires, de la performance academique et de la moderation community avec une lecture visuelle forte."
        actions={<PrimaryButton>Exporter le reporting</PrimaryButton>}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.stats.map((item, index) => <StatsCard key={item.label} item={item} index={index} />)}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <ChartPanel title="Tendance de reussite" subtitle="Projection mensuelle du taux de reussite vs signaux de risque.">
          <Line data={data.charts.adminPerformance} options={{ maintainAspectRatio: false, plugins: { legend: { labels: { color: '#cbd5e1' } } }, scales: { x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }, y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } } } }} />
        </ChartPanel>
        <GlassCard className="space-y-4 p-5">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-neon/80">IA Insight</p>
            <h3 className="mt-2 font-display text-2xl font-semibold text-white">Centre d intelligence pedagogique</h3>
          </div>
          {[
            { icon: FiCpu, title: 'Orientation cible', text: `${data.ai.orientation.title} - confiance ${data.ai.orientation.confidence}%` },
            { icon: FiShield, title: 'Risque systemique', text: data.ai.risk.summary },
            { icon: FiActivity, title: 'Actions proposees', text: data.ai.risk.actions.join(' • ') },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.title} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-3">
                  <span className="rounded-2xl bg-cyan/10 p-3 text-cyan"><Icon /></span>
                  <div>
                    <p className="font-semibold text-white">{card.title}</p>
                    <p className="mt-1 text-sm text-slate-400">{card.text}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </GlassCard>
      </div>

      <GlassCard className="p-5">
        <SectionHeader eyebrow="Moderation" title="Supervision Community" subtitle="Seules les donnees publiques sont exposees: identite, classe et filiere." />
        <DataTable
          columns={[
            { key: 'author', label: 'Auteur' },
            { key: 'className', label: 'Classe' },
            { key: 'engagement', label: 'Engagement' },
            { key: 'status', label: 'Statut', render: (value) => <span className={`rounded-full px-3 py-1 text-xs font-semibold ${value === 'Valide' ? 'bg-emerald/15 text-emerald' : 'bg-alert/15 text-rose-200'}`}>{value}</span> },
          ]}
          rows={moderationRows}
        />
      </GlassCard>
    </div>
  );
}