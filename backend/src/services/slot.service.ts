import { FirestoreSlotRepository } from '../repositories/firestore/slot.repository';
import { Slot, CreateSlotDTO, UpdateSlotDTO } from '../models/slot.model';

const repo = new FirestoreSlotRepository();

export class SlotService {
  async getSlots(filter?: { teacherId?: string; date?: string }): Promise<Slot[]> {
    return repo.findAll(filter);
  }

  async getAvailableSlots(teacherId: string): Promise<Slot[]> {
    return repo.findAll({ teacherId, status: 'available' });
  }

  async getById(id: string): Promise<Slot> {
    const slot = await repo.findById(id);
    if (!slot) throw { status: 404, message: 'Horário não encontrado' };
    return slot;
  }

  async create(teacherId: string, data: CreateSlotDTO): Promise<Slot> {
    if (data.type === 'individual' && data.capacity !== 1) {
      throw { status: 400, message: 'Slots individuais devem ter capacidade 1' };
    }
    return repo.create({ ...data, teacherId });
  }

  async update(id: string, teacherId: string, data: UpdateSlotDTO): Promise<Slot> {
    const slot = await repo.findById(id);
    if (!slot) throw { status: 404, message: 'Horário não encontrado' };
    if (slot.teacherId !== teacherId) throw { status: 403, message: 'Acesso negado' };

    const updated = await repo.update(id, data);
    return updated!;
  }

  async cancel(id: string, teacherId: string): Promise<Slot> {
    const slot = await repo.findById(id);
    if (!slot) throw { status: 404, message: 'Horário não encontrado' };
    if (slot.teacherId !== teacherId) throw { status: 403, message: 'Acesso negado' };

    const updated = await repo.update(id, { status: 'cancelled' });
    return updated!;
  }

  async delete(id: string, teacherId: string): Promise<void> {
    const slot = await repo.findById(id);
    if (!slot) throw { status: 404, message: 'Horário não encontrado' };
    if (slot.teacherId !== teacherId) throw { status: 403, message: 'Acesso negado' };
    if (slot.currentBookings > 0) {
      throw { status: 409, message: 'Não é possível excluir um horário com agendamentos ativos' };
    }
    await repo.delete(id);
  }

  async incrementBookings(id: string): Promise<Slot> {
    const slot = await repo.incrementBookings(id);
    if (!slot) throw { status: 404, message: 'Horário não encontrado' };
    return slot;
  }

  async decrementBookings(id: string): Promise<void> {
    await repo.decrementBookings(id);
  }
}
