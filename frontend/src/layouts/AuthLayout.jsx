import { motion } from 'framer-motion';
import BackgroundScene from '../components/BackgroundScene';
import logoMark from '../assets/ofppt-logo.png';
import ThemeToggle from '../components/ThemeToggle';

export default function AuthLayout({ children }) {
  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-6 md:px-6">
      <BackgroundScene />
      <div className="relative z-10 mx-auto mb-4 flex max-w-7xl justify-end">
        <ThemeToggle />
      </div>
      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.section initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col justify-between rounded-[32px] border border-white/10 bg-aurora p-8 shadow-glow">
          <div>
            <div className="flex items-center gap-4">
              <div className="ui-logo-wrap flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 p-2">
                <img src={logoMark} alt="OFPPT" className="h-full w-full object-contain" />
              </div>
              <div>
                <p className="ui-title font-display text-2xl font-semibold">PIORS</p>
                <p className="text-xs uppercase tracking-[0.4em] text-cyan/80">Powered by OFPPT</p>
              </div>
            </div>
            <div className="mt-14 max-w-2xl">
              <p className="mb-3 text-xs uppercase tracking-[0.4em] text-cyan/70">Plateforme intelligente</p>
              <h1 className="ui-title font-display text-4xl font-semibold leading-tight md:text-6xl">
                Construisons une trajectoire <span className="text-shimmer">premium</span> pour la reussite des stagiaires.
              </h1>
              <p className="ui-muted mt-6 max-w-xl text-base md:text-lg">
                Dashboards immersifs, orientation assistee par IA, suivi pedagogique et experience community haut de gamme dans une seule interface.
              </p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ['Orientation IA', 'Quiz dynamique et recommandations'],
              ['Suivi premium', 'Notes, absences et progression'],
              ['Community safe', 'Profils publics sans donnees privees'],
            ].map(([title, subtitle]) => (
              <div key={title} className="ui-soft rounded-[26px] p-4 backdrop-blur-md">
                <p className="ui-title font-display text-lg font-semibold">{title}</p>
                <p className="ui-muted mt-2 text-sm">{subtitle}</p>
              </div>
            ))}
          </div>
        </motion.section>
        <div className="flex items-center justify-center">{children}</div>
      </div>
    </div>
  );
}