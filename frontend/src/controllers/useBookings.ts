import { useState, useEffect, useCallback } from 'react';
import { Booking } from '../models';
import { bookingService } from '../services/booking.service';

type Mode = 'student' | 'teacher';

export function useBookings(mode: Mode = 'student') {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = mode === 'teacher'
        ? await bookingService.getByTeacher()
        : await bookingService.getMyBookings();
      setBookings(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar agendamentos');
    } finally {
      setLoading(false);
    }
  }, [mode]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const book = useCallback(async (slotId: string) => {
    const booking = await bookingService.create(slotId);
    setBookings(prev => [booking, ...prev]);
    return booking;
  }, []);

  const cancel = useCallback(async (id: string) => {
    const updated = await bookingService.cancel(id);
    setBookings(prev => prev.map(b => b.id === id ? updated : b));
  }, []);

  return { bookings, loading, error, refetch: fetchBookings, book, cancel };
}
