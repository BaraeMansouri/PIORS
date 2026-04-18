import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

const pickStoredUser = (nextUser) => {
  if (!nextUser) return nextUser;

  const {
    id,
    name,
    email,
    role,
    avatar,
    className,
    filiere,
    city,
    bio,
    phone,
    address,
    class_id,
    filiere_id,
    orientation_score,
    average_grade,
    absence_count,
  } = nextUser;

  return {
    id,
    name,
    email,
    role,
    avatar,
    className,
    filiere,
    city,
    bio,
    phone,
    address,
    class_id,
    filiere_id,
    orientation_score,
    average_grade,
    absence_count,
  };
};

const sanitizeUser = (nextUser) => {
  if (!nextUser) return nextUser;

  const safeUser = pickStoredUser(nextUser);
  if (typeof safeUser.avatar === 'string' && safeUser.avatar.startsWith('data:') && safeUser.avatar.length > 5000) {
    safeUser.avatar = null;
  }

  return safeUser;
};

const loadStoredUser = () => {
  try {
    const raw = localStorage.getItem('piors_user');
    return raw ? sanitizeUser(JSON.parse(raw)) : null;
  } catch (error) {
    localStorage.removeItem('piors_user');
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadStoredUser);
  const [token, setToken] = useState(() => localStorage.getItem('piors_token'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      authService.fetchProfile().then((profile) => {
        const safeProfile = sanitizeUser(profile);
        setUser(safeProfile);
        localStorage.setItem('piors_user', JSON.stringify(safeProfile));
      }).catch(() => {
        localStorage.removeItem('piors_token');
        localStorage.removeItem('piors_user');
        setUser(null);
        setToken(null);
      });
    }
  }, [token]);

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('piors:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('piors:unauthorized', handleUnauthorized);
  }, []);

  const persistSession = (nextUser, nextToken) => {
    const safeUser = sanitizeUser(nextUser);
    setUser(safeUser);
    setToken(nextToken);
    try {
      localStorage.setItem('piors_user', JSON.stringify(safeUser));
      localStorage.setItem('piors_token', nextToken);
    } catch (error) {
      localStorage.removeItem('piors_user');
      localStorage.removeItem('piors_token');
      throw new Error('Impossible de sauvegarder la session dans le navigateur.');
    }
  };

  const login = async (values) => {
    setLoading(true);
    try {
      const result = await authService.login(values);
      persistSession(result.user, result.token);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const register = async (values) => {
    setLoading(true);
    try {
      const result = await authService.register(values);
      if (result.token) {
        persistSession(result.user, result.token);
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (payload) => {
    setLoading(true);
    try {
      const updated = await authService.updateProfile(payload);
      const nextUser = sanitizeUser({ ...user, ...updated });
      setUser(nextUser);
      localStorage.setItem('piors_user', JSON.stringify(nextUser));
      return nextUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
    } finally {
      setLoading(false);
      setUser(null);
      setToken(null);
      localStorage.removeItem('piors_user');
      localStorage.removeItem('piors_token');
    }
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(user && token),
      login,
      register,
      updateProfile,
      logout,
    }),
    [loading, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
