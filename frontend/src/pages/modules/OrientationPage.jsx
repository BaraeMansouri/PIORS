import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import SectionHeader from '../../components/SectionHeader';
import GlassCard from '../../components/GlassCard';
import PrimaryButton from '../../components/PrimaryButton';
import { aiRecommendations } from '../../services/mockData';

const questions = [
  { id: 'logic', title: 'Tu prefers resoudre des problemes complexes ?', options: [10, 20, 30] },
  { id: 'design', title: 'Tu aimes prototyper des interfaces modernes ?', options: [10, 20, 30] },
  { id: 'data', title: 'Tu aimes analyser des donnees et des tableaux ?', options: [10, 20, 30] },
];

export default function OrientationPage() {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState({});
  const current = questions[step];

  const total = useMemo(() => Object.values(scores).reduce((sum, value) => sum + value, 0), [scores]);
  const result = total >= 70 ? aiRecommendations.orientation : { title: 'UI / Communication Digitale', confidence: 76, reasons: ['Affinite forte pour la creation visuelle', 'Bonne sensibilite produit', 'Profil adapte aux experiences utilisateur'] };

  const answer = (value) => {
    const next = { ...scores, [current.id]: value };
    setScores(next);
    if (step < questions.length - 1) {
      setStep(step + 1);
    }
  };

  return (
    <div className="space-y-8">
      <SectionHeader eyebrow="Phase 6 - Orientation IA" title="Wizard d orientation intelligente" subtitle="Simulation frontend d un quiz dynamique avec resultat premium, recommandations et signaux de risque." />
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <GlassCard className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-neon/80">Quiz IA</p>
              <h3 className="mt-2 font-display text-2xl font-semibold text-white">{current ? current.title : 'Resultat final'}</h3>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">Etape {Math.min(step + 1, questions.length)} / {questions.length}</span>
          </div>
          {current ? (
            <div className="space-y-4">
              {[['Peu', 10], ['Moyennement', 20], ['Beaucoup', 30]].map(([label, value], index) => (
                <motion.button key={label} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.08 }} type="button" onClick={() => answer(value)} className="flex w-full items-center justify-between rounded-[24px] border border-white/10 bg-white/5 px-5 py-4 text-left text-white transition hover:border-cyan/40 hover:bg-white/[0.08]">
                  <span>{label}</span>
                  <span className="text-cyan">+{value}</span>
                </motion.button>
              ))}
            </div>
          ) : (
            <div className="space-y-5">
              <div className="rounded-[28px] border border-emerald/20 bg-emerald/10 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-emerald/80">Filiere recommandee</p>
                <h4 className="mt-3 font-display text-3xl font-semibold text-white">{result.title}</h4>
                <p className="mt-2 text-sm text-slate-300">Confiance {result.confidence}%</p>
              </div>
              {result.reasons.map((reason) => <div key={reason} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">{reason}</div>)}
              <PrimaryButton onClick={() => { setStep(0); setScores({}); }}>Recommencer le quiz</PrimaryButton>
            </div>
          )}
        </GlassCard>
        <GlassCard className="space-y-5 p-6">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-cyan/80">Analyse complementaire</p>
            <h3 className="mt-2 font-display text-2xl font-semibold text-white">Suggestions personnalisees</h3>
          </div>
          <div className="rounded-[24px] border border-alert/20 bg-alert/10 p-4">
            <p className="font-semibold text-white">Risque echec</p>
            <p className="mt-2 text-sm text-slate-300">Declenche si moyenne &lt; 10 ou absences &gt; seuil. Ici, la visualisation frontend montre le fonctionnement attendu.</p>
          </div>
          <div className="rounded-[24px] border border-cyan/20 bg-cyan/10 p-4">
            <p className="font-semibold text-white">Cours suggeres</p>
            <p className="mt-2 text-sm text-slate-300">React Experience Design, Architecture Laravel API et SQL Data Strategy.</p>
          </div>
          <div className="rounded-[24px] border border-neon/20 bg-neon/10 p-4">
            <p className="font-semibold text-white">Events & stages</p>
            <p className="mt-2 text-sm text-slate-300">Hackathon Orientation IA, Workshop Portfolio Elite, stage Frontend Engineer Intern.</p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}