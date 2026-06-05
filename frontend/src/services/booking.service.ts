import api from './api';
import { Booking } from '../models';

export const bookingService = {
  async getMyBookings(): Promise<Booking[]> {
    const { data } = await api.get<Booking[]>('/bookings/my');
    return data;
  },

  async getByTeacher(): Promise<Booking[]> {
    const { data } = await api.get<Booking[]>('/bookings/by-teacher');
    return data;
  },

  async getBySlot(slotId: string): Promise<Booking[]> {
    const { data } = await api.get<Booking[]>(`/bookings/by-slot/${slotId}`);
    return data;
  },

  async create(slotId: string): Promise<Booking> {
    const { data } = await api.post<Booking>('/bookings', { slotId });
    return data;
  },

  async cancel(id: string): Promise<Booking> {
    const { data } = await api.delete<Booking>(`/bookings/${id}`);
    return data;
  },
};
