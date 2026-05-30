import { AnimatePresence, motion } from 'framer-motion';

export default function AnimatedModal({ open, title, children, onClose }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div initial={{ scale: 0.94, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.98, opacity: 0 }} className="glass-panel mx-auto my-4 flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col rounded-[28px] sm:my-8">
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-6">
              <h3 className="ui-title font-display text-xl font-semibold">{title}</h3>
              <button type="button" onClick={onClose} className="ui-control shrink-0 rounded-full px-3 py-1 text-sm">Fermer</button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
              {children}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
