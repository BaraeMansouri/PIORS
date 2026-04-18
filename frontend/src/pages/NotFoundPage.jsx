import { Link } from 'react-router-dom';
import PrimaryButton from '../components/PrimaryButton';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-panel max-w-lg rounded-[32px] p-8 text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan/80">404</p>
        <h1 className="mt-4 font-display text-4xl font-semibold text-white">Espace introuvable</h1>
        <p className="mt-4 text-slate-400">La route demandee n existe pas encore dans le cockpit PIORS.</p>
        <Link to="/login" className="mt-6 inline-block"><PrimaryButton>Retour a l accueil</PrimaryButton></Link>
      </div>
    </div>
  );
}