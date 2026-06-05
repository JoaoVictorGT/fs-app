import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../controllers/useAuth';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const isTeacher = user.role === 'teacher';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <div className="navbar-brand">
          <div className="brand-icon">🏋️</div>
          Studio <span className="brand-accent">Fitness</span>
        </div>

        <div className="navbar-nav">
          {isTeacher ? (
            <>
              <NavLink to="/teacher/dashboard" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                Dashboard
              </NavLink>
              <NavLink to="/teacher/slots" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                Horários
              </NavLink>
              <NavLink to="/teacher/bookings" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                Agendamentos
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/student/dashboard" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                Dashboard
              </NavLink>
              <NavLink to="/student/slots" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                Horários
              </NavLink>
              <NavLink to="/student/bookings" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                Meus Agendamentos
              </NavLink>
            </>
          )}
        </div>

        <div className="navbar-actions">
          <div className="user-badge">
            <span>{user.name.split(' ')[0]}</span>
            <span className="role-chip">{isTeacher ? 'Professor' : 'Aluno'}</span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </div>
    </nav>
  );
}
