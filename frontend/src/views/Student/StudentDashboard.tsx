import { useEffect, useState } from 'react';
import { useAuth } from '../../controllers/useAuth';
import { useBookings } from '../../controllers/useBookings';
import { useStreak } from '../../controllers/useStreak';
import { slotService } from '../../services/slot.service';
import { teacherService } from '../../services/teacher.service';
import api from '../../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { BookingCard } from '../components/BookingCard';
import { StreakWidget } from './components/StreakWidget';
import { MonthCalendar } from './components/MonthCalendar';
import { Slot, Teacher } from '../../models';

export function StudentDashboard() {
  const { user } = useAuth();
  const { bookings, loading, cancel } = useBookings('student');
  const { streak, loading: streakLoading } = useStreak(user?.profileId);
  const [slots, setSlots] = useState<Record<string, Slot>>({});
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [cancelLoading, setCancelLoading] = useState<string | null>(null);
  const [exportLoading, setExportLoading] = useState<string | null>(null);
  const [toast, setToast] = useState('');

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

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const handleCancel = async (bookingId: string) => {
    if (!confirm('Cancelar este agendamento?')) return;
    setCancelLoading(bookingId);
    try {
      await cancel(bookingId);
      showToast('Agendamento cancelado com sucesso');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao cancelar');
    } finally {
      setCancelLoading(null);
    }
  };

  const handleAddCalendar = async (bookingId: string, provider: 'google' | 'outlook') => {
    setExportLoading(`${bookingId}-${provider}`);
    try {
      await api.post(`/bookings/${bookingId}/calendar/${provider}`);
      showToast(`Evento adicionado ao ${provider === 'google' ? 'Google Calendar' : 'Outlook'}! (mock)`);
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Erro ao exportar evento');
    } finally {
      setExportLoading(null);
    }
  };

  const confirmed = bookings.filter(b => b.status === 'confirmed');
  const upcoming = confirmed.filter(b => {
    const slot = slots[b.slotId];
    if (!slot) return true;
    return new Date(`${slot.date}T${slot.startTime}`) >= new Date();
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container main-content">
      {toast && (
        <div className="alert alert-success" style={{ position: 'fixed', top: 80, right: 24, zIndex: 300, minWidth: 300 }}>
          ✓ {toast}
        </div>
      )}

      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Olá, {user?.name.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">Seus próximos treinos</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
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

      {/* Streak + Calendar */}
      <div className="dashboard-grid" style={{ marginBottom: 32 }}>
        <div>
          <div className="section-title">Sequência de treinos</div>
          <StreakWidget streak={streak} loading={streakLoading} />
        </div>
        <div>
          <div className="section-title">Calendário de aulas</div>
          {user?.profileId && (
            <MonthCalendar studentId={user.profileId} teacherId={user.teacherId} />
          )}
        </div>
      </div>

      {/* Upcoming bookings */}
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
            <div key={booking.id}>
              <BookingCard
                booking={booking}
                slot={slots[booking.slotId]}
                onCancel={b => handleCancel(b.id)}
                loading={cancelLoading === booking.id}
              />
              {/* Calendar export buttons */}
              {booking.status === 'confirmed' && (
                <div style={{ display: 'flex', gap: 8, marginTop: 6, paddingLeft: 4 }}>
                  <button
                    className={`cal-export-btn google${booking.calendarEvents?.google ? ' added' : ''}`}
                    onClick={() => handleAddCalendar(booking.id, 'google')}
                    disabled={exportLoading === `${booking.id}-google`}
                  >
                    {booking.calendarEvents?.google ? '✓ Google Calendar' : '+ Google Calendar'}
                  </button>
                  <button
                    className={`cal-export-btn outlook${booking.calendarEvents?.outlook ? ' added' : ''}`}
                    onClick={() => handleAddCalendar(booking.id, 'outlook')}
                    disabled={exportLoading === `${booking.id}-outlook`}
                  >
                    {booking.calendarEvents?.outlook ? '✓ Outlook' : '+ Outlook'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
