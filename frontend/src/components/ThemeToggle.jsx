import { FiMoon, FiSun } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { isLight, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="ui-control flex items-center gap-2 rounded-2xl px-3 py-3 text-sm font-semibold"
      aria-label="Changer le theme"
      title={isLight ? 'Passer en mode sombre' : 'Passer en mode clair'}
    >
      {isLight ? <FiMoon /> : <FiSun />}
      <span className="hidden md:inline">{isLight ? 'Sombre' : 'Clair'}</span>
    </button>
  );
}