import { useEffect, useState } from 'react';
import { FiBriefcase, FiEdit2, FiMapPin, FiPlus, FiTrash2 } from 'react-icons/fi';
import SectionHeader from '../../components/SectionHeader';
import GlassCard from '../../components/GlassCard';
import PrimaryButton from '../../components/PrimaryButton';
import { academicService } from '../../services/academicService';
import { useAuth } from '../../context/AuthContext';
import AnimatedModal from '../../components/AnimatedModal';
import InputField from '../../components/InputField';

const initialForm = { title: '', company: '', description: '', location: '', starts_at: '', ends_at: '', status: 'open', image: null };

export default function InternshipsPage() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [applyId, setApplyId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState(initialForm);
  const [motivation, setMotivation] = useState('');
  const { user } = useAuth();
  const canCreate = ['admin', 'formateur'].includes(user?.role);

  const load = async () => {
    try {
      setItems(await academicService.getInternships());
    } catch (loadError) {
      setError(loadError.response?.data?.message || 'Impossible de charger les stages.');
    }
  };

  useEffect(() => { load(); }, []);

  const flash = (setter, text) => {
    setter(text);
    window.setTimeout(() => setter(''), 2400);
  };

  const canManageInternship = (internship) => user?.role === 'admin' || String(internship.created_by) === String(user?.id);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const openEdit = (internship) => {
    setEditing(internship);
    setForm({
      title: internship.title ?? '',
      company: internship.company ?? '',
      description: internship.description ?? '',
      location: internship.location ?? '',
      starts_at: internship.starts_at ? new Date(internship.starts_at).toISOString().slice(0, 16) : '',
      ends_at: internship.ends_at ? new Date(internship.ends_at).toISOString().slice(0, 16) : '',
      status: internship.status ?? 'open',
      image: null,
    });
    setOpen(true);
  };

  const resetModal = () => {
    setOpen(false);
    setEditing(null);
    setForm(initialForm);
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      if (editing) {
        const payload = new FormData();
        payload.append('title', form.title);
        payload.append('company', form.company);
        payload.append('description', form.description);
        payload.append('location', form.location);
        payload.append('starts_at', form.starts_at);
        payload.append('ends_at', form.ends_at);
        payload.append('status', form.status);
        if (form.image) payload.append('image', form.image);
        await academicService.updateInternship(editing.id, payload);
        flash(setMessage, 'Stage modifie avec succes.');
      } else {
        const payload = new FormData();
        payload.append('title', form.title);
        payload.append('company', form.company);
        payload.append('description', form.description);
        payload.append('location', form.location);
        payload.append('starts_at', form.starts_at);
        payload.append('ends_at', form.ends_at);
        payload.append('status', form.status);
        if (form.image) payload.append('image', form.image);
        await academicService.createInternship(payload);
        flash(setMessage, 'Stage cree avec succes.');
      }

      resetModal();
      await load();
    } catch (submitError) {
      setError(submitError.response?.data?.message || 'Enregistrement du stage impossible.');
    }
  };

  const apply = async (event) => {
    event.preventDefault();

    try {
      setError('');
      await academicService.applyInternship(applyId, motivation);
      setApplyId(null);
      setMotivation('');
      flash(setMessage, 'Candidature envoyee avec succes.');
      await load();
    } catch (applyError) {
      setError(applyError.response?.data?.message || 'Candidature impossible.');
    }
  };

  const removeInternship = async (id) => {
    try {
      setError('');
      await academicService.deleteInternship(id);
      flash(setMessage, 'Stage supprime avec succes.');
      await load();
    } catch (deleteError) {
      setError(deleteError.response?.data?.message || 'Suppression du stage impossible.');
    }
  };

  return (
    <div className="space-y-8">
      <SectionHeader eyebrow="Phase 4 - Stages" title="Opportunites intelligentes" subtitle="Liste dynamique des offres avec postulation rapide et mise en avant des profils compatibles." actions={canCreate ? <PrimaryButton onClick={() => setOpen(true)}><FiPlus /> Publier une offre</PrimaryButton> : null} />
      {message ? <div className="rounded-2xl border border-emerald/20 bg-emerald/10 px-4 py-3 text-sm font-semibold text-emerald">{message}</div> : null}
      {error ? <div className="rounded-2xl border border-alert/20 bg-alert/10 px-4 py-3 text-sm font-semibold text-alert">{error}</div> : null}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {items.map((internship) => (
          <GlassCard key={internship.id} className="p-5">
            <div className="relative mb-5 h-48 overflow-hidden rounded-[24px]">
              <img src={internship.image} alt={internship.title} className="h-full w-full object-cover transition duration-500 hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/15 to-transparent" />
            </div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-cyan/80">{internship.company}</p>
                <h3 className="ui-title mt-3 font-display text-2xl font-semibold">{internship.title}</h3>
              </div>
              <span className="rounded-2xl bg-emerald/15 p-3 text-emerald"><FiBriefcase /></span>
            </div>
            <div className="ui-muted mt-5 space-y-3 text-sm">
              <p className="flex items-center gap-3"><FiMapPin className="text-cyan" /> {internship.location || 'Lieu a definir'}</p>
              <p>Duree : {internship.duration}</p>
              <p>Candidatures : {internship.applications_count}</p>
              <p className="leading-6">{internship.description}</p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {user?.role === 'stagiaire' ? (
                <PrimaryButton className="flex-1" disabled={internship.has_applied} onClick={() => setApplyId(internship.id)}>
                  {internship.has_applied ? 'Deja postule' : 'Postuler'}
                </PrimaryButton>
              ) : null}
              {canManageInternship(internship) ? (
                <>
                  <PrimaryButton variant="secondary" onClick={() => openEdit(internship)}><FiEdit2 /> Modifier</PrimaryButton>
                  <PrimaryButton variant="danger" onClick={() => removeInternship(internship.id)}><FiTrash2 /> Supprimer</PrimaryButton>
                </>
              ) : null}
            </div>
          </GlassCard>
        ))}
      </div>
      <AnimatedModal open={open} title={editing ? 'Modifier un stage' : 'Publier un stage'} onClose={resetModal}>
        <form className="space-y-4" onSubmit={submit}>
          <InputField label="Titre" name="title" value={form.title} onChange={handleChange} required />
          <InputField label="Entreprise" name="company" value={form.company} onChange={handleChange} required />
          <label className="block">
            <span className="ui-title mb-2 block text-sm font-medium">Description</span>
            <textarea name="description" value={form.description} onChange={handleChange} rows="4" className="ui-input rounded-2xl px-4 py-3" required />
          </label>
          <InputField label="Lieu" name="location" value={form.location} onChange={handleChange} />
          <InputField label="Debut" name="starts_at" type="datetime-local" value={form.starts_at} onChange={handleChange} />
          <InputField label="Fin" name="ends_at" type="datetime-local" value={form.ends_at} onChange={handleChange} />
          <label className="block">
            <span className="ui-title mb-2 block text-sm font-medium">Image du stage</span>
            <input type="file" accept="image/*" onChange={(event) => setForm((prev) => ({ ...prev, image: event.target.files?.[0] ?? null }))} className="ui-input rounded-2xl px-4 py-3" />
          </label>
          <PrimaryButton type="submit" className="w-full">{editing ? 'Mettre a jour l offre' : 'Enregistrer l offre'}</PrimaryButton>
        </form>
      </AnimatedModal>
      <AnimatedModal open={Boolean(applyId)} title="Postuler a ce stage" onClose={() => setApplyId(null)}>
        <form className="space-y-4" onSubmit={apply}>
          <label className="block">
            <span className="ui-title mb-2 block text-sm font-medium">Motivation</span>
            <textarea value={motivation} onChange={(event) => setMotivation(event.target.value)} rows="5" className="ui-input rounded-2xl px-4 py-3" placeholder="Explique pourquoi ce stage correspond a ton profil..." required />
          </label>
          <PrimaryButton type="submit" className="w-full">Envoyer ma candidature</PrimaryButton>
        </form>
      </AnimatedModal>
    </div>
  );
}
