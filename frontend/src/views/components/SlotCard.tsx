import { Slot } from '../../models';

interface Props {
  slot: Slot;
  onBook?: (slot: Slot) => void;
  onEdit?: (slot: Slot) => void;
  onCancel?: (slot: Slot) => void;
  onDelete?: (slot: Slot) => void;
  mode: 'teacher' | 'student';
  loading?: boolean;
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return `${WEEKDAYS[date.getDay()]}, ${d} ${MONTHS[m - 1]}`;
}

function capacityPercent(slot: Slot) {
  return (slot.currentBookings / slot.capacity) * 100;
}

export function SlotCard({ slot, onBook, onEdit, onCancel, onDelete, mode, loading }: Props) {
  const pct = capacityPercent(slot);

  return (
    <div className={`slot-card ${slot.status}`}>
      <div className="slot-card-header">
        <div>
          <div className="slot-card-time">{slot.startTime} – {slot.endTime}</div>
          <div className="slot-card-date">{formatDate(slot.date)}</div>
        </div>
        <div className="slot-card-badges">
          <span className={`badge badge-${slot.status}`}>
            {slot.status === 'available' && '● Disponível'}
            {slot.status === 'full' && '● Lotado'}
            {slot.status === 'cancelled' && '● Cancelado'}
          </span>
          <span className={`badge badge-${slot.type}`}>
            {slot.type === 'individual' ? 'Individual' : 'Grupo'}
          </span>
        </div>
      </div>

      {slot.description && (
        <div className="slot-card-desc">{slot.description}</div>
      )}

      <div className="slot-card-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
          <div className="capacity-bar">
            <div
              className={`capacity-fill${pct >= 80 ? ' danger' : ''}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="slot-capacity">
            {slot.currentBookings}/{slot.capacity}
          </span>
        </div>

        {mode === 'student' && slot.status === 'available' && onBook && (
          <button className="btn btn-primary btn-sm" onClick={() => onBook(slot)} disabled={loading}>
            {loading ? <span className="spinner spinner-sm" /> : 'Agendar'}
          </button>
        )}

        {mode === 'teacher' && slot.status !== 'cancelled' && (
          <div style={{ display: 'flex', gap: 6 }}>
            {onEdit && (
              <button className="btn btn-outline btn-sm" onClick={() => onEdit(slot)}>
                Editar
              </button>
            )}
            {onCancel && (
              <button className="btn btn-danger btn-sm" onClick={() => onCancel(slot)}>
                Cancelar
              </button>
            )}
          </div>
        )}

        {mode === 'teacher' && slot.status === 'cancelled' && slot.currentBookings === 0 && onDelete && (
          <button className="btn btn-ghost btn-sm" style={{ color: 'var(--text-muted)' }} onClick={() => onDelete(slot)}>
            Excluir
          </button>
        )}
      </div>
    </div>
  );
}
