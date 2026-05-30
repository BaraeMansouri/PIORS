import { useEffect, useMemo, useState } from 'react';
import { FiCheckCircle, FiPlus, FiRefreshCw } from 'react-icons/fi';
import SectionHeader from '../../components/SectionHeader';
import GlassCard from '../../components/GlassCard';
import DataTable from '../../components/DataTable';
import PrimaryButton from '../../components/PrimaryButton';
import InputField from '../../components/InputField';
import { followUpService } from '../../services/followUpService';

const today = new Date().toISOString().slice(0, 10);

export default function FollowUpPage() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [absences, setAbsences] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [gradeForm, setGradeForm] = useState({ student_id: '', course_id: '', label: '', score: '', coefficient: 1, graded_at: today });
  const [absenceForm, setAbsenceForm] = useState({ student_id: '', course_id: '', date: today, status: 'unjustified', reason: '' });
  const [recForm, setRecForm] = useState({ student_id: '', title: '', message: '', priority: 'medium', due_at: '' });

  const load = async () => {
    try {
      setError('');
      const [nextStudents, nextCourses, nextGrades, nextAbsences, nextRecommendations] = await Promise.all([
        followUpService.getStudents(),
        followUpService.getCourses(),
        followUpService.getGrades(),
        followUpService.getAbsences(),
        followUpService.getRecommendations(),
      ]);
      setStudents(nextStudents);
      setCourses(nextCourses);
      setGrades(nextGrades);
      setAbsences(nextAbsences);
      setRecommendations(nextRecommendations);
      setGradeForm((prev) => ({ ...prev, student_id: prev.student_id || nextStudents[0]?.id || '', course_id: prev.course_id || nextCourses[0]?.id || '' }));
      setAbsenceForm((prev) => ({ ...prev, student_id: prev.student_id || nextStudents[0]?.id || '', course_id: prev.course_id || nextCourses[0]?.id || '' }));
      setRecForm((prev) => ({ ...prev, student_id: prev.student_id || nextStudents[0]?.id || '' }));
    } catch (loadError) {
      setError(loadError.response?.data?.message || 'Chargement du suivi impossible.');
    }
  };

  useEffect(() => { load(); }, []);

  const flash = (setter, text) => {
    setter(text);
    window.setTimeout(() => setter(''), 2600);
  };

  const rows = useMemo(() => students.map((student) => {
    const risk = Number(student.average_grade ?? 0) < 10 || Number(student.absence_count ?? 0) >= 8;
    return {
      ...student,
      className: student.class?.name ?? student.className ?? '-',
      filiereName: typeof student.filiere === 'string' ? student.filiere : student.filiere?.name ?? '-',
      status: risk ? 'Alerte' : 'Stable',
    };
  }), [students]);

  const updateForm = (setter) => (event) => {
    const { name, value } = event.target;
    setter((prev) => ({ ...prev, [name]: value }));
  };

  const submitGrade = async (event) => {
    event.preventDefault();
    try {
      await followUpService.createGrade({ ...gradeForm, score: Number(gradeForm.score), coefficient: Number(gradeForm.coefficient) });
      setGradeForm((prev) => ({ ...prev, label: '', score: '' }));
      flash(setMessage, 'Note enregistree.');
      await load();
    } catch (submitError) {
      setError(submitError.response?.data?.message || 'Impossible de saisir la note.');
    }
  };

  const submitAbsence = async (event) => {
    event.preventDefault();
    try {
      await followUpService.createAbsence(absenceForm);
      setAbsenceForm((prev) => ({ ...prev, reason: '' }));
      flash(setMessage, 'Absence enregistree.');
      await load();
    } catch (submitError) {
      setError(submitError.response?.data?.message || 'Impossible de saisir l absence.');
    }
  };

  const submitRecommendation = async (event) => {
    event.preventDefault();
    try {
      await followUpService.createRecommendation(recForm);
      setRecForm((prev) => ({ ...prev, title: '', message: '', due_at: '' }));
      flash(setMessage, 'Recommandation envoyee.');
      await load();
    } catch (submitError) {
      setError(submitError.response?.data?.message || 'Impossible d envoyer la recommandation.');
    }
  };

  const closeRecommendation = async (id) => {
    await followUpService.updateRecommendation(id, { status: 'done' });
    await load();
  };

  const Select = ({ label, name, value, onChange, children }) => (
    <label className="block">
      <span className="ui-title mb-2 block text-sm font-medium">{label}</span>
      <select name={name} value={value} onChange={onChange} className="ui-input rounded-2xl px-4 py-3" required>{children}</select>
    </label>
  );

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Suivi pedagogique"
        title="Notes, absences et recommandations"
        subtitle="Espace formateur pour enregistrer les evaluations, declencher les alertes et accompagner les stagiaires."
        actions={<PrimaryButton variant="secondary" onClick={load}><FiRefreshCw /> Actualiser</PrimaryButton>}
      />

      {message ? <div className="rounded-2xl border border-emerald/20 bg-emerald/10 px-4 py-3 text-sm font-semibold text-emerald">{message}</div> : null}
      {error ? <div className="rounded-2xl border border-alert/20 bg-alert/10 px-4 py-3 text-sm font-semibold text-alert">{error}</div> : null}

      <GlassCard className="p-5">
        <SectionHeader eyebrow="Stagiaires" title="Liste priorisee" />
        <DataTable
          columns={[
            { key: 'name', label: 'Stagiaire' },
            { key: 'className', label: 'Classe' },
            { key: 'filiereName', label: 'Filiere' },
            { key: 'average_grade', label: 'Moyenne', render: (value) => Number(value ?? 0).toFixed(2) },
            { key: 'absence_count', label: 'Absences' },
            { key: 'status', label: 'Statut', render: (value) => <span className={`rounded-full px-3 py-1 text-xs font-semibold ${value === 'Alerte' ? 'bg-alert/15 text-rose-200' : 'bg-emerald/15 text-emerald'}`}>{value}</span> },
          ]}
          rows={rows}
        />
      </GlassCard>

      <div className="grid gap-6 xl:grid-cols-3">
        <GlassCard className="p-5">
          <SectionHeader eyebrow="Evaluation" title="Saisir une note" />
          <form className="space-y-4" onSubmit={submitGrade}>
            <Select label="Stagiaire" name="student_id" value={gradeForm.student_id} onChange={updateForm(setGradeForm)}>
              {students.map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}
            </Select>
            <Select label="Cours" name="course_id" value={gradeForm.course_id} onChange={updateForm(setGradeForm)}>
              {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
            </Select>
            <InputField label="Libelle" name="label" value={gradeForm.label} onChange={updateForm(setGradeForm)} required />
            <div className="grid gap-4 md:grid-cols-2">
              <InputField label="Note / 20" name="score" type="number" min="0" max="20" step="0.25" value={gradeForm.score} onChange={updateForm(setGradeForm)} required />
              <InputField label="Coefficient" name="coefficient" type="number" min="0.5" max="10" step="0.5" value={gradeForm.coefficient} onChange={updateForm(setGradeForm)} required />
            </div>
            <InputField label="Date" name="graded_at" type="date" value={gradeForm.graded_at} onChange={updateForm(setGradeForm)} />
            <PrimaryButton type="submit" className="w-full"><FiPlus /> Enregistrer</PrimaryButton>
          </form>
        </GlassCard>

        <GlassCard className="p-5">
          <SectionHeader eyebrow="Presence" title="Saisir une absence" />
          <form className="space-y-4" onSubmit={submitAbsence}>
            <Select label="Stagiaire" name="student_id" value={absenceForm.student_id} onChange={updateForm(setAbsenceForm)}>
              {students.map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}
            </Select>
            <Select label="Cours" name="course_id" value={absenceForm.course_id} onChange={updateForm(setAbsenceForm)}>
              {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
            </Select>
            <InputField label="Date" name="date" type="date" value={absenceForm.date} onChange={updateForm(setAbsenceForm)} required />
            <Select label="Statut" name="status" value={absenceForm.status} onChange={updateForm(setAbsenceForm)}>
              <option value="unjustified">Non justifiee</option>
              <option value="justified">Justifiee</option>
              <option value="late">Retard</option>
            </Select>
            <InputField label="Motif" name="reason" value={absenceForm.reason} onChange={updateForm(setAbsenceForm)} />
            <PrimaryButton type="submit" className="w-full"><FiPlus /> Enregistrer</PrimaryButton>
          </form>
        </GlassCard>

        <GlassCard className="p-5">
          <SectionHeader eyebrow="Accompagnement" title="Ajouter un conseil" />
          <form className="space-y-4" onSubmit={submitRecommendation}>
            <Select label="Stagiaire" name="student_id" value={recForm.student_id} onChange={updateForm(setRecForm)}>
              {students.map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}
            </Select>
            <InputField label="Titre" name="title" value={recForm.title} onChange={updateForm(setRecForm)} required />
            <label className="block">
              <span className="ui-title mb-2 block text-sm font-medium">Message</span>
              <textarea name="message" value={recForm.message} onChange={updateForm(setRecForm)} rows="4" className="ui-input rounded-2xl px-4 py-3" required />
            </label>
            <Select label="Priorite" name="priority" value={recForm.priority} onChange={updateForm(setRecForm)}>
              <option value="low">Basse</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
            </Select>
            <InputField label="Echeance" name="due_at" type="date" value={recForm.due_at} onChange={updateForm(setRecForm)} />
            <PrimaryButton type="submit" className="w-full"><FiPlus /> Envoyer</PrimaryButton>
          </form>
        </GlassCard>
      </div>

      <GlassCard className="p-5">
        <SectionHeader eyebrow="Conseils" title="Recommandations pedagogiques" />
        <DataTable
          columns={[
            { key: 'student', label: 'Stagiaire', render: (value) => value?.name ?? '-' },
            { key: 'title', label: 'Titre' },
            { key: 'priority', label: 'Priorite' },
            { key: 'status', label: 'Statut' },
            { key: 'id', label: 'Action', render: (value, row) => row.status === 'open' ? <button type="button" onClick={() => closeRecommendation(value)} className="inline-flex items-center gap-2 rounded-full border border-emerald/20 bg-emerald/10 px-3 py-1 text-xs font-semibold text-emerald"><FiCheckCircle /> Traiter</button> : 'Terminee' },
          ]}
          rows={recommendations}
        />
      </GlassCard>
    </div>
  );
}
