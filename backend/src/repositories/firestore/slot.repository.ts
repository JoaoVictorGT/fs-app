import { db } from '../../config/firebase';
import { Slot, CreateSlotDTO, UpdateSlotDTO } from '../../models/slot.model';
import admin from '../../config/firebase';

export class FirestoreSlotRepository {
  private col = db.collection('slots');

  async findById(id: string): Promise<Slot | null> {
    const doc = await this.col.doc(id).get();
    if (!doc.exists) return null;
    return this.toSlot(doc.id, doc.data()!);
  }

  async findAll(filter?: { teacherId?: string; date?: string; status?: string }): Promise<Slot[]> {
    let query = this.col as admin.firestore.Query;

    // Só filtramos teacherId no Firestore (evita índice composto)
    if (filter?.teacherId) {
      query = query.where('teacherId', '==', filter.teacherId);
    }

    const snap = await query.get();
    let results = snap.docs.map(d => this.toSlot(d.id, d.data()));

    // Filtros restantes em memória
    if (filter?.date)   results = results.filter(s => s.date === filter.date);
    if (filter?.status) results = results.filter(s => s.status === filter.status);

    return results.sort((a, b) =>
      `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`)
    );
  }

  async create(data: CreateSlotDTO): Promise<Slot> {
    const docRef = this.col.doc();
    const slotDoc = {
      teacherId:       data.teacherId,
      date:            data.date,
      startTime:       data.startTime,
      endTime:         data.endTime,
      capacity:        data.capacity,
      currentBookings: 0,
      type:            data.type,
      status:          'available',
      description:     data.description ?? null,
      createdAt:       admin.firestore.FieldValue.serverTimestamp(),
    };
    await docRef.set(slotDoc);
    return {
      id:              docRef.id,
      currentBookings: 0,
      status:          'available',
      createdAt:       new Date(),
      ...data,
    };
  }

  async update(id: string, data: UpdateSlotDTO): Promise<Slot | null> {
    const doc = await this.col.doc(id).get();
    if (!doc.exists) return null;

    const patch: Record<string, unknown> = {};
    if (data.date        !== undefined) patch.date        = data.date;
    if (data.startTime   !== undefined) patch.startTime   = data.startTime;
    if (data.endTime     !== undefined) patch.endTime     = data.endTime;
    if (data.capacity    !== undefined) patch.capacity    = data.capacity;
    if (data.type        !== undefined) patch.type        = data.type;
    if (data.status      !== undefined) patch.status      = data.status;
    if (data.description !== undefined) patch.description = data.description;

    await this.col.doc(id).update(patch);
    return this.toSlot(id, { ...doc.data()!, ...patch });
  }

  async delete(id: string): Promise<boolean> {
    const doc = await this.col.doc(id).get();
    if (!doc.exists) return false;
    await this.col.doc(id).delete();
    return true;
  }

  /**
   * Incrementa currentBookings atomicamente e marca como 'full' se atingiu a capacidade.
   * Usa transação para garantir consistência.
   */
  async incrementBookings(id: string): Promise<Slot | null> {
    const docRef = this.col.doc(id);
    const result = await db.runTransaction(async tx => {
      const doc = await tx.get(docRef);
      if (!doc.exists) return null;
      const data = doc.data()!;
      const newBookings = (data.currentBookings as number) + 1;
      const newStatus   = newBookings >= (data.capacity as number) ? 'full' : data.status;
      tx.update(docRef, { currentBookings: newBookings, status: newStatus });
      return this.toSlot(id, { ...data, currentBookings: newBookings, status: newStatus });
    });
    return result;
  }

  /**
   * Decrementa currentBookings atomicamente e restaura para 'available' se estava 'full'.
   */
  async decrementBookings(id: string): Promise<Slot | null> {
    const docRef = this.col.doc(id);
    const result = await db.runTransaction(async tx => {
      const doc = await tx.get(docRef);
      if (!doc.exists) return null;
      const data = doc.data()!;
      const newBookings = Math.max(0, (data.currentBookings as number) - 1);
      const newStatus   =
        data.status === 'full' && newBookings < (data.capacity as number)
          ? 'available'
          : data.status;
      tx.update(docRef, { currentBookings: newBookings, status: newStatus });
      return this.toSlot(id, { ...data, currentBookings: newBookings, status: newStatus });
    });
    return result;
  }

  // ── helpers ──────────────────────────────────────────────────────────────────

  private toSlot(id: string, data: admin.firestore.DocumentData): Slot {
    return {
      id,
      teacherId:       data.teacherId,
      date:            data.date,
      startTime:       data.startTime,
      endTime:         data.endTime,
      capacity:        data.capacity,
      currentBookings: data.currentBookings ?? 0,
      type:            data.type,
      status:          data.status,
      description:     data.description ?? undefined,
      createdAt:       data.createdAt?.toDate?.() ?? new Date(),
    };
  }
}
