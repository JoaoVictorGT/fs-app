import { v4 as uuid } from 'uuid';
import { Slot, CreateSlotDTO, UpdateSlotDTO } from '../models/slot.model';
import { IRepository } from './interfaces';
import { mockSlots } from '../data/mockData';

// NOTE: Replace with FirestoreSlotRepository when Firebase credentials are available.
export class SlotRepository implements IRepository<Slot, CreateSlotDTO, UpdateSlotDTO> {
  private store: Map<string, Slot>;

  constructor() {
    this.store = new Map(mockSlots.map(s => [s.id, s]));
  }

  async findById(id: string): Promise<Slot | null> {
    return this.store.get(id) ?? null;
  }

  async findAll(filter?: { teacherId?: string; date?: string; status?: string }): Promise<Slot[]> {
    let result = Array.from(this.store.values());
    if (filter?.teacherId) result = result.filter(s => s.teacherId === filter.teacherId);
    if (filter?.date) result = result.filter(s => s.date === filter.date);
    if (filter?.status) result = result.filter(s => s.status === filter.status);
    return result.sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`));
  }

  async create(data: CreateSlotDTO): Promise<Slot> {
    const slot: Slot = {
      ...data,
      id: uuid(),
      currentBookings: 0,
      status: 'available',
      createdAt: new Date(),
    };
    this.store.set(slot.id, slot);
    return slot;
  }

  async update(id: string, data: UpdateSlotDTO): Promise<Slot | null> {
    const existing = this.store.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...data };
    this.store.set(id, updated);
    return updated;
  }

  async incrementBookings(id: string): Promise<Slot | null> {
    const slot = this.store.get(id);
    if (!slot) return null;
    slot.currentBookings += 1;
    if (slot.currentBookings >= slot.capacity) slot.status = 'full';
    this.store.set(id, slot);
    return slot;
  }

  async decrementBookings(id: string): Promise<Slot | null> {
    const slot = this.store.get(id);
    if (!slot) return null;
    slot.currentBookings = Math.max(0, slot.currentBookings - 1);
    if (slot.status === 'full' && slot.currentBookings < slot.capacity) slot.status = 'available';
    this.store.set(id, slot);
    return slot;
  }

  async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }
}
