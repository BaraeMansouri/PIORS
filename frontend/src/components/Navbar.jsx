import { Link } from 'react-router-dom';
import { FiMail, FiMenu, FiSearch } from 'react-icons/fi';
import NotificationDropdown from './NotificationDropdown';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

export default function Navbar({ onToggleSidebar, notifications = [], onApproveNotification, onReadNotification }) {
  const { user } = useAuth();

  return (
    <header className="glass-panel sticky top-0 z-20 mb-6 flex items-center justify-between rounded-[28px] px-4 py-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button type="button" onClick={onToggleSidebar} className="ui-control rounded-2xl p-3 lg:hidden">
          <FiMenu />
        </button>
        <div className="ui-soft hidden items-center gap-3 rounded-2xl px-4 py-3 md:flex">
          <FiSearch className="text-cyan" />
          <input className="ui-input w-64 border-0 bg-transparent px-0 py-0 text-sm outline-none placeholder:!text-slate-500" placeholder="Recherche intelligente..." />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <button type="button" className="ui-control rounded-2xl p-3">
          <FiMail />
        </button>
        <NotificationDropdown items={notifications} onApprove={onApproveNotification} onRead={onReadNotification} />
        <Link to="/profile" className="ui-soft flex items-center gap-3 rounded-2xl px-3 py-2">
          <img src={user?.avatar} alt={user?.name} className="h-10 w-10 rounded-2xl object-cover" />
          <div className="hidden text-left md:block">
            <p className="ui-title text-sm font-semibold">{user?.name}</p>
            <p className="ui-muted text-xs uppercase tracking-[0.25em]">{user?.role}</p>
          </div>
        </Link>
      </div>
    </header>
  );
}
