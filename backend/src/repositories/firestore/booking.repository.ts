import { db } from '../../config/firebase';
import { Booking, CreateBookingDTO, CalendarEvent } from '../../models/booking.model';
import admin from '../../config/firebase';

export class FirestoreBookingRepository {
  private col = db.collection('bookings');

  async findById(id: string): Promise<Booking | null> {
    const doc = await this.col.doc(id).get();
    if (!doc.exists) return null;
    return this.toBooking(doc.id, doc.data()!);
  }

  async findAll(filter?: {
    studentId?: string;
    teacherId?: string;
    slotId?:    string;
    status?:    string;
  }): Promise<Booking[]> {
    let query = this.col as admin.firestore.Query;

    // Usa apenas um filtro Firestore por vez (evita índices compostos)
    if (filter?.studentId) {
      query = query.where('studentId', '==', filter.studentId);
    } else if (filter?.teacherId) {
      query = query.where('teacherId', '==', filter.teacherId);
    } else if (filter?.slotId) {
      query = query.where('slotId', '==', filter.slotId);
    }

    const snap = await query.get();
    let results = snap.docs.map(d => this.toBooking(d.id, d.data()));

    // Filtros adicionais em memória
    if (filter?.studentId && (filter.teacherId || filter.slotId)) {
      if (filter.teacherId) results = results.filter(b => b.teacherId === filter.teacherId);
      if (filter.slotId)    results = results.filter(b => b.slotId    === filter.slotId);
    }
    if (filter?.status) results = results.filter(b => b.status === filter.status);

    return results;
  }

  async findByStudentAndSlot(studentId: string, slotId: string): Promise<Booking | null> {
    const snap = await this.col
      .where('studentId', '==', studentId)
      .where('slotId',    '==', slotId)
      .limit(5)
      .get();
    const confirmed = snap.docs
      .map(d => this.toBooking(d.id, d.data()))
      .find(b => b.status === 'confirmed');
    return confirmed ?? null;
  }

  async create(data: CreateBookingDTO): Promise<Booking> {
    const docRef = this.col.doc();
    const bookingDoc = {
      slotId:              data.slotId,
      studentId:           data.studentId,
      teacherId:           data.teacherId,
      status:              'confirmed',
      attendanceConfirmed: false,
      calendarEvents:      { google: null, outlook: null },
      bookedAt:            admin.firestore.FieldValue.serverTimestamp(),
    };
    await docRef.set(bookingDoc);
    return {
      id:                  docRef.id,
      ...data,
      status:              'confirmed',
      attendanceConfirmed: false,
      calendarEvents:      { google: null, outlook: null },
      bookedAt:            new Date(),
    };
  }

  async cancel(id: string): Promise<Booking | null> {
    const doc = await this.col.doc(id).get();
    if (!doc.exists) return null;
    const cancelledAt = admin.firestore.FieldValue.serverTimestamp();
    await this.col.doc(id).update({ status: 'cancelled', cancelledAt });
    return this.toBooking(id, { ...doc.data()!, status: 'cancelled', cancelledAt: new Date() });
  }

  async confirmAttendance(id: string): Promise<Booking | null> {
    const doc = await this.col.doc(id).get();
    if (!doc.exists) return null;
    await this.col.doc(id).update({ attendanceConfirmed: true });
    return this.toBooking(id, { ...doc.data()!, attendanceConfirmed: true });
  }

  async setCalendarEvent(
    id: string,
    provider: 'google' | 'outlook',
    event: CalendarEvent | null
  ): Promise<Booking | null> {
    const doc = await this.col.doc(id).get();
    if (!doc.exists) return null;
    const existing = (doc.data()!.calendarEvents as any) ?? { google: null, outlook: null };
    const updated  = { ...existing, [provider]: event };
    await this.col.doc(id).update({ calendarEvents: updated });
    return this.toBooking(id, { ...doc.data()!, calendarEvents: updated });
  }

  async delete(id: string): Promise<boolean> {
    const doc = await this.col.doc(id).get();
    if (!doc.exists) return false;
    await this.col.doc(id).delete();
    return true;
  }

  // ── helpers ──────────────────────────────────────────────────────────────────

  private toBooking(id: string, data: admin.firestore.DocumentData): Booking {
    const ce = data.calendarEvents ?? { google: null, outlook: null };
    return {
      id,
      slotId:              data.slotId,
      studentId:           data.studentId,
      teacherId:           data.teacherId,
      status:              data.status,
      attendanceConfirmed: data.attendanceConfirmed ?? false,
      calendarEvents: {
        google:  ce.google  ?? null,
        outlook: ce.outlook ?? null,
      },
      bookedAt:    data.bookedAt?.toDate?.()    ?? new Date(),
      cancelledAt: data.cancelledAt?.toDate?.() ?? undefined,
    };
  }
}
