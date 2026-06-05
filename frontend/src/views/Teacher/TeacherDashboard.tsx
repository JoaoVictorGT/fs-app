import { useEffect, useState } from 'react';
import { useAuth } from '../../controllers/useAuth';
import { useSlots } from '../../controllers/useSlots';
import { useBookings } from '../../controllers/useBookings';
import { teacherService } from '../../services/teacher.service';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { SlotCard } from '../components/SlotCard';
import { Student } from '../../models';

export function TeacherDashboard() {
  const { user } = useAuth();
  const { slots, loading: slotsLoading } = useSlots({ teacherId: user?.profileId });
  const { bookings, loading: bookingsLoading } = useBookings('teacher');
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    if (user?.profileId) {
      teacherService.getStudents(user.profileId).then(setStudents).catch(() => {});
    }
  }, [user?.profileId]);

  const availableSlots = slots.filter(s => s.status === 'available');
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  const upcomingSlots = availableSlots.slice(0, 3);

  if (slotsLoading || bookingsLoading) return <LoadingSpinner />;

  return (
    <div className="container main-content">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Olá, {user?.name.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">Visão geral da sua agenda</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Horários disponíveis</div>
          <div className="stat-value">{availableSlots.length}</div>
          <div className="stat-sub">próximos slots livres</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Agendamentos confirmados</div>
          <div className="stat-value">{confirmedBookings.length}</div>
          <div className="stat-sub">total ativo</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Alunos</div>
          <div className="stat-value">{students.length}</div>
          <div className="stat-sub">vinculados a você</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total de horários</div>
          <div className="stat-value">{slots.length}</div>
          <div className="stat-sub">criados</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div>
          <div className="section-title">Próximos horários</div>
          {upcomingSlots.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 0' }}>
              <div className="empty-icon">📅</div>
              <h3>Sem horários disponíveis</h3>
              <p>Crie novos slots na aba Horários</p>
            </div>
          ) : (
            <div className="slot-grid" style={{ gridTemplateColumns: '1fr' }}>
              {upcomingSlots.map(slot => (
                <SlotCard key={slot.id} slot={slot} mode="teacher" />
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="section-title">Alunos vinculados</div>
          {students.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 0' }}>
              <div className="empty-icon">👥</div>
              <h3>Sem alunos</h3>
              <p>Alunos de grupo se cadastram pela plataforma</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {students.map(student => (
                <div key={student.id} className="card" style={{ padding: '14px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>{student.name}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{student.email}</div>
                    </div>
                    <span className={`badge badge-${student.type === 'personal' ? 'individual' : 'group'}`}>
                      {student.type === 'personal' ? 'Personal' : 'Grupo'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
