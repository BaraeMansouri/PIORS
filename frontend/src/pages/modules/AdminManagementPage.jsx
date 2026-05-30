import { useEffect, useMemo, useState } from 'react';
import { FiCheckCircle, FiPlus, FiRefreshCw } from 'react-icons/fi';
import SectionHeader from '../../components/SectionHeader';
import GlassCard from '../../components/GlassCard';
import DataTable from '../../components/DataTable';
import PrimaryButton from '../../components/PrimaryButton';
import InputField from '../../components/InputField';
import { adminService } from '../../services/adminService';

export default function AdminManagementPage() {
  const [students, setStudents] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [classes, setClasses] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [filiereForm, setFiliereForm] = useState({ name: '', code: '', description: '', minimum_orientation_score: 50, recommended_skills: '' });
  const [classForm, setClassForm] = useState({ name: '', code: '', year: '2025-2026', capacity: 30, filiere_id: '', description: '' });

  const load = async () => {
    try {
      setError('');
      const [nextStudents, nextTrainers, nextFilieres, nextClasses] = await Promise.all([
        adminService.getStudents(),
        adminService.getTrainers(),
        adminService.getFilieres(),
        adminService.getClasses(),
      ]);
      setStudents(nextStudents);
      setTrainers(nextTrainers);
      setFilieres(nextFilieres);
      setClasses(nextClasses);
      setClassForm((prev) => ({ ...prev, filiere_id: prev.filiere_id || nextFilieres[0]?.id || '' }));
    } catch (loadError) {
      setError(loadError.response?.data?.message || 'Chargement administration impossible.');
    }
  };

  useEffect(() => { load(); }, []);

  const flash = (setter, text) => {
    setter(text);
    window.setTimeout(() => setter(''), 2600);
  };

  const users = useMemo(() => [...students, ...trainers].map((user) => ({
    ...user,
    className: user.class?.name ?? user.className ?? '-',
    filiereName: typeof user.filiere === 'string' ? user.filiere : user.filiere?.name ?? '-',
  })), [students, trainers]);

  const updateForm = (setter) => (event) => {
    const { name, value } = event.target;
    setter((prev) => ({ ...prev, [name]: value }));
  };

  const approve = async (userId) => {
    await adminService.approveUser(userId);
    flash(setMessage, 'Compte valide.');
    await load();
  };

  const createFiliere = async (event) => {
    event.preventDefault();
    try {
      await adminService.createFiliere({
        ...filiereForm,
        minimum_orientation_score: Number(filiereForm.minimum_orientation_score),
        recommended_skills: filiereForm.recommended_skills.split(',').map((item) => item.trim()).filter(Boolean),
      });
      setFiliereForm({ name: '', code: '', description: '', minimum_orientation_score: 50, recommended_skills: '' });
      flash(setMessage, 'Filiere creee.');
      await load();
    } catch (submitError) {
      setError(submitError.response?.data?.message || 'Creation de filiere impossible.');
    }
  };

  const createClass = async (event) => {
    event.preventDefault();
    try {
      await adminService.createClass({
        ...classForm,
        capacity: Number(classForm.capacity),
        filiere_id: classForm.filiere_id || null,
      });
      setClassForm((prev) => ({ ...prev, name: '', code: '', description: '' }));
      flash(setMessage, 'Classe creee.');
      await load();
    } catch (submitError) {
      setError(submitError.response?.data?.message || 'Creation de classe impossible.');
    }
  };

  const Select = ({ label, name, value, onChange, children }) => (
    <label className="block">
      <span className="ui-title mb-2 block text-sm font-medium">{label}</span>
      <select name={name} value={value} onChange={onChange} className="ui-input rounded-2xl px-4 py-3">{children}</select>
    </label>
  );

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Administration"
        title="Utilisateurs, filieres et classes"
        subtitle="Espace de pilotage pour valider les comptes, parametrer les filieres et organiser les groupes."
        actions={<PrimaryButton variant="secondary" onClick={load}><FiRefreshCw /> Actualiser</PrimaryButton>}
      />

      {message ? <div className="rounded-2xl border border-emerald/20 bg-emerald/10 px-4 py-3 text-sm font-semibold text-emerald">{message}</div> : null}
      {error ? <div className="rounded-2xl border border-alert/20 bg-alert/10 px-4 py-3 text-sm font-semibold text-alert">{error}</div> : null}

      <GlassCard className="p-5">
        <SectionHeader eyebrow="Comptes" title="Validation et supervision" />
        <DataTable
          columns={[
            { key: 'name', label: 'Nom' },
            { key: 'role', label: 'Role' },
            { key: 'className', label: 'Classe' },
            { key: 'filiereName', label: 'Filiere' },
            { key: 'account_status', label: 'Statut', render: (value) => <span className={`rounded-full px-3 py-1 text-xs font-semibold ${value === 'approved' ? 'bg-emerald/15 text-emerald' : 'bg-alert/15 text-rose-200'}`}>{value}</span> },
            { key: 'id', label: 'Action', render: (value, row) => row.account_status !== 'approved' ? <button type="button" onClick={() => approve(value)} className="inline-flex items-center gap-2 rounded-full border border-emerald/20 bg-emerald/10 px-3 py-1 text-xs font-semibold text-emerald"><FiCheckCircle /> Valider</button> : '-' },
          ]}
          rows={users}
        />
      </GlassCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <GlassCard className="p-5">
          <SectionHeader eyebrow="Filiere" title="Parametrage orientation" />
          <form className="space-y-4" onSubmit={createFiliere}>
            <div className="grid gap-4 md:grid-cols-2">
              <InputField label="Nom" name="name" value={filiereForm.name} onChange={updateForm(setFiliereForm)} required />
              <InputField label="Code" name="code" value={filiereForm.code} onChange={updateForm(setFiliereForm)} required />
            </div>
            <InputField label="Score minimum" name="minimum_orientation_score" type="number" min="0" max="100" value={filiereForm.minimum_orientation_score} onChange={updateForm(setFiliereForm)} />
            <InputField label="Competences separees par virgules" name="recommended_skills" value={filiereForm.recommended_skills} onChange={updateForm(setFiliereForm)} placeholder="logic, data, javascript" />
            <label className="block">
              <span className="ui-title mb-2 block text-sm font-medium">Description</span>
              <textarea name="description" value={filiereForm.description} onChange={updateForm(setFiliereForm)} rows="3" className="ui-input rounded-2xl px-4 py-3" />
            </label>
            <PrimaryButton type="submit"><FiPlus /> Ajouter filiere</PrimaryButton>
          </form>
        </GlassCard>

        <GlassCard className="p-5">
          <SectionHeader eyebrow="Classe" title="Creer un groupe" />
          <form className="space-y-4" onSubmit={createClass}>
            <div className="grid gap-4 md:grid-cols-2">
              <InputField label="Nom" name="name" value={classForm.name} onChange={updateForm(setClassForm)} required />
              <InputField label="Code" name="code" value={classForm.code} onChange={updateForm(setClassForm)} required />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <InputField label="Annee" name="year" value={classForm.year} onChange={updateForm(setClassForm)} required />
              <InputField label="Capacite" name="capacity" type="number" min="1" value={classForm.capacity} onChange={updateForm(setClassForm)} required />
            </div>
            <Select label="Filiere" name="filiere_id" value={classForm.filiere_id} onChange={updateForm(setClassForm)}>
              <option value="">Sans filiere</option>
              {filieres.map((filiere) => <option key={filiere.id} value={filiere.id}>{filiere.name}</option>)}
            </Select>
            <InputField label="Description" name="description" value={classForm.description} onChange={updateForm(setClassForm)} />
            <PrimaryButton type="submit"><FiPlus /> Ajouter classe</PrimaryButton>
          </form>
        </GlassCard>
      </div>

      <GlassCard className="p-5">
        <SectionHeader eyebrow="Catalogue" title="Filieres et classes" />
        <div className="grid gap-6 xl:grid-cols-2">
          <DataTable
            columns={[
              { key: 'name', label: 'Filiere' },
              { key: 'code', label: 'Code' },
              { key: 'minimum_orientation_score', label: 'Score min' },
            ]}
            rows={filieres}
          />
          <DataTable
            columns={[
              { key: 'name', label: 'Classe' },
              { key: 'code', label: 'Code' },
              { key: 'year', label: 'Annee' },
              { key: 'capacity', label: 'Capacite' },
            ]}
            rows={classes}
          />
        </div>
      </GlassCard>
    </div>
  );
}
