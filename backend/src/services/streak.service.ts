import { FirestoreStreakRepository } from '../repositories/firestore/streak.repository';
import { Streak, WeekEntry } from '../models/streak.model';
import { getISOWeek, isConsecutiveWeek, getWeeksInMonth } from '../utils/week.util';

const repo = new FirestoreStreakRepository();

export class StreakService {
  /** Retorna o streak do aluno, calculando o streak efetivo no momento da leitura. */
  async getByStudentId(studentId: string): Promise<Streak> {
    let streak = await repo.findByStudentId(studentId);

    if (!streak) {
      // Primeiro acesso — cria um streak em branco
      streak = await repo.create({
        studentId,
        currentStreak:   0,
        recordStreak:    0,
        lastTrainedWeek: null,
        weeklyHistory:   [],
        updatedAt:       new Date(),
      });
    }

    return this.computeEffectiveStreak(streak);
  }

  /**
   * Chamado quando o professor confirma a presença do aluno.
   * A data do slot (YYYY-MM-DD) define a semana ISO.
   */
  async processAttendance(studentId: string, slotDate: string): Promise<Streak> {
    const slotDay    = new Date(`${slotDate}T12:00:00Z`); // meio-dia UTC evita shift de DST
    const currentWeek = getISOWeek(slotDay);

    let streak = await repo.findByStudentId(studentId);

    if (!streak) {
      return repo.create({
        studentId,
        currentStreak:   1,
        recordStreak:    1,
        lastTrainedWeek: currentWeek,
        weeklyHistory:   [{ week: currentWeek, trained: true }],
        updatedAt:       new Date(),
      });
    }

    // Idempotente — já registrado esta semana
    if (streak.lastTrainedWeek === currentWeek) return streak;

    const consecutive =
      streak.lastTrainedWeek !== null &&
      isConsecutiveWeek(currentWeek, streak.lastTrainedWeek);

    const newCurrentStreak = consecutive ? streak.currentStreak + 1 : 1;
    const newRecordStreak  = Math.max(streak.recordStreak, newCurrentStreak);

    const updatedHistory = this.buildUpdatedHistory(
      streak.weeklyHistory,
      streak.lastTrainedWeek,
      currentWeek
    );

    const updated = await repo.update(streak.id, {
      currentStreak:   newCurrentStreak,
      recordStreak:    newRecordStreak,
      lastTrainedWeek: currentWeek,
      weeklyHistory:   updatedHistory,
    });

    return updated!;
  }

  /** Retorna indicadores semanais para o mês atual. */
  getMonthlyWeeks(
    streak: Streak,
    year: number,
    month: number
  ): Array<{ week: string; trained: boolean }> {
    const monthWeeks = getWeeksInMonth(year, month);
    const historyMap = new Map(streak.weeklyHistory.map(e => [e.week, e.trained]));
    return monthWeeks.map(w => ({ week: w, trained: historyMap.get(w) ?? false }));
  }

  // ── helpers privados ──────────────────────────────────────────────────────────

  private computeEffectiveStreak(streak: Streak): Streak {
    if (streak.currentStreak === 0 || !streak.lastTrainedWeek) return streak;

    const currentWeek = getISOWeek(new Date());
    const prevWeek    = getISOWeek(new Date(Date.now() - 7 * 86400000));

    const stillActive =
      streak.lastTrainedWeek === currentWeek ||
      streak.lastTrainedWeek === prevWeek;

    return stillActive ? streak : { ...streak, currentStreak: 0 };
  }

  private buildUpdatedHistory(
    existing: WeekEntry[],
    lastWeek: string | null,
    currentWeek: string
  ): WeekEntry[] {
    const history    = [...existing];
    const historyMap = new Map(history.map((e, i) => [e.week, i]));

    // Marca semana atual como treinada
    if (historyMap.has(currentWeek)) {
      history[historyMap.get(currentWeek)!].trained = true;
    } else {
      history.push({ week: currentWeek, trained: true });
    }

    // Preenche lacunas entre lastWeek e currentWeek como não treinadas
    if (lastWeek) {
      let cursor = new Date(this.mondayOf(currentWeek).getTime() - 7 * 86400000);
      const lastWeekMonday = this.mondayOf(lastWeek);

      while (cursor.getTime() > lastWeekMonday.getTime()) {
        const w = getISOWeek(cursor);
        if (!historyMap.has(w)) {
          history.push({ week: w, trained: false });
        }
        cursor = new Date(cursor.getTime() - 7 * 86400000);
      }
    }

    return history.sort((a, b) => a.week.localeCompare(b.week));
  }

  private mondayOf(weekStr: string): Date {
    const [yearStr, weekPart] = weekStr.split('-W');
    const year  = parseInt(yearStr, 10);
    const week  = parseInt(weekPart, 10);
    const jan4  = new Date(Date.UTC(year, 0, 4));
    const jan4Day = jan4.getUTCDay() || 7;
    const monday = new Date(jan4);
    monday.setUTCDate(jan4.getUTCDate() - (jan4Day - 1) + (week - 1) * 7);
    return monday;
  }
}
