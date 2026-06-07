import { useEffect, useState } from 'react';
import { useBookings } from '../../controllers/useBookings';
import { slotService } from '../../services/slot.service';
import { Slot } from '../../models';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { BookingCard } from '../components/BookingCard';

export function StudentBookings() {
  const { bookings, loading, error, cancel } = useBookings('student');
  const [slots, setSlots] = useState<Record<string, Slot>>({});
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'cancelled'>('all');
  const [cancelLoading, setCancelLoading] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    const ids = [...new Set(bookings.map(b => b.slotId))];
    Promise.all(ids.map(id => slotService.getById(id))).then(results => {
      const map: Record<string, Slot> = {};
      results.forEach(s => { map[s.id] = s; });
      setSlots(map);
    }).catch(() => {});
  }, [bookings]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleCancel = async (bookingId: string) => {
    if (!confirm('Cancelar este agendamento? Essa ação não pode ser desfeita.')) return;
    setCancelLoading(bookingId);
    try {
      await cancel(bookingId);
      showToast('Agendamento cancelado com sucesso');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao cancelar agendamento');
    } finally {
      setCancelLoading(null);
    }
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div className="container main-content">
      {toast && (
        <div className="alert alert-success" style={{ position: 'fixed', top: 80, right: 24, zIndex: 300, minWidth: 260 }}>
          ✓ {toast}
        </div>
      )}

      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Meus Agendamentos</h1>
          <p className="page-subtitle">Histórico de aulas agendadas</p>
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
          <p>Acesse &quot;Horários&quot; para agendar sua primeira aula</p>
        </div>
      )}

      {!loading && (
        <div className="booking-list">
          {filtered.map(booking => (
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
