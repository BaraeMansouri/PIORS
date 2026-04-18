import { AnimatePresence, motion } from 'framer-motion';
import { FiBell } from 'react-icons/fi';
import { useState } from 'react';
import PrimaryButton from './PrimaryButton';
import { useAuth } from '../context/AuthContext';

export default function NotificationDropdown({ items = [], onApprove, onRead }) {
  const [open, setOpen] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const { user } = useAuth();

  const approve = async (notification) => {
    if (!onApprove || !notification.context?.user_id) return;
    setBusyId(notification.id);
    await onApprove(notification);
    setBusyId(null);
  };

  const markRead = async (notification) => {
    if (!onRead) return;
    setBusyId(notification.id);
    await onRead(notification);
    setBusyId(null);
  };

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((prev) => !prev)} className="relative rounded-2xl border border-white/10 bg-white/5 p-3 text-slate-200">
        <FiBell />
        <span className="absolute -right-1 -top-1 rounded-full bg-cyan px-1.5 text-[10px] font-bold text-slate-950">{items.length}</span>
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="glass-panel absolute right-0 top-16 z-30 w-[320px] rounded-[24px] p-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="font-display text-lg font-semibold text-white">Notifications</h4>
              <button type="button" onClick={() => setOpen(false)} className="text-xs text-slate-400">Fermer</button>
            </div>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className={`rounded-2xl border p-3 ${item.unread ? 'border-cyan/20 bg-cyan/5' : 'border-white/8 bg-white/5'}`}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-white">{item.title}</p>
                    <span className="text-xs text-slate-500">{item.time}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-400">{item.message}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {user?.role === 'admin' && item.context?.type === 'account_validation' ? (
                      <PrimaryButton className="px-3 py-2 text-xs" onClick={() => approve(item)} disabled={busyId === item.id}>
                        {busyId === item.id ? 'Validation...' : 'Valider le compte'}
                      </PrimaryButton>
                    ) : null}
                    {item.unread ? (
                      <PrimaryButton variant="secondary" className="px-3 py-2 text-xs" onClick={() => markRead(item)} disabled={busyId === item.id}>
                        Marquer comme lu
                      </PrimaryButton>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
