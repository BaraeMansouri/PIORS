import { AnimatePresence, motion } from 'framer-motion';

export default function AnimatedModal({ open, title, children, onClose }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div initial={{ scale: 0.94, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.98, opacity: 0 }} className="glass-panel w-full max-w-xl rounded-[28px] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="ui-title font-display text-xl font-semibold">{title}</h3>
              <button type="button" onClick={onClose} className="ui-control rounded-full px-3 py-1 text-sm">Fermer</button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}