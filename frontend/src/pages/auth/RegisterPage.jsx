import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiLock, FiMail, FiUser } from 'react-icons/fi';
import AuthLayout from '../../layouts/AuthLayout';
import GlassCard from '../../components/GlassCard';
import InputField from '../../components/InputField';
import PrimaryButton from '../../components/PrimaryButton';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPage() {
  const [values, setValues] = useState({ name: '', email: '', password: '', password_confirmation: '', role: 'stagiaire', device_name: 'frontend' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      const result = await register(values);
      setMessage(result.token
        ? 'Compte cree. Redirection vers ton espace...'
        : "Inscription envoyee. Attendez la validation de l'administrateur avant de vous connecter.");
      if (result.token) {
        setTimeout(() => navigate('/student', { replace: true }), 800);
      } else {
        setValues({ name: '', email: '', password: '', password_confirmation: '', role: 'stagiaire', device_name: 'frontend' });
      }
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      if (apiErrors) {
        const firstError = Object.values(apiErrors).flat()[0];
        setError(firstError || 'Creation du compte impossible.');
      } else {
        setError(err.response?.data?.message || err.message || 'Creation du compte impossible.');
      }
    }
  };

  return (
    <AuthLayout>
      <GlassCard className="w-full max-w-lg p-8">
        <p className="text-xs uppercase tracking-[0.35em] text-neon/80">Inscription</p>
        <h2 className="ui-title mt-4 font-display text-3xl font-semibold">Entrer dans l experience PIORS</h2>
        <form className="mt-8 grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
          <InputField className="md:col-span-2" label="Nom complet" name="name" value={values.name} onChange={handleChange} placeholder="Aya Benali" icon={FiUser} />
          <InputField className="md:col-span-2" label="Email" name="email" value={values.email} onChange={handleChange} placeholder="aya@exemple.com" icon={FiMail} />
          <InputField label="Mot de passe" name="password" type="password" value={values.password} onChange={handleChange} placeholder="********" icon={FiLock} error={error} />
          <InputField label="Confirmation" name="password_confirmation" type="password" value={values.password_confirmation} onChange={handleChange} placeholder="********" icon={FiLock} />
          <label className="md:col-span-2 block">
            <span className="ui-title mb-2 block text-sm font-medium">Role de demonstration</span>
            <select className="ui-input rounded-2xl px-4 py-3 text-sm" name="role" value={values.role} onChange={handleChange}>
              <option value="stagiaire">Stagiaire</option>
              <option value="formateur">Formateur</option>
            </select>
          </label>
          <PrimaryButton type="submit" className="md:col-span-2 w-full" disabled={loading}>{loading ? 'Inscription...' : 'Creer mon acces'}</PrimaryButton>
        </form>
        {message ? <p className="mt-4 text-sm text-emerald">{message}</p> : null}
        {error ? <p className="mt-4 text-sm text-alert">{error}</p> : null}
        <p className="ui-muted mt-6 text-sm">Deja inscrit ? <Link className="font-semibold text-cyan" to="/login">Se connecter</Link></p>
      </GlassCard>
    </AuthLayout>
  );
}
