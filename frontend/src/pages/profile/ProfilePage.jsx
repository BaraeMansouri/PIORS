import { useMemo, useState } from 'react';
import { FiCamera, FiMail, FiMapPin, FiPhone, FiSave, FiUser } from 'react-icons/fi';
import GlassCard from '../../components/GlassCard';
import InputField from '../../components/InputField';
import PrimaryButton from '../../components/PrimaryButton';
import SectionHeader from '../../components/SectionHeader';
import { useAuth } from '../../context/AuthContext';

export default function ProfilePage() {
  const { user, updateProfile, loading } = useAuth();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    city: user?.city ?? 'Casablanca',
    phone: user?.phone ?? '',
    address: user?.address ?? '',
    bio: user?.bio ?? 'Profil PIORS optimise pour la soutenance et la demonstration.',
    avatar: user?.avatar ?? '',
    avatarFile: null,
  });

  const initials = useMemo(() => form.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(), [form.name]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((prev) => ({ ...prev, avatar: String(reader.result), avatarFile: file }));
    reader.readAsDataURL(file);
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const payload = new FormData();
      payload.append('name', form.name);
      payload.append('email', form.email);
      payload.append('city', form.city);
      payload.append('phone', form.phone);
      payload.append('address', form.address);
      payload.append('bio', form.bio);
      if (form.avatarFile) payload.append('avatar', form.avatarFile);

      const updated = await updateProfile(payload);
      setForm((prev) => ({ ...prev, avatar: updated.avatar ?? prev.avatar, avatarFile: null }));
      setMessage('Profil mis a jour avec succes.');
      setTimeout(() => setMessage(''), 2500);
    } catch (submitError) {
      setError(submitError.response?.data?.message || submitError.message || 'Mise a jour du profil impossible.');
    }
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Profil"
        title="Mon espace personnel"
        subtitle="Modification rapide des informations, photo de profil et presentation publique pour la plateforme."
      />
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <GlassCard className="p-6">
          <div className="flex flex-col items-center text-center">
            {form.avatar ? (
              <img src={form.avatar} alt={form.name} className="h-40 w-40 rounded-[32px] object-cover shadow-glow" />
            ) : (
              <div className="flex h-40 w-40 items-center justify-center rounded-[32px] bg-gradient-to-br from-cyan to-neon font-display text-5xl font-bold text-white shadow-glow">
                {initials}
              </div>
            )}
            <label className="ui-control mt-5 inline-flex cursor-pointer items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold">
              <FiCamera /> Changer la photo
              <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
            </label>
            <h3 className="ui-title mt-6 font-display text-2xl font-semibold">{form.name}</h3>
            <p className="ui-muted mt-2 text-sm uppercase tracking-[0.28em]">{user?.role}</p>
            <div className="mt-6 grid w-full gap-3">
              <div className="ui-soft rounded-2xl p-4 text-left">
                <p className="ui-muted text-xs uppercase tracking-[0.25em]">Classe</p>
                <p className="ui-title mt-2 font-semibold">{user?.className || 'A definir'}</p>
              </div>
              <div className="ui-soft rounded-2xl p-4 text-left">
                <p className="ui-muted text-xs uppercase tracking-[0.25em]">Filiere</p>
                <p className="ui-title mt-2 font-semibold">{user?.filiere || 'A definir'}</p>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <form className="grid gap-5 md:grid-cols-2" onSubmit={submit}>
            <InputField className="md:col-span-2" label="Nom complet" name="name" value={form.name} onChange={handleChange} icon={FiUser} />
            <InputField label="Email" name="email" value={form.email} onChange={handleChange} icon={FiMail} />
            <InputField label="Ville" name="city" value={form.city} onChange={handleChange} icon={FiMapPin} />
            <InputField label="Telephone" name="phone" value={form.phone} onChange={handleChange} icon={FiPhone} />
            <InputField className="md:col-span-2" label="Adresse" name="address" value={form.address} onChange={handleChange} icon={FiMapPin} />
            <label className="md:col-span-2 block">
              <span className="ui-title mb-2 block text-sm font-medium">Presentation</span>
              <textarea
                name="bio"
                rows="5"
                value={form.bio}
                onChange={handleChange}
                className="ui-input min-h-[130px] w-full rounded-2xl px-4 py-3"
                placeholder="Parle de ton parcours, tes objectifs et tes competences..."
              />
            </label>
            <div className="md:col-span-2 flex flex-wrap items-center gap-3">
              <PrimaryButton type="submit" disabled={loading}><FiSave /> {loading ? 'Enregistrement...' : 'Sauvegarder le profil'}</PrimaryButton>
              {message ? <span className="text-sm font-semibold text-emerald">{message}</span> : null}
              {error ? <span className="text-sm font-semibold text-alert">{error}</span> : null}
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}
