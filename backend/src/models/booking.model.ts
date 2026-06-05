export type BookingStatus = 'confirmed' | 'cancelled';

export interface Booking {
  id: string;
  slotId: string;
  studentId: string;
  teacherId: string;
  status: BookingStatus;
  bookedAt: Date;
  cancelledAt?: Date;
}

export type CreateBookingDTO = Pick<Booking, 'slotId' | 'studentId' | 'teacherId'>;
