import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiLock, FiMail } from 'react-icons/fi';
import AuthLayout from '../../layouts/AuthLayout';
import GlassCard from '../../components/GlassCard';
import InputField from '../../components/InputField';
import PrimaryButton from '../../components/PrimaryButton';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const [values, setValues] = useState({ email: 'admin@piors.test', password: 'password', device_name: 'frontend' });
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const resolvePath = (role) => {
    if (role === 'admin') return '/admin';
    if (role === 'formateur') return '/trainer';
    return '/student';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const result = await login(values);
      navigate(location.state?.from?.pathname ?? resolvePath(result.user.role), { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Connexion impossible. Verifie les identifiants ou le backend.');
    }
  };

  return (
    <AuthLayout>
      <GlassCard className="w-full max-w-md p-8">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan/80">Connexion</p>
        <h2 className="ui-title mt-4 font-display text-3xl font-semibold">Acces a ton cockpit intelligent</h2>
        <p className="ui-muted mt-3 text-sm">Utilise un compte seeded pour tester instantanement les espaces Admin, Formateur ou Stagiaire.</p>
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <InputField label="Adresse email" name="email" value={values.email} onChange={handleChange} placeholder="admin@piors.test" icon={FiMail} />
          <InputField label="Mot de passe" name="password" type="password" value={values.password} onChange={handleChange} placeholder="password" icon={FiLock} error={error} />
          <PrimaryButton type="submit" className="w-full" disabled={loading}>{loading ? 'Connexion...' : 'Se connecter'}</PrimaryButton>
        </form>
        <div className="ui-soft mt-6 rounded-2xl p-4 text-sm">
          <p className="ui-title font-semibold">Acces rapide</p>
          <p className="ui-muted mt-2">Admin: `admin@piors.test` / `password`</p>
          <p className="ui-muted">Formateur: `formateur@piors.test` / `password`</p>
          <p className="ui-muted">Stagiaire: `stagiaire@piors.test` / `password`</p>
        </div>
        <p className="ui-muted mt-6 text-sm">
          Nouveau compte ? <Link className="font-semibold text-cyan" to="/register">Creer un acces</Link>
        </p>
      </GlassCard>
    </AuthLayout>
  );
}
