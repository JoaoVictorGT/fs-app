import { FirestoreBookingRepository } from '../repositories/firestore/booking.repository';
import { FirestoreStudentRepository } from '../repositories/firestore/student.repository';
import { FirestoreTeacherRepository } from '../repositories/firestore/teacher.repository';
import { SlotService } from './slot.service';
import { StreakService } from './streak.service';
import { CalendarService } from './calendar.service';
import { Booking } from '../models/booking.model';
import { sendBookingConfirmationEmail, sendCancellationEmail } from '../utils/email.util';

const bookingRepo    = new FirestoreBookingRepository();
const slotService    = new SlotService();
const streakService  = new StreakService();
const calendarService = new CalendarService();
const studentRepo    = new FirestoreStudentRepository();
const teacherRepo    = new FirestoreTeacherRepository();

export class BookingService {
  async getByStudent(studentId: string): Promise<Booking[]> {
    return bookingRepo.findAll({ studentId });
  }

  async getBySlot(slotId: string): Promise<Booking[]> {
    return bookingRepo.findAll({ slotId });
  }

  async getByTeacher(teacherId: string): Promise<Booking[]> {
    return bookingRepo.findAll({ teacherId });
  }

  async create(studentId: string, slotId: string): Promise<Booking> {
    const slot = await slotService.getById(slotId);

    if (slot.status !== 'available') {
      throw { status: 409, message: 'Este horário não está disponível' };
    }

    const duplicate = await bookingRepo.findByStudentAndSlot(studentId, slotId);
    if (duplicate) {
      throw { status: 409, message: 'Você já possui um agendamento neste horário' };
    }

    const booking = await bookingRepo.create({ slotId, studentId, teacherId: slot.teacherId });
    await slotService.incrementBookings(slotId);
    this.sendConfirmationEmail(studentId, slot).catch(console.error);

    return booking;
  }

  async cancel(bookingId: string, studentId: string): Promise<Booking> {
    const booking = await bookingRepo.findById(bookingId);
    if (!booking) throw { status: 404, message: 'Agendamento não encontrado' };
    if (booking.studentId !== studentId) throw { status: 403, message: 'Acesso negado' };
    if (booking.status === 'cancelled') throw { status: 409, message: 'Agendamento já cancelado' };

    const slot = await slotService.getById(booking.slotId);
    const slotDateTime = new Date(`${slot.date}T${slot.startTime}:00`);
    const hoursUntilSlot = (slotDateTime.getTime() - Date.now()) / (1000 * 60 * 60);

    if (hoursUntilSlot <= 24) {
      throw { status: 422, message: 'Cancelamento não permitido: menos de 24 horas para o início da aula' };
    }

    const cancelled = await bookingRepo.cancel(bookingId);
    await slotService.decrementBookings(booking.slotId);
    this.sendCancellationEmail(studentId, slot).catch(console.error);

    // Remove eventos de calendário silenciosamente
    if (booking.calendarEvents.google) {
      calendarService.deleteGoogleEvent(studentId, booking.calendarEvents.google.eventId).catch(() => {});
    }
    if (booking.calendarEvents.outlook) {
      calendarService.deleteOutlookEvent(studentId, booking.calendarEvents.outlook.eventId).catch(() => {});
    }

    return cancelled!;
  }

  async confirmAttendance(bookingId: string, teacherId: string): Promise<Booking> {
    const booking = await bookingRepo.findById(bookingId);
    if (!booking) throw { status: 404, message: 'Agendamento não encontrado' };
    if (booking.teacherId !== teacherId) throw { status: 403, message: 'Acesso negado' };
    if (booking.status !== 'confirmed') throw { status: 409, message: 'Agendamento não está confirmado' };
    if (booking.attendanceConfirmed) throw { status: 409, message: 'Presença já confirmada' };

    const slot = await slotService.getById(booking.slotId);
    const slotEnd = new Date(`${slot.date}T${slot.endTime}:00`);
    if (slotEnd > new Date()) {
      throw { status: 422, message: 'A aula ainda não terminou' };
    }

    const updated = await bookingRepo.confirmAttendance(bookingId);

    // Atualiza streak de forma assíncrona (não bloqueia a resposta)
    streakService.processAttendance(booking.studentId, slot.date).catch(console.error);

    return updated!;
  }

  async addCalendarEvent(
    bookingId: string,
    studentId: string,
    provider: 'google' | 'outlook'
  ): Promise<Booking> {
    const booking = await bookingRepo.findById(bookingId);
    if (!booking) throw { status: 404, message: 'Agendamento não encontrado' };
    if (booking.studentId !== studentId) throw { status: 403, message: 'Acesso negado' };
    if (booking.status !== 'confirmed') throw { status: 409, message: 'Agendamento não está confirmado' };

    const slot    = await slotService.getById(booking.slotId);
    const teacher = await teacherRepo.findById(booking.teacherId);
    const payload = calendarService.buildPayload(booking, slot, teacher?.name ?? 'Professor');

    const event = provider === 'google'
      ? await calendarService.createGoogleEvent(studentId, payload)
      : await calendarService.createOutlookEvent(studentId, payload);

    const updated = await bookingRepo.setCalendarEvent(bookingId, provider, event);
    return updated!;
  }

  async removeCalendarEvent(
    bookingId: string,
    studentId: string,
    provider: 'google' | 'outlook'
  ): Promise<Booking> {
    const booking = await bookingRepo.findById(bookingId);
    if (!booking) throw { status: 404, message: 'Agendamento não encontrado' };
    if (booking.studentId !== studentId) throw { status: 403, message: 'Acesso negado' };

    const event = booking.calendarEvents[provider];
    if (event) {
      if (provider === 'google') {
        await calendarService.deleteGoogleEvent(studentId, event.eventId).catch(() => {});
      } else {
        await calendarService.deleteOutlookEvent(studentId, event.eventId).catch(() => {});
      }
    }

    const updated = await bookingRepo.setCalendarEvent(bookingId, provider, null);
    return updated!;
  }

  // ── e-mail helpers ────────────────────────────────────────────────────────────

  private async sendConfirmationEmail(studentId: string, slot: any) {
    const [student, teacher] = await Promise.all([
      studentRepo.findById(studentId),
      teacherRepo.findById(slot.teacherId),
    ]);
    if (!student || !teacher) return;
    await sendBookingConfirmationEmail({
      studentName: student.name, studentEmail: student.email,
      teacherName: teacher.name, date: slot.date,
      startTime: slot.startTime, endTime: slot.endTime, academy: teacher.academy,
    });
  }

  private async sendCancellationEmail(studentId: string, slot: any) {
    const [student, teacher] = await Promise.all([
      studentRepo.findById(studentId),
      teacherRepo.findById(slot.teacherId),
    ]);
    if (!student || !teacher) return;
    await sendCancellationEmail({
      studentName: student.name, studentEmail: student.email,
      teacherName: teacher.name, date: slot.date,
      startTime: slot.startTime, endTime: slot.endTime, academy: teacher.academy,
    });
  }
}
