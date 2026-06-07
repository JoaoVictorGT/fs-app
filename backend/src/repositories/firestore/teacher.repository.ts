import { db } from '../../config/firebase';
import { Teacher, CreateTeacherDTO, UpdateTeacherDTO } from '../../models/teacher.model';
import admin from '../../config/firebase';

export class FirestoreTeacherRepository {
  private col = db.collection('users');

  async findById(id: string): Promise<Teacher | null> {
    const doc = await this.col.doc(id).get();
    if (!doc.exists) return null;
    const data = doc.data()!;
    if (data.role !== 'teacher') return null;
    return this.toTeacher(doc.id, data);
  }

  async findAll(): Promise<Teacher[]> {
    const snap = await this.col.where('role', '==', 'teacher').get();
    return snap.docs.map(d => this.toTeacher(d.id, d.data()));
  }

  async create(data: CreateTeacherDTO): Promise<Teacher> {
    const docRef = this.col.doc(); // auto-id
    const teacherDoc = {
      name: data.name,
      email: data.email,
      role: 'teacher',
      academyName: data.academy,
      phone: data.phone ?? null,
      bio: data.bio ?? null,
      studentType: null,
      teacherId: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await docRef.set(teacherDoc);
    return { id: docRef.id, createdAt: new Date(), ...data };
  }

  async update(id: string, data: UpdateTeacherDTO): Promise<Teacher | null> {
    const doc = await this.col.doc(id).get();
    if (!doc.exists) return null;

    const patch: Record<string, unknown> = {};
    if (data.name      !== undefined) patch.name       = data.name;
    if (data.academy   !== undefined) patch.academyName = data.academy;
    if (data.phone     !== undefined) patch.phone      = data.phone;
    if (data.bio       !== undefined) patch.bio        = data.bio;

    await this.col.doc(id).update(patch);
    return this.toTeacher(id, { ...doc.data()!, ...patch });
  }

  async delete(id: string): Promise<boolean> {
    const doc = await this.col.doc(id).get();
    if (!doc.exists) return false;
    await this.col.doc(id).delete();
    return true;
  }

  // ── helpers ──────────────────────────────────────────────────────────────────

  private toTeacher(id: string, data: admin.firestore.DocumentData): Teacher {
    return {
      id,
      name:     data.name,
      email:    data.email,
      academy:  data.academyName ?? data.academy ?? '',
      phone:    data.phone  ?? undefined,
      bio:      data.bio    ?? undefined,
      createdAt: data.createdAt?.toDate?.() ?? new Date(),
    };
  }
}
