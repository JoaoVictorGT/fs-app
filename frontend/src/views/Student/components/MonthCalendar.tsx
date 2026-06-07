import { useState, useEffect, useRef } from 'react';
import { Booking, Slot } from '../../../models';
import { bookingService } from '../../../services/booking.service';
import { slotService } from '../../../services/slot.service';

interface DayData {
  date: Date;
  dateStr: string;
  otherMonth: boolean;
  isToday: boolean;
  entries: { booking: Booking; slot: Slot }[];
  hasBooking: boolean;
  hasConfirmed: boolean;
}

interface Props {
  studentId: string;
  teacherId?: string;
}

const WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const MONTHS = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
];

function fmt(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

export function MonthCalendar({ studentId }: Props) {
  const now = new Date();
  const [year, setYear]   = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0-indexed
  const [days, setDays]   = useState<DayData[]>([]);
  const [selected, setSelected] = useState<DayData | null>(null);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });
  const popoverRef = useRef<HTMLDivElement>(null);

  // Build day grid whenever month/year changes
  useEffect(() => {
    buildDays();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month, studentId]);

  // Close popover on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setSelected(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  async function buildDays() {
    // All bookings for this student
    let bookings: Booking[] = [];
    try { bookings = await bookingService.getMyBookings(); } catch { /* ignore */ }

    // Fetch slot details for each booking
    const slotMap: Record<string, Slot> = {};
    await Promise.all(
      [...new Set(bookings.map(b => b.slotId))].map(async id => {
        try { slotMap[id] = await slotService.getById(id); } catch { /* ignore */ }
      })
    );

    // Build date-keyed map
    const dateMap: Record<string, { booking: Booking; slot: Slot }[]> = {};
    for (const b of bookings) {
      const slot = slotMap[b.slotId];
      if (!slot) continue;
      if (!dateMap[slot.date]) dateMap[slot.date] = [];
      dateMap[slot.date].push({ booking: b, slot });
    }

    // First day of month (Monday-first grid)
    const firstDay = new Date(year, month, 1);
    const startDow = (firstDay.getDay() + 6) % 7; // 0=Mon
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayStr = fmt(now);

    const grid: DayData[] = [];

    // Padding days from previous month
    for (let i = startDow - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      const ds = fmt(d);
      grid.push({ date: d, dateStr: ds, otherMonth: true, isToday: false, entries: dateMap[ds] ?? [], hasBooking: false, hasConfirmed: false });
    }

    // Days of current month
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const ds = fmt(date);
      const entries = dateMap[ds] ?? [];
      grid.push({
        date,
        dateStr: ds,
        otherMonth: false,
        isToday: ds === todayStr,
        entries,
        hasBooking: entries.some(e => e.booking.status === 'confirmed'),
        hasConfirmed: entries.some(e => e.booking.attendanceConfirmed),
      });
    }

    // Padding to complete last row
    const remaining = (7 - (grid.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const date = new Date(year, month + 1, d);
      const ds = fmt(date);
      grid.push({ date, dateStr: ds, otherMonth: true, isToday: false, entries: dateMap[ds] ?? [], hasBooking: false, hasConfirmed: false });
    }

    setDays(grid);
    setSelected(null);
  }

  function navigate(delta: number) {
    let m = month + delta;
    let y = year;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setMonth(m);
    setYear(y);
  }

  function handleDayClick(day: DayData, e: React.MouseEvent) {
    if (day.entries.length === 0) { setSelected(null); return; }
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const containerRect = (e.currentTarget as HTMLElement).closest('.month-calendar')!.getBoundingClientRect();
    setPopoverPos({
      top: rect.bottom - containerRect.top + 4,
      left: Math.min(rect.left - containerRect.left, containerRect.width - 220),
    });
    setSelected(selected?.dateStr === day.dateStr ? null : day);
  }

  return (
    <div className="month-calendar">
      {/* Header */}
      <div className="cal-header">
        <button className="btn btn-ghost btn-icon" onClick={() => navigate(-1)}>‹</button>
        <span className="cal-title">{MONTHS[month]} {year}</span>
        <button className="btn btn-ghost btn-icon" onClick={() => navigate(1)}>›</button>
      </div>

      {/* Weekday labels */}
      <div className="cal-weekdays">
        {WEEKDAYS.map(d => <div key={d} className="cal-weekday">{d}</div>)}
      </div>

      {/* Day grid */}
      <div className="cal-grid">
        {days.map((day, i) => (
          <div
            key={i}
            className={[
              'cal-day',
              day.otherMonth ? 'other-month' : '',
              day.isToday ? 'today' : '',
              day.hasConfirmed ? 'confirmed' : day.hasBooking ? 'booked' : '',
              day.entries.length > 0 ? 'clickable' : '',
            ].filter(Boolean).join(' ')}
            onClick={e => handleDayClick(day, e)}
          >
            <span className="cal-day-num">{day.date.getDate()}</span>
            {day.hasConfirmed && <span className="cal-check">✓</span>}
            {day.hasBooking && !day.hasConfirmed && <span className="cal-dot" />}
          </div>
        ))}
      </div>

      {/* Popover */}
      {selected && selected.entries.length > 0 && (
        <div
          ref={popoverRef}
          className="cal-popover"
          style={{ top: popoverPos.top, left: popoverPos.left }}
        >
          {selected.entries.map(({ booking, slot }) => (
            <div key={booking.id} className="cal-popover-entry">
              <div className="cal-popover-time">{slot.startTime} – {slot.endTime}</div>
              <div className="cal-popover-meta">
                <span className={`badge badge-${slot.type}`}>
                  {slot.type === 'individual' ? 'Individual' : 'Grupo'}
                </span>
                {booking.attendanceConfirmed && (
                  <span className="badge badge-available">✓ Presença confirmada</span>
                )}
              </div>
              {slot.description && <div className="cal-popover-desc">{slot.description}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
