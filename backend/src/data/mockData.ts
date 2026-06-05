import { v4 as uuid } from 'uuid';
import { Teacher } from '../models/teacher.model';
import { Student } from '../models/student.model';
import { Slot } from '../models/slot.model';
import { Booking } from '../models/booking.model';
import { AuthUser } from '../models/user.model';

// ── Teachers ──────────────────────────────────────────────────────────────────
const TEACHER_ID_1 = 'teacher-001';
const TEACHER_ID_2 = 'teacher-002';

export const mockTeachers: Teacher[] = [
  {
    id: TEACHER_ID_1,
    name: 'Maria Silva',
    email: 'maria@studiofitness.com',
    academy: 'Studio Fitness Centro',
    phone: '(41) 99999-0001',
    bio: 'Personal trainer certificada com 10 anos de experiência.',
    createdAt: new Date('2024-01-10'),
  },
  {
    id: TEACHER_ID_2,
    name: 'Rafael Costa',
    email: 'rafael@studiofitness.com',
    academy: 'Studio Fitness Centro',
    phone: '(41) 99999-0002',
    bio: 'Especialista em musculação e condicionamento físico.',
    createdAt: new Date('2024-01-15'),
  },
];

// ── Students ──────────────────────────────────────────────────────────────────
const STUDENT_ID_1 = 'student-001';
const STUDENT_ID_2 = 'student-002';
const STUDENT_ID_3 = 'student-003';

export const mockStudents: Student[] = [
  {
    id: STUDENT_ID_1,
    name: 'João Santos',
    email: 'joao@email.com',
    type: 'personal',
    teacherId: TEACHER_ID_1,
    phone: '(41) 98888-0001',
    createdAt: new Date('2024-02-01'),
  },
  {
    id: STUDENT_ID_2,
    name: 'Ana Oliveira',
    email: 'ana@email.com',
    type: 'personal',
    teacherId: TEACHER_ID_1,
    phone: '(41) 98888-0002',
    createdAt: new Date('2024-02-10'),
  },
  {
    id: STUDENT_ID_3,
    name: 'Carlos Lima',
    email: 'carlos@email.com',
    type: 'group',
    teacherId: TEACHER_ID_2,
    phone: '(41) 98888-0003',
    createdAt: new Date('2024-03-01'),
  },
];

// ── Slots ─────────────────────────────────────────────────────────────────────
const today = new Date();
const fmt = (d: Date) => d.toISOString().split('T')[0];
const addDays = (d: Date, n: number) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };

const SLOT_ID_1 = 'slot-001';
const SLOT_ID_2 = 'slot-002';
const SLOT_ID_3 = 'slot-003';
const SLOT_ID_4 = 'slot-004';
const SLOT_ID_5 = 'slot-005';

export const mockSlots: Slot[] = [
  {
    id: SLOT_ID_1,
    teacherId: TEACHER_ID_1,
    date: fmt(addDays(today, 1)),
    startTime: '06:00',
    endTime: '07:00',
    capacity: 1,
    currentBookings: 0,
    type: 'individual',
    status: 'available',
    description: 'Treino funcional personalizado',
    createdAt: new Date(),
  },
  {
    id: SLOT_ID_2,
    teacherId: TEACHER_ID_1,
    date: fmt(addDays(today, 2)),
    startTime: '07:00',
    endTime: '08:00',
    capacity: 10,
    currentBookings: 3,
    type: 'group',
    status: 'available',
    description: 'Aula de funcional em grupo',
    createdAt: new Date(),
  },
  {
    id: SLOT_ID_3,
    teacherId: TEACHER_ID_1,
    date: fmt(addDays(today, 3)),
    startTime: '18:00',
    endTime: '19:00',
    capacity: 1,
    currentBookings: 1,
    type: 'individual',
    status: 'full',
    description: 'Treino de força',
    createdAt: new Date(),
  },
  {
    id: SLOT_ID_4,
    teacherId: TEACHER_ID_2,
    date: fmt(addDays(today, 1)),
    startTime: '09:00',
    endTime: '10:00',
    capacity: 8,
    currentBookings: 2,
    type: 'group',
    status: 'available',
    description: 'Musculação guiada',
    createdAt: new Date(),
  },
  {
    id: SLOT_ID_5,
    teacherId: TEACHER_ID_2,
    date: fmt(addDays(today, 4)),
    startTime: '07:00',
    endTime: '08:00',
    capacity: 6,
    currentBookings: 6,
    type: 'group',
    status: 'full',
    description: 'Circuito intenso',
    createdAt: new Date(),
  },
];

// ── Bookings ──────────────────────────────────────────────────────────────────
export const mockBookings: Booking[] = [
  {
    id: 'booking-001',
    slotId: SLOT_ID_3,
    studentId: STUDENT_ID_1,
    teacherId: TEACHER_ID_1,
    status: 'confirmed',
    bookedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'booking-002',
    slotId: SLOT_ID_2,
    studentId: STUDENT_ID_2,
    teacherId: TEACHER_ID_1,
    status: 'confirmed',
    bookedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
];

// ── Auth users ─────────────────────────────────────────────────────────────────
export const mockAuthUsers: AuthUser[] = [
  {
    id: 'auth-teacher-001',
    email: 'maria@studiofitness.com',
    password: 'teacher123',
    role: 'teacher',
    name: 'Maria Silva',
    profileId: TEACHER_ID_1,
  },
  {
    id: 'auth-teacher-002',
    email: 'rafael@studiofitness.com',
    password: 'teacher123',
    role: 'teacher',
    name: 'Rafael Costa',
    profileId: TEACHER_ID_2,
  },
  {
    id: 'auth-student-001',
    email: 'joao@email.com',
    password: 'student123',
    role: 'student',
    name: 'João Santos',
    profileId: STUDENT_ID_1,
    teacherId: TEACHER_ID_1,
  },
  {
    id: 'auth-student-002',
    email: 'ana@email.com',
    password: 'student123',
    role: 'student',
    name: 'Ana Oliveira',
    profileId: STUDENT_ID_2,
    teacherId: TEACHER_ID_1,
  },
  {
    id: 'auth-student-003',
    email: 'carlos@email.com',
    password: 'student123',
    role: 'student',
    name: 'Carlos Lima',
    profileId: STUDENT_ID_3,
    teacherId: TEACHER_ID_2,
  },
];
