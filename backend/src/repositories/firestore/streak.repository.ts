import { db } from '../../config/firebase';
import { Streak, CreateStreakDTO, UpdateStreakDTO } from '../../models/streak.model';
import admin from '../../config/firebase';

/**
 * Usa o studentId como ID do documento no Firestore para consulta O(1).
 * O campo `id` no modelo é sempre igual a `studentId`.
 */
export class FirestoreStreakRepository {
  private col = db.collection('streaks');

  async findById(id: string): Promise<Streak | null> {
    const doc = await this.col.doc(id).get();
    if (!doc.exists) return null;
    return this.toStreak(doc.id, doc.data()!);
  }

  async findByStudentId(studentId: string): Promise<Streak | null> {
    const doc = await this.col.doc(studentId).get();
    if (!doc.exists) return null;
    return this.toStreak(doc.id, doc.data()!);
  }

  async create(data: CreateStreakDTO): Promise<Streak> {
    const streakDoc = {
      studentId:      data.studentId,
      currentStreak:  data.currentStreak,
      recordStreak:   data.recordStreak,
      lastTrainedWeek: data.lastTrainedWeek,
      weeklyHistory:  data.weeklyHistory,
      updatedAt:      admin.firestore.FieldValue.serverTimestamp(),
    };
    // Usa studentId como ID do documento para lookup direto
    await this.col.doc(data.studentId).set(streakDoc);
    return { id: data.studentId, ...data };
  }

  async update(id: string, data: UpdateStreakDTO): Promise<Streak | null> {
    const doc = await this.col.doc(id).get();
    if (!doc.exists) return null;

    const patch: Record<string, unknown> = { updatedAt: admin.firestore.FieldValue.serverTimestamp() };
    if (data.currentStreak   !== undefined) patch.currentStreak   = data.currentStreak;
    if (data.recordStreak    !== undefined) patch.recordStreak    = data.recordStreak;
    if (data.lastTrainedWeek !== undefined) patch.lastTrainedWeek = data.lastTrainedWeek;
    if (data.weeklyHistory   !== undefined) patch.weeklyHistory   = data.weeklyHistory;

    await this.col.doc(id).update(patch);
    return this.toStreak(id, { ...doc.data()!, ...patch });
  }

  // ── helpers ──────────────────────────────────────────────────────────────────

  private toStreak(id: string, data: admin.firestore.DocumentData): Streak {
    return {
      id,
      studentId:       data.studentId,
      currentStreak:   data.currentStreak  ?? 0,
      recordStreak:    data.recordStreak   ?? 0,
      lastTrainedWeek: data.lastTrainedWeek ?? null,
      weeklyHistory:   data.weeklyHistory  ?? [],
      updatedAt:       data.updatedAt?.toDate?.() ?? new Date(),
    };
  }
}
