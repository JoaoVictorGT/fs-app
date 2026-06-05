export type UserRole = 'teacher' | 'student';
export type StudentType = 'personal' | 'group';
export type SlotType = 'individual' | 'group';
export type SlotStatus = 'available' | 'full' | 'cancelled';
export type BookingStatus = 'confirmed' | 'cancelled';

export interface AuthUser {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
  profileId: string;
  teacherId?: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  academy: string;
  phone?: string;
  bio?: string;
  createdAt: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  type: StudentType;
  teacherId: string;
  phone?: string;
  createdAt: string;
}

export interface Slot {
  id: string;
  teacherId: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  currentBookings: number;
  type: SlotType;
  status: SlotStatus;
  description?: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  slotId: string;
  studentId: string;
  teacherId: string;
  status: BookingStatus;
  bookedAt: string;
  cancelledAt?: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface CreateSlotPayload {
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  type: SlotType;
  description?: string;
}
