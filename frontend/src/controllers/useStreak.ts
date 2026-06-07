import { useState, useEffect, useCallback } from 'react';
import { Streak } from '../models';
import { streakService } from '../services/streak.service';

export function useStreak(studentId: string | undefined) {
  const [streak, setStreak] = useState<Streak | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStreak = useCallback(async () => {
    if (!studentId) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const data = await streakService.getByStudentId(studentId);
      setStreak(data);
    } catch {
      setError('Erro ao carregar streak');
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => { fetchStreak(); }, [fetchStreak]);

  return { streak, loading, error, refetch: fetchStreak };
}
