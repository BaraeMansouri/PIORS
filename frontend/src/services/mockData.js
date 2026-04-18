export const roleCredentials = {
  admin: { email: 'admin@piors.test', password: 'password' },
  formateur: { email: 'formateur@piors.test', password: 'password' },
  stagiaire: { email: 'stagiaire@piors.test', password: 'password' },
};

export const users = {
  admin: {
    id: 1,
    name: 'Barae Mansouri',
    firstName: 'Barae',
    lastName: 'Mansouri',
    email: 'admin@piors.test',
    role: 'admin',
    avatar: 'https://i.pravatar.cc/160?img=32',
    className: 'Administration',
    filiere: 'Pilotage digital',
  },
  formateur: {
    id: 2,
    name: 'Samir El Idrissi',
    firstName: 'Samir',
    lastName: 'El Idrissi',
    email: 'formateur@piors.test',
    role: 'formateur',
    avatar: 'https://i.pravatar.cc/160?img=15',
    className: 'DD 2026 Groupe A',
    filiere: 'Developpement Digital',
  },
  stagiaire: {
    id: 3,
    name: 'Aya Benali',
    firstName: 'Aya',
    lastName: 'Benali',
    email: 'stagiaire@piors.test',
    role: 'stagiaire',
    avatar: 'https://i.pravatar.cc/160?img=47',
    className: 'DD 2026 Groupe A',
    filiere: 'Developpement Digital',
  },
};

export const dashboardStats = {
  admin: [
    { label: 'Stagiaires actifs', value: '284', trend: '+12%', tone: 'cyan' },
    { label: 'Classes suivies', value: '18', trend: '+3', tone: 'neon' },
    { label: 'Risque eleve', value: '21', trend: '-8%', tone: 'alert' },
    { label: 'Insertion stage', value: '78%', trend: '+6%', tone: 'emerald' },
  ],
  formateur: [
    { label: 'Etudiants suivis', value: '72', trend: '+4', tone: 'cyan' },
    { label: 'Cours publies', value: '14', trend: '+2', tone: 'neon' },
    { label: 'Moyenne classe', value: '13.4', trend: '+0.9', tone: 'emerald' },
    { label: 'Absences a traiter', value: '9', trend: '-3', tone: 'alert' },
  ],
  stagiaire: [
    { label: 'Moyenne generale', value: '14.8', trend: '+1.1', tone: 'emerald' },
    { label: 'Absences', value: '2', trend: 'Stable', tone: 'cyan' },
    { label: 'Score orientation', value: '82', trend: '+7', tone: 'neon' },
    { label: 'Indice risque', value: 'Faible', trend: 'OK', tone: 'emerald' },
  ],
};

export const chartData = {
  adminPerformance: {
    labels: ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin'],
    datasets: [
      {
        label: 'Reussite globale',
        data: [62, 67, 71, 74, 79, 84],
        borderColor: '#39d0ff',
        backgroundColor: 'rgba(57,208,255,0.2)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Risque',
        data: [26, 23, 22, 19, 16, 12],
        borderColor: '#ff6b81',
        backgroundColor: 'rgba(255,107,129,0.08)',
        fill: true,
        tension: 0.35,
      },
    ],
  },
  trainerProgress: {
    labels: ['Algo', 'React', 'Laravel', 'UX', 'SQL'],
    datasets: [
      {
        label: 'Progression du groupe',
        data: [82, 74, 69, 88, 77],
        backgroundColor: ['#39d0ff', '#8b5cf6', '#35f0b1', '#7dd3fc', '#c084fc'],
      },
    ],
  },
  studentProgress: {
    labels: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'],
    datasets: [
      {
        label: 'Notes',
        data: [11, 12, 13, 14, 14.5, 15],
        borderColor: '#35f0b1',
        backgroundColor: 'rgba(53,240,177,0.16)',
        fill: true,
        tension: 0.4,
      },
    ],
  },
};

export const courses = [
  { id: 1, title: 'Architecture Laravel API', description: 'JWT, Sanctum, patterns de securite, tests.', image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80', level: 'Avance', support_priority: 4, pdf_path: '#' },
  { id: 2, title: 'React Experience Design', description: 'Interactions premium, micro-animations et composants reusables.', image: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=800&q=80', level: 'Intermediaire', support_priority: 5, pdf_path: '#' },
  { id: 3, title: 'SQL Data Strategy', description: 'Modelisation et optimisation des donnees academiques.', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80', level: 'Fondamental', support_priority: 3, pdf_path: '#' },
];

export const events = [
  { id: 1, title: 'Hackathon Orientation IA', date: '22 Avril 2026', location: 'Campus Innov Lab', capacity: 80, registered: 54, status: 'Ouvert' },
  { id: 2, title: 'Career Day Data & Web', date: '05 Mai 2026', location: 'Amphi A', capacity: 120, registered: 120, status: 'Complet' },
  { id: 3, title: 'Workshop Portfolio Elite', date: '18 Mai 2026', location: 'Salle Nexus', capacity: 40, registered: 28, status: 'Ouvert' },
];

export const internships = [
  { id: 1, title: 'Frontend Engineer Intern', company: 'Nova Systems', location: 'Casablanca', status: 'open', duration: '3 mois', description: 'React, design systems, performance.' },
  { id: 2, title: 'Data Analyst Intern', company: 'Atlas Insight', location: 'Rabat', status: 'open', duration: '4 mois', description: 'BI, SQL, dashboards decisionnels.' },
  { id: 3, title: 'UI Motion Designer', company: 'Pulse Studio', location: 'Remote', status: 'open', duration: '2 mois', description: 'Framer Motion, storytelling visuel.' },
];

export const communityPosts = [
  {
    id: 1,
    author: {
      name: 'Aya Benali',
      firstName: 'Aya',
      lastName: 'Benali',
      image: 'https://i.pravatar.cc/120?img=47',
      className: 'DD 2026 Groupe A',
      filiere: 'Developpement Digital',
    },
    content: 'Je partage mon tableau de progression React. Les animations Framer Motion changent vraiment le ressenti du projet.',
    likes: 18,
    comments: [
      { id: 1, author: 'Samir El Idrissi', content: 'Tres bon focus sur l experience utilisateur.' },
    ],
    time: 'Il y a 1h',
    tags: ['React', 'Motion'],
  },
  {
    id: 2,
    author: {
      name: 'Youssef Lahbabi',
      firstName: 'Youssef',
      lastName: 'Lahbabi',
      image: 'https://i.pravatar.cc/120?img=14',
      className: 'DD 2026 Groupe B',
      filiere: 'Developpement Digital',
    },
    content: 'Quelqu un a une bonne ressource pour optimiser les dashboards Chart.js avec des datasets dynamiques ?',
    likes: 9,
    comments: [
      { id: 2, author: 'Barae Mansouri', content: 'Oui, on peut memoizer les datasets et uniformiser les couleurs par role.' },
    ],
    time: 'Il y a 3h',
    tags: ['ChartJS', 'Dashboard'],
  },
];

export const aiRecommendations = {
  orientation: {
    title: 'Developpement Digital',
    confidence: 92,
    reasons: ['Tres bonne logique analytique', 'Progression rapide sur les modules web', 'Capacite forte a prototyper vite'],
  },
  risk: {
    level: 'Faible',
    summary: 'La trajectoire actuelle est rassurante, avec une moyenne stable et peu d absences.',
    actions: ['Maintenir le rythme sur Laravel', 'Renforcer SQL avance', 'Participer au hackathon IA'],
  },
  chatbot: [
    'Bienvenue sur PIORS AI. Je peux t aider pour l orientation, les stages et la progression.',
    'Ton profil montre un potentiel fort pour les projets frontend orientes experience utilisateur.',
    'Je recommande de candidater aux stages Nova Systems et Pulse Studio cette semaine.',
  ],
};

export const notifications = [
  { id: 1, title: 'Nouvelle candidature stage', message: '3 stagiaires ont postule cette semaine.', time: '5 min', tone: 'cyan' },
  { id: 2, title: 'Alerte risque detectee', message: '2 profils demandent un suivi prioritaire.', time: '18 min', tone: 'alert' },
  { id: 3, title: 'Event confirme', message: 'Hackathon Orientation IA valide pour mardi.', time: '42 min', tone: 'emerald' },
];