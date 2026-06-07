import { v4 as uuid } from 'uuid';
import { Streak, CreateStreakDTO, UpdateStreakDTO } from '../models/streak.model';
import { mockStreaks } from '../data/mockData';

// NOTE: Replace with FirestoreStreakRepository when Firebase credentials are available.
export class StreakRepository {
  private store: Map<string, Streak>;

  constructor() {
    this.store = new Map(mockStreaks.map(s => [s.id, s]));
  }

  async findById(id: string): Promise<Streak | null> {
    return this.store.get(id) ?? null;
  }

  async findByStudentId(studentId: string): Promise<Streak | null> {
    return Array.from(this.store.values()).find(s => s.studentId === studentId) ?? null;
  }

  async create(data: CreateStreakDTO): Promise<Streak> {
    const streak: Streak = { ...data, id: uuid() };
    this.store.set(streak.id, streak);
    return streak;
  }

  async update(id: string, data: UpdateStreakDTO): Promise<Streak | null> {
    const existing = this.store.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...data, updatedAt: new Date() };
    this.store.set(id, updated);
    return updated;
  }
}
