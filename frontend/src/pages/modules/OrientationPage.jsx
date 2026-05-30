import { useEffect, useMemo, useState } from 'react';
import { FiPlus, FiRefreshCw, FiTrash2 } from 'react-icons/fi';
import SectionHeader from '../../components/SectionHeader';
import GlassCard from '../../components/GlassCard';
import PrimaryButton from '../../components/PrimaryButton';
import InputField from '../../components/InputField';
import DataTable from '../../components/DataTable';
import { orientationService } from '../../services/orientationService';
import { useAuth } from '../../context/AuthContext';

const defaultOptions = [
  { label: 'Peu', value: 10 },
  { label: 'Moyennement', value: 20 },
  { label: 'Beaucoup', value: 30 },
];

const initialQuestion = { question: '', skill_key: 'logic', position: 1 };
const initialTest = { title: '', description: '', is_active: true };

export default function OrientationPage() {
  const { user } = useAuth();
  const [tests, setTests] = useState([]);
  const [results, setResults] = useState([]);
  const [resources, setResources] = useState({ filieres: [], students: [] });
  const [selectedTestId, setSelectedTestId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [questionForm, setQuestionForm] = useState(initialQuestion);
  const [testForm, setTestForm] = useState(initialTest);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const isAdmin = user?.role === 'admin';
  const canTargetStudent = ['admin', 'formateur'].includes(user?.role);

  const selectedTest = useMemo(
    () => tests.find((test) => String(test.id) === String(selectedTestId)) ?? tests[0],
    [selectedTestId, tests],
  );

  const answeredCount = selectedTest?.questions?.filter((question) => answers[question.id]).length ?? 0;
  const completed = selectedTest?.questions?.length > 0 && answeredCount === selectedTest.questions.length;

  const load = async () => {
    try {
      setError('');
      const [nextTests, nextResults, nextResources] = await Promise.all([
        orientationService.getTests(),
        orientationService.getResults(),
        orientationService.getResources(),
      ]);
      setTests(nextTests);
      setResults(nextResults);
      setResources(nextResources);
      if (!selectedTestId && nextTests[0]) setSelectedTestId(String(nextTests[0].id));
    } catch (loadError) {
      setError(loadError.response?.data?.message || 'Chargement orientation impossible.');
    }
  };

  useEffect(() => { load(); }, []);

  const flash = (setter, text) => {
    setter(text);
    window.setTimeout(() => setter(''), 2600);
  };

  const chooseAnswer = (question, option) => {
    setAnswers((prev) => ({
      ...prev,
      [question.id]: {
        question_id: question.id,
        value: option.value,
        label: option.label,
      },
    }));
  };

  const submit = async () => {
    if (!selectedTest || !completed) return;
    try {
      setError('');
      const payload = { answers: Object.values(answers) };
      if (selectedStudentId && canTargetStudent) payload.student_id = Number(selectedStudentId);
      const nextResult = await orientationService.submitTest(selectedTest.id, payload);
      setResult(nextResult);
      setAnswers({});
      flash(setMessage, 'Resultat orientation enregistre.');
      await load();
    } catch (submitError) {
      setError(submitError.response?.data?.message || 'Impossible de valider le test.');
    }
  };

  const createTest = async (event) => {
    event.preventDefault();
    try {
      await orientationService.createTest(testForm);
      setTestForm(initialTest);
      flash(setMessage, 'Test ajoute.');
      await load();
    } catch (createError) {
      setError(createError.response?.data?.message || 'Creation du test impossible.');
    }
  };

  const addQuestion = async (event) => {
    event.preventDefault();
    if (!selectedTest) return;
    try {
      await orientationService.addQuestion(selectedTest.id, {
        ...questionForm,
        position: Number(questionForm.position || 0),
        options: defaultOptions,
      });
      setQuestionForm((prev) => ({ ...initialQuestion, position: Number(prev.position || 0) + 1 }));
      flash(setMessage, 'Question ajoutee.');
      await load();
    } catch (createError) {
      setError(createError.response?.data?.message || 'Creation de question impossible.');
    }
  };

  const removeQuestion = async (questionId) => {
    try {
      await orientationService.deleteQuestion(questionId);
      flash(setMessage, 'Question supprimee.');
      await load();
    } catch (deleteError) {
      setError(deleteError.response?.data?.message || 'Suppression impossible.');
    }
  };

  const latestResult = result ?? results[0];
  const resultFiliere = latestResult?.recommended_filiere?.name ?? 'A completer';

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Orientation intelligente"
        title="Tests, scores et historique"
        subtitle="Questionnaire connecte au backend avec calcul par filiere, resultat sauvegarde et recommandations exploitables."
        actions={<PrimaryButton variant="secondary" onClick={load}><FiRefreshCw /> Actualiser</PrimaryButton>}
      />

      {message ? <div className="rounded-2xl border border-emerald/20 bg-emerald/10 px-4 py-3 text-sm font-semibold text-emerald">{message}</div> : null}
      {error ? <div className="rounded-2xl border border-alert/20 bg-alert/10 px-4 py-3 text-sm font-semibold text-alert">{error}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <GlassCard className="p-6">
          <div className="mb-5 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="ui-title mb-2 block text-sm font-medium">Test</span>
              <select value={selectedTestId} onChange={(event) => { setSelectedTestId(event.target.value); setAnswers({}); }} className="ui-input rounded-2xl px-4 py-3">
                {tests.map((test) => <option key={test.id} value={test.id}>{test.title}</option>)}
              </select>
            </label>
            {canTargetStudent ? (
              <label className="block">
                <span className="ui-title mb-2 block text-sm font-medium">Stagiaire cible</span>
                <select value={selectedStudentId} onChange={(event) => setSelectedStudentId(event.target.value)} className="ui-input rounded-2xl px-4 py-3">
                  <option value="">Moi-meme</option>
                  {resources.students.map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}
                </select>
              </label>
            ) : null}
          </div>

          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-neon/80">Questionnaire</p>
              <h3 className="mt-2 font-display text-2xl font-semibold text-white">{selectedTest?.title ?? 'Aucun test'}</h3>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">{answeredCount} / {selectedTest?.questions?.length ?? 0}</span>
          </div>

          <div className="space-y-4">
            {selectedTest?.questions?.map((question) => (
              <div key={question.id} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-cyan/80">{question.skill_key}</p>
                    <p className="mt-2 font-semibold text-white">{question.question}</p>
                  </div>
                  {isAdmin ? <button type="button" onClick={() => removeQuestion(question.id)} className="ui-control rounded-full p-3 text-alert"><FiTrash2 /></button> : null}
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  {(question.options ?? defaultOptions).map((option) => (
                    <button
                      key={`${question.id}-${option.label}`}
                      type="button"
                      onClick={() => chooseAnswer(question, option)}
                      className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${answers[question.id]?.label === option.label ? 'border-cyan bg-cyan/20 text-white' : 'border-white/10 bg-white/5 text-slate-300 hover:border-cyan/40'}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <PrimaryButton onClick={submit} disabled={!completed} className="mt-6 w-full disabled:cursor-not-allowed disabled:opacity-50">
            Valider le test
          </PrimaryButton>
        </GlassCard>

        <GlassCard className="space-y-5 p-6">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-emerald/80">Dernier resultat</p>
            <h3 className="mt-2 font-display text-3xl font-semibold text-white">{resultFiliere}</h3>
            <p className="mt-2 text-sm text-slate-300">Confiance {latestResult?.confidence ?? 0}%</p>
          </div>
          <div className="space-y-3">
            {(latestResult?.reasons ?? ['Complete le test pour generer une orientation.']).map((reason) => (
              <div key={reason} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">{reason}</div>
            ))}
          </div>
          <div className="space-y-3">
            {(latestResult?.filiere_scores ?? []).map((score) => (
              <div key={score.code} className="rounded-2xl border border-cyan/15 bg-cyan/10 p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-white">{score.name}</span>
                  <span className="text-cyan">{score.score}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-cyan" style={{ width: `${Math.min(100, score.score)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {isAdmin ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <GlassCard className="p-5">
            <SectionHeader eyebrow="Parametrage" title="Nouveau test" />
            <form className="space-y-4" onSubmit={createTest}>
              <InputField label="Titre" value={testForm.title} onChange={(event) => setTestForm((prev) => ({ ...prev, title: event.target.value }))} required />
              <label className="block">
                <span className="ui-title mb-2 block text-sm font-medium">Description</span>
                <textarea value={testForm.description} onChange={(event) => setTestForm((prev) => ({ ...prev, description: event.target.value }))} rows="3" className="ui-input rounded-2xl px-4 py-3" />
              </label>
              <PrimaryButton type="submit"><FiPlus /> Ajouter le test</PrimaryButton>
            </form>
          </GlassCard>

          <GlassCard className="p-5">
            <SectionHeader eyebrow="Questions" title="Ajouter une question" />
            <form className="space-y-4" onSubmit={addQuestion}>
              <InputField label="Question" value={questionForm.question} onChange={(event) => setQuestionForm((prev) => ({ ...prev, question: event.target.value }))} required />
              <div className="grid gap-4 md:grid-cols-2">
                <InputField label="Competence" value={questionForm.skill_key} onChange={(event) => setQuestionForm((prev) => ({ ...prev, skill_key: event.target.value }))} required />
                <InputField label="Ordre" type="number" value={questionForm.position} onChange={(event) => setQuestionForm((prev) => ({ ...prev, position: event.target.value }))} />
              </div>
              <PrimaryButton type="submit"><FiPlus /> Ajouter la question</PrimaryButton>
            </form>
          </GlassCard>
        </div>
      ) : null}

      <GlassCard className="p-5">
        <SectionHeader eyebrow="Historique" title="Resultats enregistres" />
        <DataTable
          columns={[
            { key: 'student', label: 'Stagiaire', render: (value) => value?.name ?? user?.name },
            { key: 'recommended_filiere', label: 'Filiere', render: (value) => value?.name ?? 'Non definie' },
            { key: 'confidence', label: 'Confiance', render: (value) => `${value ?? 0}%` },
            { key: 'total_score', label: 'Score', render: (value) => Math.round(value ?? 0) },
            { key: 'taken_at', label: 'Date', render: (value) => (value ? new Date(value).toLocaleDateString('fr-FR') : '-') },
          ]}
          rows={results}
        />
      </GlassCard>
    </div>
  );
}
