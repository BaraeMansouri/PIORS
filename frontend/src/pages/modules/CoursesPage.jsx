import { useEffect, useState } from 'react';
import { FiDownload, FiEdit2, FiLayers, FiPlus, FiTrash2 } from 'react-icons/fi';
import SectionHeader from '../../components/SectionHeader';
import GlassCard from '../../components/GlassCard';
import PrimaryButton from '../../components/PrimaryButton';
import { academicService } from '../../services/academicService';
import { useAuth } from '../../context/AuthContext';
import AnimatedModal from '../../components/AnimatedModal';
import InputField from '../../components/InputField';

const initialForm = { title: '', description: '', support_priority: 3, pdf: null, image: null };

export default function CoursesPage() {
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
      setItems(await academicService.getCourses());
    } catch (loadError) {
      setError(loadError.response?.data?.message || 'Impossible de charger les cours.');
    }
  };

  useEffect(() => { load(); }, []);

  const flash = (setter, text) => {
    setter(text);
    window.setTimeout(() => setter(''), 2600);
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditing(null);
    setOpen(false);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setOpen(true);
  };

  const openEdit = (course) => {
    setEditing(course);
      setForm({
        title: course.title ?? '',
        description: course.description ?? '',
        support_priority: course.support_priority ?? 3,
        pdf: null,
        image: null,
      });
    setOpen(true);
  };

  const canManageCourse = (course) => user?.role === 'admin' || String(course.trainer_id) === String(user?.id);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const payload = new FormData();
      payload.append('title', form.title);
      payload.append('description', form.description);
      payload.append('support_priority', String(form.support_priority));
      if (form.pdf) payload.append('pdf', form.pdf);
      if (form.image) payload.append('image', form.image);

      if (editing) {
        await academicService.updateCourse(editing.id, payload);
        flash(setMessage, 'Cours modifie avec succes.');
      } else {
        await academicService.createCourse(payload);
        flash(setMessage, 'Cours cree avec succes.');
      }

      resetForm();
      await load();
    } catch (submitError) {
      setError(submitError.response?.data?.message || 'Enregistrement du cours impossible.');
    }
  };

  const removeCourse = async (id) => {
    try {
      setError('');
      await academicService.deleteCourse(id);
      flash(setMessage, 'Cours supprime avec succes.');
      await load();
    } catch (deleteError) {
      setError(deleteError.response?.data?.message || 'Suppression du cours impossible.');
    }
  };

  return (
    <div className="space-y-8">
      <SectionHeader eyebrow="Phase 4 - Cours" title="Bibliotheque de cours premium" subtitle="Cards immersives avec apercu visuel, niveau de soutien et telechargement PDF." actions={canCreate ? <PrimaryButton onClick={openCreate}><FiPlus /> Ajouter un cours</PrimaryButton> : null} />
      {message ? <div className="rounded-2xl border border-emerald/20 bg-emerald/10 px-4 py-3 text-sm font-semibold text-emerald">{message}</div> : null}
      {error ? <div className="rounded-2xl border border-alert/20 bg-alert/10 px-4 py-3 text-sm font-semibold text-alert">{error}</div> : null}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {items.map((course) => (
          <GlassCard key={course.id} className="overflow-hidden">
            <div className="relative h-56 w-full overflow-hidden">
              <img src={course.image} alt={course.title} className="h-full w-full object-cover transition duration-500 hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />
            </div>
            <div className="p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="rounded-full border border-cyan/20 bg-cyan/10 px-3 py-1 text-xs font-semibold text-cyan">{course.level}</span>
                <span className="inline-flex items-center gap-2 text-xs text-slate-400"><FiLayers /> Soutien {course.support_priority}/5</span>
              </div>
              <h3 className="ui-title font-display text-2xl font-semibold">{course.title}</h3>
              <p className="ui-muted mt-3 text-sm leading-6">{course.description}</p>
              <p className="ui-muted mt-3 text-xs">Publie par {course.trainer?.name ?? 'Formateur'}</p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a className="flex-1 min-w-[180px]" href={course.pdf_url} target="_blank" rel="noreferrer"><PrimaryButton className="w-full"><FiDownload /> Telecharger PDF</PrimaryButton></a>
                {canManageCourse(course) ? (
                  <>
                    <PrimaryButton variant="secondary" onClick={() => openEdit(course)}><FiEdit2 /> Modifier</PrimaryButton>
                    <PrimaryButton variant="danger" onClick={() => removeCourse(course.id)}><FiTrash2 /> Supprimer</PrimaryButton>
                  </>
                ) : null}
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
      <AnimatedModal open={open} title={editing ? 'Modifier le cours' : 'Creer un cours'} onClose={resetForm}>
        <form className="space-y-4" onSubmit={submit}>
          <InputField label="Titre" name="title" value={form.title} onChange={handleChange} required />
          <label className="block">
            <span className="ui-title mb-2 block text-sm font-medium">Description</span>
            <textarea name="description" value={form.description} onChange={handleChange} rows="4" className="ui-input rounded-2xl px-4 py-3" required />
          </label>
          <InputField label="Priorite soutien" name="support_priority" type="number" min="0" max="5" value={form.support_priority} onChange={handleChange} />
          <label className="block">
            <span className="ui-title mb-2 block text-sm font-medium">Image de couverture</span>
            <input type="file" accept="image/*" onChange={(event) => setForm((prev) => ({ ...prev, image: event.target.files?.[0] ?? null }))} className="ui-input rounded-2xl px-4 py-3" />
          </label>
          <label className="block">
            <span className="ui-title mb-2 block text-sm font-medium">PDF</span>
            <input type="file" accept="application/pdf" onChange={(event) => setForm((prev) => ({ ...prev, pdf: event.target.files?.[0] ?? null }))} className="ui-input rounded-2xl px-4 py-3" />
          </label>
          <PrimaryButton type="submit" className="w-full">{editing ? 'Mettre a jour le cours' : 'Enregistrer le cours'}</PrimaryButton>
        </form>
      </AnimatedModal>
    </div>
  );
}
