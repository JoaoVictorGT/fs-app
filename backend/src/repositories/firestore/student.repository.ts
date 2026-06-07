import { db } from '../../config/firebase';
import { Student, CreateStudentDTO, UpdateStudentDTO } from '../../models/student.model';
import admin from '../../config/firebase';

export class FirestoreStudentRepository {
  private col = db.collection('users');

  async findById(id: string): Promise<Student | null> {
    const doc = await this.col.doc(id).get();
    if (!doc.exists) return null;
    const data = doc.data()!;
    if (data.role !== 'student') return null;
    return this.toStudent(doc.id, data);
  }

  async findByEmail(email: string): Promise<Student | null> {
    const snap = await this.col
      .where('role', '==', 'student')
      .where('email', '==', email)
      .limit(1)
      .get();
    if (snap.empty) return null;
    const d = snap.docs[0];
    return this.toStudent(d.id, d.data());
  }

  async findAll(filter?: { teacherId?: string }): Promise<Student[]> {
    let query = this.col.where('role', '==', 'student') as admin.firestore.Query;
    if (filter?.teacherId) {
      query = query.where('teacherId', '==', filter.teacherId);
    }
    const snap = await query.get();
    return snap.docs.map(d => this.toStudent(d.id, d.data()));
  }

  /**
   * Cria documento Firestore para um aluno cujo uid já foi criado no Firebase Auth.
   * @param uid  UID retornado pelo Admin SDK ou pelo frontend (Firebase Auth).
   */
  async create(uid: string, data: CreateStudentDTO): Promise<Student> {
    const studentDoc = {
      uid,
      name:        data.name,
      email:       data.email,
      role:        'student',
      studentType: data.type,
      teacherId:   data.teacherId ?? null,
      phone:       data.phone ?? null,
      createdAt:   admin.firestore.FieldValue.serverTimestamp(),
    };
    await this.col.doc(uid).set(studentDoc);
    return { id: uid, createdAt: new Date(), ...data };
  }

  async update(id: string, data: UpdateStudentDTO): Promise<Student | null> {
    const doc = await this.col.doc(id).get();
    if (!doc.exists) return null;

    const patch: Record<string, unknown> = {};
    if (data.name  !== undefined) patch.name  = data.name;
    if (data.phone !== undefined) patch.phone = data.phone;

    await this.col.doc(id).update(patch);
    return this.toStudent(id, { ...doc.data()!, ...patch });
  }

  // ── helpers ──────────────────────────────────────────────────────────────────

  private toStudent(id: string, data: admin.firestore.DocumentData): Student {
    return {
      id,
      name:      data.name,
      email:     data.email,
      type:      data.studentType ?? 'group',
      teacherId: data.teacherId ?? '',
      phone:     data.phone ?? undefined,
      createdAt: data.createdAt?.toDate?.() ?? new Date(),
    };
  }
}
