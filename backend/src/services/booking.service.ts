import { BookingRepository } from '../repositories/booking.repository';
import { SlotService } from './slot.service';
import { StudentRepository } from '../repositories/student.repository';
import { TeacherRepository } from '../repositories/teacher.repository';
import { Booking } from '../models/booking.model';
import { sendBookingConfirmationEmail, sendCancellationEmail } from '../utils/email.util';

const bookingRepo = new BookingRepository();
const slotService = new SlotService();
const studentRepo = new StudentRepository();
const teacherRepo = new TeacherRepository();

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

    const booking = await bookingRepo.create({
      slotId,
      studentId,
      teacherId: slot.teacherId,
    });

    await slotService.incrementBookings(slotId);

    // Fire-and-forget email
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
      throw {
        status: 422,
        message: 'Cancelamento não permitido: menos de 24 horas para o início da aula',
      };
    }

    const cancelled = await bookingRepo.cancel(bookingId);
    await slotService.decrementBookings(booking.slotId);

    this.sendCancellationEmail(studentId, slot).catch(console.error);

    return cancelled!;
  }

  private async sendConfirmationEmail(studentId: string, slot: any) {
    const [student, teacher] = await Promise.all([
      studentRepo.findById(studentId),
      teacherRepo.findById(slot.teacherId),
    ]);
    if (!student || !teacher) return;

    await sendBookingConfirmationEmail({
      studentName: student.name,
      studentEmail: student.email,
      teacherName: teacher.name,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      academy: teacher.academy,
    });
  }

  private async sendCancellationEmail(studentId: string, slot: any) {
    const [student, teacher] = await Promise.all([
      studentRepo.findById(studentId),
      teacherRepo.findById(slot.teacherId),
    ]);
    if (!student || !teacher) return;

    await sendCancellationEmail({
      studentName: student.name,
      studentEmail: student.email,
      teacherName: teacher.name,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      academy: teacher.academy,
    });
  }
}
