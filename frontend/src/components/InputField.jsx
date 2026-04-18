export default function InputField({ label, icon: Icon, error, className = '', ...props }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-medium text-slate-300">{label}</span>
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 focus-within:border-cyan/50 focus-within:bg-white/[0.08]">
        {Icon ? <Icon className="text-cyan" /> : null}
        <input className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" {...props} />
      </div>
      {error ? <span className="mt-2 block text-xs text-alert">{error}</span> : null}
    </label>
  );
}