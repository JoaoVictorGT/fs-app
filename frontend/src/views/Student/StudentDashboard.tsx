import { useEffect, useState } from 'react';
import { useAuth } from '../../controllers/useAuth';
import { useBookings } from '../../controllers/useBookings';
import { slotService } from '../../services/slot.service';
import { teacherService } from '../../services/teacher.service';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { BookingCard } from '../components/BookingCard';
import { Slot, Teacher } from '../../models';

export function StudentDashboard() {
  const { user } = useAuth();
  const { bookings, loading, cancel } = useBookings('student');
  const [slots, setSlots] = useState<Record<string, Slot>>({});
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [cancelLoading, setCancelLoading] = useState<string | null>(null);

  useEffect(() => {
    const ids = [...new Set(bookings.map(b => b.slotId))];
    Promise.all(ids.map(id => slotService.getById(id))).then(results => {
      const map: Record<string, Slot> = {};
      results.forEach(s => { map[s.id] = s; });
      setSlots(map);
    }).catch(() => {});
  }, [bookings]);

  useEffect(() => {
    const tid = user?.teacherId;
    if (tid) teacherService.getById(tid).then(setTeacher).catch(() => {});
  }, [user?.teacherId]);

  const confirmed = bookings.filter(b => b.status === 'confirmed');
  const upcoming = confirmed.filter(b => {
    const slot = slots[b.slotId];
    if (!slot) return true;
    return new Date(`${slot.date}T${slot.startTime}`) >= new Date();
  });

  const handleCancel = async (bookingId: string) => {
    if (!confirm('Cancelar este agendamento?')) return;
    setCancelLoading(bookingId);
    try {
      await cancel(bookingId);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao cancelar agendamento');
    } finally {
      setCancelLoading(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container main-content">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Olá, {user?.name.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">Seus próximos treinos</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Aulas confirmadas</div>
          <div className="stat-value">{confirmed.length}</div>
          <div className="stat-sub">agendamentos ativos</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Próximas aulas</div>
          <div className="stat-value">{upcoming.length}</div>
          <div className="stat-sub">a partir de hoje</div>
        </div>
        {teacher && (
          <div className="stat-card card-accent">
            <div className="stat-label">Seu professor</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginTop: 4 }}>{teacher.name}</div>
            <div className="stat-sub">{teacher.academy}</div>
          </div>
        )}
      </div>

      <div className="section-title">Próximas aulas</div>

      {upcoming.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏃</div>
          <h3>Nenhuma aula agendada</h3>
          <p>Acesse a aba "Horários" para agendar uma aula</p>
        </div>
      ) : (
        <div className="booking-list">
          {upcoming.map(booking => (
            <BookingCard
              key={booking.id}
              booking={booking}
              slot={slots[booking.slotId]}
              onCancel={b => handleCancel(b.id)}
              loading={cancelLoading === booking.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
