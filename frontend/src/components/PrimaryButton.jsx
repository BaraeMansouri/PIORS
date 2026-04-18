import { motion } from 'framer-motion';

export default function PrimaryButton({ children, className = '', variant = 'primary', ...props }) {
  const variants = {
    primary: 'bg-gradient-to-r from-cyan to-neon text-white shadow-neon',
    secondary: 'bg-white/5 text-slate-100 border border-white/10',
    success: 'bg-gradient-to-r from-emerald to-cyan text-slate-950',
    danger: 'bg-gradient-to-r from-rose-500 to-red-500 text-white',
  };

  return (
    <motion.button
      type={props.type ?? 'button'}
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 font-semibold transition-all duration-300 hover:shadow-[0_0_30px_rgba(57,208,255,0.35)] ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
