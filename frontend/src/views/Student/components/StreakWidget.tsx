import { useEffect, useState } from 'react';
import { Streak } from '../../../models';

interface Props {
  streak: Streak | null;
  loading?: boolean;
}

function motivationalMessage(n: number): string {
  if (n === 0) return 'Comece hoje sua sequência! 💪';
  if (n <= 2)  return 'Bom começo! Continue assim! 🔥';
  if (n <= 5)  return 'Você está em chamas! 🔥🔥';
  return 'Imparável! Lenda do Studio Fitness! 🏆';
}

export function StreakWidget({ streak, loading }: Props) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (streak && streak.currentStreak > 0) {
      setAnimate(true);
      const t = setTimeout(() => setAnimate(false), 700);
      return () => clearTimeout(t);
    }
  }, [streak?.currentStreak]);

  if (loading) {
    return (
      <div className="streak-widget streak-widget--loading">
        <div className="spinner spinner-sm" />
      </div>
    );
  }

  const current = streak?.currentStreak ?? 0;
  const record  = streak?.recordStreak  ?? 0;
  const weeks   = streak?.monthlyWeeks  ?? [];

  return (
    <div className="streak-widget">
      <div className="streak-top">
        <div className={`streak-fire${animate ? ' streak-fire--bounce' : ''}`}>
          🔥
        </div>
        <div className="streak-count-wrap">
          <span className="streak-count">{current}</span>
          <span className="streak-unit">semana{current !== 1 ? 's' : ''}</span>
        </div>
        <div className="streak-record">
          <span className="streak-record-label">Recorde</span>
          <span className="streak-record-value">🏆 {record}</span>
        </div>
      </div>

      {weeks.length > 0 && (
        <div className="streak-weeks">
          {weeks.map((w, i) => (
            <div
              key={w.week}
              className={`streak-week-dot${w.trained ? ' trained' : ''}`}
              title={`Semana ${i + 1} — ${w.trained ? 'Treinou ✓' : 'Não treinou'}`}
            />
          ))}
        </div>
      )}

      <div className="streak-message">{motivationalMessage(current)}</div>
    </div>
  );
}
