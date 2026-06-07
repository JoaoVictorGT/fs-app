import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthCtx, useAuthProvider } from './controllers/useAuth';
import { useAuth } from './controllers/useAuth';
import { Navbar } from './views/components/Navbar';
import { Login } from './views/Login/Login';
import { StudentRegister } from './views/Student/StudentRegister';
import { TeacherDashboard } from './views/Teacher/TeacherDashboard';
import { TeacherSlots } from './views/Teacher/TeacherSlots';
import { TeacherBookings } from './views/Teacher/TeacherBookings';
import { StudentDashboard } from './views/Student/StudentDashboard';
import { StudentSlots } from './views/Student/StudentSlots';
import { StudentBookings } from './views/Student/StudentBookings';

function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: 'teacher' | 'student' }) {
  const { user, loading } = useAuth();
  // Aguarda o Firebase Auth resolver a sessão antes de redirecionar
  if (loading) return <div className="loading-fullscreen"><span className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'} replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <div className="page">
      <Navbar />
      <Routes>
        <Route path="/login" element={user ? <Navigate to={user.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'} replace /> : <Login />} />
        <Route path="/register" element={<StudentRegister />} />

        <Route path="/teacher/dashboard" element={<ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>} />
        <Route path="/teacher/slots" element={<ProtectedRoute role="teacher"><TeacherSlots /></ProtectedRoute>} />
        <Route path="/teacher/bookings" element={<ProtectedRoute role="teacher"><TeacherBookings /></ProtectedRoute>} />

        <Route path="/student/dashboard" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/slots" element={<ProtectedRoute role="student"><StudentSlots /></ProtectedRoute>} />
        <Route path="/student/bookings" element={<ProtectedRoute role="student"><StudentBookings /></ProtectedRoute>} />

        <Route path="/" element={
          user
            ? <Navigate to={user.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'} replace />
            : <Navigate to="/login" replace />
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  const auth = useAuthProvider();

  return (
    <AuthCtx.Provider value={auth}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthCtx.Provider>
  );
}
