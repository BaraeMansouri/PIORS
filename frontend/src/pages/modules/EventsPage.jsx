import { useEffect, useState } from 'react';
import { FiCalendar, FiEdit2, FiMapPin, FiPlus, FiTrash2, FiUsers } from 'react-icons/fi';
import SectionHeader from '../../components/SectionHeader';
import GlassCard from '../../components/GlassCard';
import PrimaryButton from '../../components/PrimaryButton';
import { academicService } from '../../services/academicService';
import { useAuth } from '../../context/AuthContext';
import AnimatedModal from '../../components/AnimatedModal';
import InputField from '../../components/InputField';

const initialForm = { title: '', description: '', starts_at: '', ends_at: '', location: '', capacity: 30, image: null };

export default function EventsPage() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState(initialForm);
  const { user } = useAuth();
  const canCreate = ['admin', 'formateur'].includes(user?.role);

  const load = async () => {
    try {
      setItems(await academicService.getEvents());
    } catch (loadError) {
      setError(loadError.response?.data?.message || 'Impossible de charger les events.');
    }
  };

  useEffect(() => { load(); }, []);

  const flash = (setter, text) => {
    setter(text);
    window.setTimeout(() => setter(''), 2400);
  };

  const canManageEvent = (event) => user?.role === 'admin' || String(event.created_by) === String(user?.id);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetModal = () => {
    setEditing(null);
    setForm(initialForm);
    setOpen(false);
  };

  const openEdit = (event) => {
    setEditing(event);
    setForm({
      title: event.title ?? '',
      description: event.description ?? '',
      starts_at: event.starts_at ? new Date(event.starts_at).toISOString().slice(0, 16) : '',
      ends_at: event.ends_at ? new Date(event.ends_at).toISOString().slice(0, 16) : '',
      location: event.location ?? '',
      capacity: event.capacity ?? 30,
      image: null,
    });
    setOpen(true);
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      if (editing) {
        const payload = new FormData();
        payload.append('title', form.title);
        payload.append('description', form.description);
        payload.append('starts_at', form.starts_at);
        payload.append('ends_at', form.ends_at);
        payload.append('location', form.location);
        payload.append('capacity', String(form.capacity));
        if (form.image) payload.append('image', form.image);
        await academicService.updateEvent(editing.id, payload);
        flash(setMessage, 'Event modifie avec succes.');
      } else {
        const payload = new FormData();
        payload.append('title', form.title);
        payload.append('description', form.description);
        payload.append('starts_at', form.starts_at);
        payload.append('ends_at', form.ends_at);
        payload.append('location', form.location);
        payload.append('capacity', String(form.capacity));
        if (form.image) payload.append('image', form.image);
        await academicService.createEvent(payload);
        flash(setMessage, 'Event cree avec succes.');
      }

      resetModal();
      await load();
    } catch (submitError) {
      setError(submitError.response?.data?.message || 'Enregistrement de l event impossible.');
    }
  };

  const register = async (id) => {
    try {
      setError('');
      await academicService.registerEvent(id);
      flash(setMessage, 'Inscription enregistree.');
      await load();
    } catch (registerError) {
      setError(registerError.response?.data?.message || 'Inscription impossible.');
    }
  };

  const removeEvent = async (id) => {
    try {
      setError('');
      await academicService.deleteEvent(id);
      flash(setMessage, 'Event supprime avec succes.');
      await load();
    } catch (deleteError) {
      setError(deleteError.response?.data?.message || 'Suppression de l event impossible.');
    }
  };

  return (
    <div className="space-y-8">
      <SectionHeader eyebrow="Phase 4 - Events" title="Calendrier d experiences" subtitle="Evenements stylises avec statut ouvert, complet ou inscription disponible." actions={canCreate ? <PrimaryButton variant="success" onClick={() => setOpen(true)}><FiPlus /> Creer un event</PrimaryButton> : null} />
      {message ? <div className="rounded-2xl border border-emerald/20 bg-emerald/10 px-4 py-3 text-sm font-semibold text-emerald">{message}</div> : null}
      {error ? <div className="rounded-2xl border border-alert/20 bg-alert/10 px-4 py-3 text-sm font-semibold text-alert">{error}</div> : null}
      <div className="grid gap-6 xl:grid-cols-3">
        {items.map((event) => (
          <GlassCard key={event.id} className="p-5">
            <div className="relative mb-5 h-48 overflow-hidden rounded-[24px]">
              <img src={event.image} alt={event.title} className="h-full w-full object-cover transition duration-500 hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/15 to-transparent" />
            </div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${event.status === 'Complet' ? 'bg-alert/15 text-rose-200' : 'bg-emerald/15 text-emerald'}`}>{event.status}</span>
                <h3 className="ui-title mt-4 font-display text-2xl font-semibold">{event.title}</h3>
              </div>
              <div className="rounded-2xl bg-white/5 p-3 text-cyan"><FiCalendar /></div>
            </div>
            <div className="ui-muted mt-6 space-y-3 text-sm">
              <p className="flex items-center gap-3"><FiCalendar className="text-cyan" /> {event.date}</p>
              <p className="flex items-center gap-3"><FiMapPin className="text-cyan" /> {event.location}</p>
              <p className="flex items-center gap-3"><FiUsers className="text-cyan" /> {event.registered}/{event.capacity} inscrits</p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {user?.role === 'stagiaire' ? (
                <PrimaryButton className="flex-1" variant={event.status === 'Complet' || event.is_registered ? 'secondary' : 'primary'} disabled={event.status === 'Complet' || event.is_registered} onClick={() => register(event.id)}>
                  {event.is_registered ? 'Deja inscrit' : event.status === 'Complet' ? 'Complet' : 'S inscrire'}
                </PrimaryButton>
              ) : null}
              {canManageEvent(event) ? (
                <>
                  <PrimaryButton variant="secondary" onClick={() => openEdit(event)}><FiEdit2 /> Modifier</PrimaryButton>
                  <PrimaryButton variant="danger" onClick={() => removeEvent(event.id)}><FiTrash2 /> Supprimer</PrimaryButton>
                </>
              ) : null}
            </div>
          </GlassCard>
        ))}
      </div>
      <AnimatedModal open={open} title={editing ? 'Modifier un event' : 'Creer un event'} onClose={resetModal}>
        <form className="space-y-4" onSubmit={submit}>
          <InputField label="Titre" name="title" value={form.title} onChange={handleChange} required />
          <label className="block">
            <span className="ui-title mb-2 block text-sm font-medium">Description</span>
            <textarea name="description" value={form.description} onChange={handleChange} rows="4" className="ui-input rounded-2xl px-4 py-3" required />
          </label>
          <InputField label="Debut" name="starts_at" type="datetime-local" value={form.starts_at} onChange={handleChange} required />
          <InputField label="Fin" name="ends_at" type="datetime-local" value={form.ends_at} onChange={handleChange} required />
          <InputField label="Lieu" name="location" value={form.location} onChange={handleChange} required />
          <InputField label="Capacite" name="capacity" type="number" min="1" value={form.capacity} onChange={handleChange} required />
          <label className="block">
            <span className="ui-title mb-2 block text-sm font-medium">Image de l event</span>
            <input type="file" accept="image/*" onChange={(event) => setForm((prev) => ({ ...prev, image: event.target.files?.[0] ?? null }))} className="ui-input rounded-2xl px-4 py-3" />
          </label>
          <PrimaryButton type="submit" className="w-full">{editing ? 'Mettre a jour l event' : 'Enregistrer l event'}</PrimaryButton>
        </form>
      </AnimatedModal>
    </div>
  );
}
