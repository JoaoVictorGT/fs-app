import { useState, useEffect, useCallback } from 'react';
import { Slot, CreateSlotPayload } from '../models';
import { slotService } from '../services/slot.service';

export function useSlots(params?: { teacherId?: string; date?: string }) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSlots = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await slotService.getSlots(params);
      setSlots(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar horários');
    } finally {
      setLoading(false);
    }
  }, [params?.teacherId, params?.date]);

  useEffect(() => { fetchSlots(); }, [fetchSlots]);

  const createSlot = useCallback(async (payload: CreateSlotPayload) => {
    const slot = await slotService.create(payload);
    setSlots(prev => [...prev, slot].sort((a, b) =>
      `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`)
    ));
    return slot;
  }, []);

  const updateSlot = useCallback(async (id: string, payload: Partial<CreateSlotPayload>) => {
    const updated = await slotService.update(id, payload);
    setSlots(prev => prev.map(s => s.id === id ? updated : s));
    return updated;
  }, []);

  const cancelSlot = useCallback(async (id: string) => {
    const updated = await slotService.cancel(id);
    setSlots(prev => prev.map(s => s.id === id ? updated : s));
  }, []);

  const deleteSlot = useCallback(async (id: string) => {
    await slotService.delete(id);
    setSlots(prev => prev.filter(s => s.id !== id));
  }, []);

  return { slots, loading, error, refetch: fetchSlots, createSlot, updateSlot, cancelSlot, deleteSlot };
}
