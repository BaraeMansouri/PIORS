export function useRoleTheme(role) {
  const map = {
    admin: {
      accent: 'from-cyan/80 to-neon/80',
      badge: 'text-cyan border-cyan/30 bg-cyan/10',
      title: 'Pilotage intelligent du campus',
    },
    formateur: {
      accent: 'from-neon/80 to-cyan/70',
      badge: 'text-neon border-neon/30 bg-neon/10',
      title: 'Suivi pedagogique augmentee',
    },
    stagiaire: {
      accent: 'from-emerald/80 to-cyan/70',
      badge: 'text-emerald border-emerald/30 bg-emerald/10',
      title: 'Trajectoire personnelle et orientation IA',
    },
  };

  return map[role] ?? map.stagiaire;
}