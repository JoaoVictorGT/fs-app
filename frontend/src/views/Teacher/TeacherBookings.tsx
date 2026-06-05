import { useEffect, useState } from 'react';
import { useBookings } from '../../controllers/useBookings';
import { slotService } from '../../services/slot.service';
import { Slot, Booking } from '../../models';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { BookingCard } from '../components/BookingCard';

export function TeacherBookings() {
  const { bookings, loading, error } = useBookings('teacher');
  const [slots, setSlots] = useState<Record<string, Slot>>({});
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'cancelled'>('confirmed');

  useEffect(() => {
    const slotIds = [...new Set(bookings.map(b => b.slotId))];
    Promise.all(slotIds.map(id => slotService.getById(id))).then(results => {
      const map: Record<string, Slot> = {};
      results.forEach(s => { map[s.id] = s; });
      setSlots(map);
    }).catch(() => {});
  }, [bookings]);

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div className="container main-content">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Agendamentos</h1>
          <p className="page-subtitle">Todos os agendamentos dos seus horários</p>
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
          {filtered.map(booking => (
            <BookingCard
              key={booking.id}
              booking={booking}
              slot={slots[booking.slotId]}
              showStudent
              studentName={booking.studentId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
