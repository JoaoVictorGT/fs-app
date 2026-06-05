import { useState } from 'react';
import { useAuth } from '../../controllers/useAuth';
import { useSlots } from '../../controllers/useSlots';
import { useBookings } from '../../controllers/useBookings';
import { Slot } from '../../models';
import { SlotCard } from '../components/SlotCard';
import { LoadingSpinner } from '../components/LoadingSpinner';

export function StudentSlots() {
  const { user } = useAuth();
  const teacherId = user?.teacherId;
  const { slots, loading, error } = useSlots({ teacherId });
  const { book } = useBookings('student');
  const [bookingLoading, setBookingLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [dateFilter, setDateFilter] = useState('');

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const handleBook = async (slot: Slot) => {
    if (!confirm(`Agendar aula de ${slot.startTime} – ${slot.endTime} no dia ${slot.date}?`)) return;
    setBookingLoading(slot.id);
    try {
      await book(slot.id);
      showToast('success', 'Aula agendada com sucesso! Você receberá um e-mail de confirmação.');
    } catch (err: any) {
      showToast('error', err.response?.data?.error || 'Erro ao agendar');
    } finally {
      setBookingLoading(null);
    }
  };

  const available = slots.filter(s => s.status === 'available');
  const filtered = dateFilter ? available.filter(s => s.date === dateFilter) : available;

  return (
    <div className="container main-content">
      {toast && (
        <div
          className={`alert alert-${toast.type}`}
          style={{ position: 'fixed', top: 80, right: 24, zIndex: 300, minWidth: 320 }}
        >
          {toast.type === 'success' ? '✓' : '⚠'} {toast.msg}
        </div>
      )}

      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Horários disponíveis</h1>
          <p className="page-subtitle">Escolha um horário para agendar sua aula</p>
        </div>
      </div>

      <div className="filters-bar">
        <input
          type="date"
          className="form-input"
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
          style={{ width: 180 }}
        />
        {dateFilter && (
          <button className="btn btn-ghost btn-sm" onClick={() => setDateFilter('')}>
            Limpar filtro
          </button>
        )}
      </div>

      {loading && <LoadingSpinner />}
      {error && <div className="alert alert-error">{error}</div>}
      {!teacherId && !loading && (
        <div className="alert alert-warning">Você não possui um professor vinculado.</div>
      )}

      {!loading && filtered.length === 0 && teacherId && (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <h3>Nenhum horário disponível</h3>
          <p>Seu professor ainda não abriu novos horários</p>
        </div>
      )}

      {!loading && (
        <div className="slot-grid">
          {filtered.map(slot => (
            <SlotCard
              key={slot.id}
              slot={slot}
              mode="student"
              onBook={handleBook}
              loading={bookingLoading === slot.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
