import { useEffect, useState } from 'react';
import { useBookings } from '../../controllers/useBookings';
import { slotService } from '../../services/slot.service';
import api from '../../services/api';
import { Slot, Booking } from '../../models';
import { LoadingSpinner } from '../components/LoadingSpinner';

export function TeacherBookings() {
  const { bookings, loading, error, refetch } = useBookings('teacher');
  const [slots, setSlots] = useState<Record<string, Slot>>({});
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'cancelled'>('confirmed');
  const [attendanceLoading, setAttendanceLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    const slotIds = [...new Set(bookings.map(b => b.slotId))];
    Promise.all(slotIds.map(id => slotService.getById(id))).then(results => {
      const map: Record<string, Slot> = {};
      results.forEach(s => { map[s.id] = s; });
      setSlots(map);
    }).catch(() => {});
  }, [bookings]);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const handleConfirmAttendance = async (booking: Booking) => {
    if (!confirm(`Confirmar presença de ${booking.studentId}?`)) return;
    setAttendanceLoading(booking.id);
    try {
      await api.patch(`/bookings/${booking.id}/confirm-attendance`);
      showToast('success', 'Presença confirmada! Streak do aluno atualizado.');
      refetch();
    } catch (err: any) {
      showToast('error', err.response?.data?.error || 'Erro ao confirmar presença');
    } finally {
      setAttendanceLoading(null);
    }
  };

  function canConfirmAttendance(booking: Booking): boolean {
    if (booking.attendanceConfirmed || booking.status !== 'confirmed') return false;
    const slot = slots[booking.slotId];
    if (!slot) return false;
    const slotEnd = new Date(`${slot.date}T${slot.endTime}:00`);
    return slotEnd <= new Date();
  }

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div className="container main-content">
      {toast && (
        <div
          className={`alert alert-${toast.type}`}
          style={{ position: 'fixed', top: 80, right: 24, zIndex: 300, minWidth: 300 }}
        >
          {toast.type === 'success' ? '✓' : '⚠'} {toast.msg}
        </div>
      )}

      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Agendamentos</h1>
          <p className="page-subtitle">Confirme presenças e acompanhe agendamentos</p>
        </div>
      </div>

      <div className="filters-bar">
        {(['all', 'confirmed', 'cancelled'] as const).map(f => (
          <button
            key={f}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'Todos' : f === 'confirmed' ? 'Confirmados' : 'Cancelados'}
            {' '}
            <span style={{ opacity: 0.7 }}>
              ({f === 'all' ? bookings.length : bookings.filter(b => b.status === f).length})
            </span>
          </button>
        ))}
      </div>

      {loading && <LoadingSpinner />}
      {error && <div className="alert alert-error">{error}</div>}

      {!loading && filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>Nenhum agendamento encontrado</h3>
          <p>Os agendamentos aparecerão aqui quando os alunos reservarem horários</p>
        </div>
      )}

      {!loading && (
        <div className="booking-list">
          {filtered.map(booking => {
            const slot = slots[booking.slotId];
            return (
              <div key={booking.id} className={`booking-card ${booking.status === 'cancelled' ? 'cancelled' : ''}`}>
                <div className="booking-card-info">
                  <div className="booking-card-title">
                    {slot ? `${slot.startTime} – ${slot.endTime}` : '…'}
                  </div>
                  <div className="booking-card-meta">
                    {slot && <span>📅 {slot.date}</span>}
                    {slot && <span>• {slot.type === 'individual' ? 'Individual' : 'Grupo'}</span>}
                    <span>• Aluno: {booking.studentId}</span>
                  </div>
                </div>

                <div className="booking-card-actions">
                  {booking.attendanceConfirmed ? (
                    <span className="attendance-confirmed">✓ Presença confirmada</span>
                  ) : (
                    <span className={`badge badge-${booking.status}`}>
                      {booking.status === 'confirmed' ? '● Confirmado' : '● Cancelado'}
                    </span>
                  )}

                  {canConfirmAttendance(booking) && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleConfirmAttendance(booking)}
                      disabled={attendanceLoading === booking.id}
                    >
                      {attendanceLoading === booking.id
                        ? <span className="spinner spinner-sm" />
                        : '✓ Confirmar presença'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
