export type BookingStatus = 'confirmed' | 'cancelled';

export interface CalendarEvent {
  eventId: string;
  calendarId?: string;
}

export interface BookingCalendarEvents {
  google: CalendarEvent | null;
  outlook: CalendarEvent | null;
}

export interface Booking {
  id: string;
  slotId: string;
  studentId: string;
  teacherId: string;
  status: BookingStatus;
  attendanceConfirmed: boolean;
  calendarEvents: BookingCalendarEvents;
  bookedAt: Date;
  cancelledAt?: Date;
}

export type CreateBookingDTO = Pick<Booking, 'slotId' | 'studentId' | 'teacherId'>;
