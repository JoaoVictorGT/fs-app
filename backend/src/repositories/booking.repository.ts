import { v4 as uuid } from 'uuid';
import { Booking, CreateBookingDTO, CalendarEvent } from '../models/booking.model';
import { mockBookings } from '../data/mockData';

// NOTE: Replace with FirestoreBookingRepository when Firebase credentials are available.
export class BookingRepository {
  private store: Map<string, Booking>;

  constructor() {
    this.store = new Map(mockBookings.map(b => [b.id, b]));
  }

  async findById(id: string): Promise<Booking | null> {
    return this.store.get(id) ?? null;
  }

  async findAll(filter?: { studentId?: string; teacherId?: string; slotId?: string; status?: string }): Promise<Booking[]> {
    let result = Array.from(this.store.values());
    if (filter?.studentId) result = result.filter(b => b.studentId === filter.studentId);
    if (filter?.teacherId) result = result.filter(b => b.teacherId === filter.teacherId);
    if (filter?.slotId)    result = result.filter(b => b.slotId === filter.slotId);
    if (filter?.status)    result = result.filter(b => b.status === filter.status);
    return result;
  }

  async findByStudentAndSlot(studentId: string, slotId: string): Promise<Booking | null> {
    return Array.from(this.store.values()).find(
      b => b.studentId === studentId && b.slotId === slotId && b.status === 'confirmed'
    ) ?? null;
  }

  async create(data: CreateBookingDTO): Promise<Booking> {
    const booking: Booking = {
      ...data,
      id: uuid(),
      status: 'confirmed',
      attendanceConfirmed: false,
      calendarEvents: { google: null, outlook: null },
      bookedAt: new Date(),
    };
    this.store.set(booking.id, booking);
    return booking;
  }

  async confirmAttendance(id: string): Promise<Booking | null> {
    const booking = this.store.get(id);
    if (!booking) return null;
    booking.attendanceConfirmed = true;
    this.store.set(id, booking);
    return booking;
  }

  async setCalendarEvent(
    id: string,
    provider: 'google' | 'outlook',
    event: CalendarEvent | null
  ): Promise<Booking | null> {
    const booking = this.store.get(id);
    if (!booking) return null;
    booking.calendarEvents = { ...booking.calendarEvents, [provider]: event };
    this.store.set(id, booking);
    return booking;
  }

  async cancel(id: string): Promise<Booking | null> {
    const booking = this.store.get(id);
    if (!booking) return null;
    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    this.store.set(id, booking);
    return booking;
  }

  async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }
}
