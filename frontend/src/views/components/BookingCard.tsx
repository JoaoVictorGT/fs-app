import { Booking, Slot } from '../../models';

interface Props {
  booking: Booking;
  slot?: Slot;
  onCancel?: (booking: Booking) => void;
  loading?: boolean;
  showStudent?: boolean;
  studentName?: string;
}

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return `${WEEKDAYS[date.getDay()]}, ${d} ${MONTHS[m - 1]}`;
}

function canCancel(slot?: Slot): boolean {
  if (!slot || slot.status === 'cancelled') return false;
  const dt = new Date(`${slot.date}T${slot.startTime}:00`);
  const hours = (dt.getTime() - Date.now()) / (1000 * 60 * 60);
  return hours > 24;
}

export function BookingCard({ booking, slot, onCancel, loading, showStudent, studentName }: Props) {
  const cancellable = canCancel(slot);

  return (
    <div className={`booking-card ${booking.status === 'cancelled' ? 'cancelled' : ''}`}>
      <div className="booking-card-info">
        <div className="booking-card-title">
          {slot ? `${slot.startTime} – ${slot.endTime}` : 'Carregando...'}
        </div>
        <div className="booking-card-meta">
          {slot && <span>📅 {formatDate(slot.date)}</span>}
          {slot && <span>• {slot.type === 'individual' ? 'Individual' : 'Grupo'}</span>}
          {showStudent && studentName && <span>• {studentName}</span>}
        </div>
      </div>

      <div className="booking-card-actions">
        <span className={`badge badge-${booking.status}`}>
          {booking.status === 'confirmed' ? '● Confirmado' : '● Cancelado'}
        </span>

        {booking.status === 'confirmed' && onCancel && (
          <button
            className="btn btn-danger btn-sm"
            onClick={() => onCancel(booking)}
            disabled={loading || !cancellable}
            title={!cancellable ? 'Cancelamento só é permitido com mais de 24h de antecedência' : ''}
          >
            {loading ? <span className="spinner spinner-sm" /> : 'Cancelar'}
          </button>
        )}
      </div>
    </div>
  );
}
