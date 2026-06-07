export interface WeekEntry {
  week: string;    // ISO week: "YYYY-WNN"
  trained: boolean;
}

export interface Streak {
  id: string;
  studentId: string;
  currentStreak: number;
  recordStreak: number;
  lastTrainedWeek: string | null;
  weeklyHistory: WeekEntry[];
  updatedAt: Date;
}

export type CreateStreakDTO = Omit<Streak, 'id'>;
export type UpdateStreakDTO = Partial<Omit<Streak, 'id' | 'studentId'>>;
