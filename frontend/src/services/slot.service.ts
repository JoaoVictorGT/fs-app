import api from './api';
import { Slot, CreateSlotPayload } from '../models';

export const slotService = {
  async getSlots(params?: { teacherId?: string; date?: string }): Promise<Slot[]> {
    const { data } = await api.get<Slot[]>('/slots', { params });
    return data;
  },

  async getById(id: string): Promise<Slot> {
    const { data } = await api.get<Slot>(`/slots/${id}`);
    return data;
  },

  async create(payload: CreateSlotPayload): Promise<Slot> {
    const { data } = await api.post<Slot>('/slots', payload);
    return data;
  },

  async update(id: string, payload: Partial<CreateSlotPayload>): Promise<Slot> {
    const { data } = await api.patch<Slot>(`/slots/${id}`, payload);
    return data;
  },

  async cancel(id: string): Promise<Slot> {
    const { data } = await api.patch<Slot>(`/slots/${id}/cancel`);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/slots/${id}`);
  },
};
