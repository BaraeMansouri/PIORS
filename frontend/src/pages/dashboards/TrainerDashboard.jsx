import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import SectionHeader from '../../components/SectionHeader';
import StatsCard from '../../components/StatsCard';
import ChartPanel from '../../components/ChartPanel';
import GlassCard from '../../components/GlassCard';
import DataTable from '../../components/DataTable';
import PrimaryButton from '../../components/PrimaryButton';
import { dashboardService } from '../../services/dashboardService';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const learnerRows = [
  { id: 1, name: 'Aya Benali', className: 'DD 2026 A', average: '15.2', absence: '2', status: 'Excellent' },
  { id: 2, name: 'Youssef Lahbabi', className: 'DD 2026 A', average: '12.8', absence: '4', status: 'Stable' },
  { id: 3, name: 'Meryem Talbi', className: 'DD 2026 B', average: '9.7', absence: '8', status: 'Alerte' },
];

export default function TrainerDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    dashboardService.getDashboard('formateur').then(setData);
  }, []);

  if (!data) return <div className="text-slate-300">Chargement...</div>;

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Phase 3 - Dashboard Formateur"
        title="Suivi pedagogique augmente"
        subtitle="Visualisation des progres, saisie rapide des notes et priorisation des profils a accompagner."
        actions={<PrimaryButton variant="success">Publier un nouveau cours</PrimaryButton>}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.stats.map((item, index) => <StatsCard key={item.label} item={item} index={index} />)}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
        <ChartPanel title="Progression par module" subtitle="Lecture rapide de l avancee du groupe par competence.">
          <Bar data={data.charts.trainerProgress} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#94a3b8' }, grid: { display: false } }, y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } } } }} />
        </ChartPanel>
        <GlassCard className="p-5">
          <h3 className="font-display text-2xl font-semibold text-white">Plan d action immediate</h3>
          <div className="mt-5 space-y-4">
            {[
              ['Notes', 'Enregistrer les evaluations de la semaine avec une experience fluide.'],
              ['Absences', 'Identifier les profils qui depassent le seuil d alerte.'],
              ['Stages', 'Pousser les opportunites pertinentes vers les meilleurs profils.'],
            ].map(([title, description]) => (
              <div key={title} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <p className="font-semibold text-white">{title}</p>
                <p className="mt-2 text-sm text-slate-400">{description}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-5">
        <SectionHeader eyebrow="Etudiants" title="Liste priorisee" subtitle="Recherche, filtre et visualisation des progressions les plus sensibles." actions={<PrimaryButton variant="secondary">Saisir notes et absences</PrimaryButton>} />
        <DataTable
          columns={[
            { key: 'name', label: 'Stagiaire' },
            { key: 'className', label: 'Classe' },
            { key: 'average', label: 'Moyenne' },
            { key: 'absence', label: 'Absences' },
            { key: 'status', label: 'Statut', render: (value) => <span className={`rounded-full px-3 py-1 text-xs font-semibold ${value === 'Excellent' ? 'bg-emerald/15 text-emerald' : value === 'Stable' ? 'bg-cyan/15 text-cyan' : 'bg-alert/15 text-rose-200'}`}>{value}</span> },
          ]}
          rows={learnerRows}
        />
      </GlassCard>
    </div>
  );
}