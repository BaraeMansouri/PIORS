# PIORS Frontend

Frontend React premium de la plateforme PIORS.

## Stack

- React + Vite
- Tailwind CSS
- Framer Motion
- Vanta.js + Three.js
- Axios avec interceptor token
- React Router v6
- Chart.js

## Dossiers

- `src/components`
- `src/pages`
- `src/layouts`
- `src/services`
- `src/context`
- `src/hooks`
- `src/assets`

## Fonctionnalites incluses

- Layout principal glassmorphism avec background anime
- Sidebar retractable
- Navbar fixe avec notifications
- Authentification login/register
- Protected routes par role
- Dashboards Admin / Formateur / Stagiaire
- Modules Cours / Events / Stages
- Community safe-by-design
- Orientation IA simulee via wizard
- Chatbot IA type ChatGPT
- Fallback mock data si l'API n'est pas encore totalement branchee

## Installation

```bash
cd frontend
npm install
npm run dev
```

## Build verification

```bash
npm run build
```

Le build a ete verifie avec succes.

## API

Le frontend pointe par defaut vers :

- `http://127.0.0.1:8000/api`

Variable optionnelle :

```env
VITE_API_URL=http://127.0.0.1:8000/api
```