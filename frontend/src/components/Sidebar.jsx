import { AnimatePresence, motion } from 'framer-motion';
import { FiBookOpen, FiBriefcase, FiCompass, FiGrid, FiHome, FiLogOut, FiMessageSquare, FiUsers, FiCalendar, FiUser } from 'react-icons/fi';
import { NavLink } from 'react-router-dom';
import logoMark from '../assets/ofppt-logo.png';
import { useAuth } from '../context/AuthContext';

const navByRole = {
  admin: [
    { to: '/admin', label: 'Dashboard', icon: FiHome },
    { to: '/courses', label: 'Cours', icon: FiBookOpen },
    { to: '/events', label: 'Events', icon: FiCalendar },
    { to: '/internships', label: 'Stages', icon: FiBriefcase },
    { to: '/community', label: 'Community', icon: FiUsers },
    { to: '/orientation', label: 'Orientation IA', icon: FiCompass },
    { to: '/profile', label: 'Profil', icon: FiUser },
  ],
  formateur: [
    { to: '/trainer', label: 'Dashboard', icon: FiHome },
    { to: '/courses', label: 'Cours', icon: FiBookOpen },
    { to: '/events', label: 'Events', icon: FiCalendar },
    { to: '/internships', label: 'Stages', icon: FiBriefcase },
    { to: '/community', label: 'Community', icon: FiUsers },
    { to: '/profile', label: 'Profil', icon: FiUser },
  ],
  stagiaire: [
    { to: '/student', label: 'Dashboard', icon: FiGrid },
    { to: '/courses', label: 'Cours', icon: FiBookOpen },
    { to: '/events', label: 'Events', icon: FiCalendar },
    { to: '/internships', label: 'Stages', icon: FiBriefcase },
    { to: '/community', label: 'Community', icon: FiUsers },
    { to: '/orientation', label: 'Orientation IA', icon: FiCompass },
    { to: '/profile', label: 'Profil', icon: FiUser },
  ],
};

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const items = navByRole[user?.role] ?? [];

  const content = (
    <div className="glass-panel flex h-full w-[290px] flex-col rounded-[30px] px-5 py-6">
      <div className="mb-8 flex items-center gap-3">
        <div className="ui-logo-wrap flex h-14 w-14 items-center justify-center rounded-2xl p-2">
          <img src={logoMark} alt="OFPPT" className="h-full w-full object-contain" />
        </div>
        <div>
          <p className="ui-title font-display text-xl font-semibold">PIORS</p>
          <p className="ui-muted text-xs uppercase tracking-[0.3em]">OFPPT intelligent success hub</p>
        </div>
      </div>
      <div className="ui-soft mb-6 rounded-[26px] p-4">
        <p className="ui-muted text-xs uppercase tracking-[0.3em]">Espace</p>
        <h2 className="ui-title mt-2 font-display text-2xl font-semibold">{user?.role}</h2>
        <p className="ui-muted mt-2 text-sm">Pilotage premium, fluide et pret pour la soutenance.</p>
      </div>
      <nav className="flex-1 space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) => `group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${isActive ? 'ui-nav-active' : 'ui-nav-idle'}`}
            >
              <Icon className="text-lg" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
      <div className="space-y-3 pt-4">
        <div className="rounded-2xl border border-cyan/20 bg-cyan/10 p-4">
          <div className="flex items-center gap-3">
            <FiMessageSquare className="text-cyan" />
            <div>
              <p className="ui-title text-sm font-semibold">Assistant PIORS AI</p>
              <p className="ui-muted text-xs">Disponible en bas a droite</p>
            </div>
          </div>
        </div>
        <button type="button" onClick={logout} className="ui-control flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold">
          <FiLogOut /> Deconnexion
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block">{content}</aside>
      <AnimatePresence>
        {open ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-slate-950/60 p-4 backdrop-blur-sm lg:hidden">
            <motion.div initial={{ x: -28, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -32, opacity: 0 }} className="h-full max-w-[290px]">
              {content}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}