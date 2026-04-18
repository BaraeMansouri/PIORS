import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import AppShell from './layouts/AppShell';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import TrainerDashboard from './pages/dashboards/TrainerDashboard';
import StudentDashboard from './pages/dashboards/StudentDashboard';
import CoursesPage from './pages/modules/CoursesPage';
import EventsPage from './pages/modules/EventsPage';
import InternshipsPage from './pages/modules/InternshipsPage';
import CommunityPage from './pages/modules/CommunityPage';
import OrientationPage from './pages/modules/OrientationPage';
import ProfilePage from './pages/profile/ProfilePage';
import { useAuth } from './context/AuthContext';

function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to={`/${user?.role === 'formateur' ? 'trainer' : user?.role === 'admin' ? 'admin' : 'student'}`} replace />;
  }

  return children;
}

export default function App() {
  const { isAuthenticated, user } = useAuth();
  const homeRoute = user?.role === 'admin' ? '/admin' : user?.role === 'formateur' ? '/trainer' : '/student';

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to={homeRoute} replace />} />
      <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to={homeRoute} replace />} />

      <Route path="/" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route index element={<Navigate to={homeRoute || '/student'} replace />} />
        <Route path="admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="trainer" element={<ProtectedRoute allowedRoles={['formateur', 'admin']}><TrainerDashboard /></ProtectedRoute>} />
        <Route path="student" element={<ProtectedRoute allowedRoles={['stagiaire', 'admin', 'formateur']}><StudentDashboard /></ProtectedRoute>} />
        <Route path="courses" element={<ProtectedRoute><CoursesPage /></ProtectedRoute>} />
        <Route path="events" element={<ProtectedRoute><EventsPage /></ProtectedRoute>} />
        <Route path="internships" element={<ProtectedRoute><InternshipsPage /></ProtectedRoute>} />
        <Route path="community" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
        <Route path="orientation" element={<ProtectedRoute><OrientationPage /></ProtectedRoute>} />
        <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}