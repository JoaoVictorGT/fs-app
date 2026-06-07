import { useState, FormEvent, useEffect } from 'react';
import { Slot, CreateSlotPayload } from '../../models';

interface Props {
  slot?: Slot;
  onSave: (data: CreateSlotPayload) => Promise<void>;
  onClose: () => void;
}

const today = new Date().toISOString().split('T')[0];

export function SlotModal({ slot, onSave, onClose }: Props) {
  const [form, setForm] = useState<CreateSlotPayload>({
    date: today,
    startTime: '07:00',
    endTime: '08:00',
    capacity: 1,
    type: 'individual',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (slot) {
      setForm({
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        capacity: slot.capacity,
        type: slot.type,
        description: slot.description || '',
      });
    }
  }, [slot]);

  const set = (field: keyof CreateSlotPayload) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const value = field === 'capacity' ? Number(e.target.value) : e.target.value;
      setForm(prev => {
        const next = { ...prev, [field]: value };
        if (field === 'type' && value === 'individual') next.capacity = 1;
        return next;
      });
    };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.startTime >= form.endTime) {
      setError('O horário de início deve ser anterior ao horário de fim');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onSave(form);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao salvar horário');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{slot ? 'Editar horário' : 'Novo horário'}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>⚠ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Data</label>
              <input type="date" className="form-input" min={today} value={form.date} onChange={set('date')} required disabled={loading} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Início</label>
                <input type="time" className="form-input" value={form.startTime} onChange={set('startTime')} required disabled={loading} />
              </div>
              <div className="form-group">
                <label className="form-label">Fim</label>
                <input type="time" className="form-input" value={form.endTime} onChange={set('endTime')} required disabled={loading} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Tipo</label>
                <select className="form-input" value={form.type} onChange={set('type')} disabled={loading}>
                  <option value="individual">Individual</option>
                  <option value="group">Grupo</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Capacidade</label>
                <input
                  type="number"
                  className="form-input"
                  min={1}
                  max={50}
                  value={form.capacity}
                  onChange={set('capacity')}
                  disabled={loading || form.type === 'individual'}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Descrição (opcional)</label>
              <input className="form-input" placeholder="Ex: Treino funcional, circuito…" value={form.description} onChange={set('description')} disabled={loading} />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spinner spinner-sm" /> Salvando…</> : (slot ? 'Salvar alterações' : 'Criar horário')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
