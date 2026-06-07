import { useState } from 'react';
import { useAuth } from '../../controllers/useAuth';
import { useSlots } from '../../controllers/useSlots';
import { Slot, CreateSlotPayload } from '../../models';
import { SlotCard } from '../components/SlotCard';
import { SlotModal } from './SlotModal';
import { LoadingSpinner } from '../components/LoadingSpinner';

export function TeacherSlots() {
  const { user } = useAuth();
  const { slots, loading, error, createSlot, updateSlot, cancelSlot, deleteSlot } = useSlots({ teacherId: user?.profileId });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<Slot | undefined>();
  const [filter, setFilter] = useState<'all' | 'available' | 'full' | 'cancelled'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleSave = async (data: CreateSlotPayload) => {
    if (editingSlot) {
      await updateSlot(editingSlot.id, data);
      showToast('Horário atualizado com sucesso');
    } else {
      await createSlot(data);
      showToast('Horário criado com sucesso');
    }
    setEditingSlot(undefined);
  };

  const handleCancel = async (slot: Slot) => {
    if (!confirm(`Cancelar o horário de ${slot.startTime} – ${slot.endTime}?`)) return;
    setActionLoading(slot.id);
    try {
      await cancelSlot(slot.id);
      showToast('Horário cancelado');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao cancelar');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (slot: Slot) => {
    if (!confirm('Excluir este horário permanentemente?')) return;
    setActionLoading(slot.id);
    try {
      await deleteSlot(slot.id);
      showToast('Horário excluído');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao excluir');
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = filter === 'all' ? slots : slots.filter(s => s.status === filter);

  return (
    <div className="container main-content">
      {toast && (
        <div className="alert alert-success" style={{ position: 'fixed', top: 80, right: 24, zIndex: 300, minWidth: 260 }}>
          ✓ {toast}
        </div>
      )}

      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Meus Horários</h1>
          <p className="page-subtitle">Gerencie seus slots de aula</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => { setEditingSlot(undefined); setModalOpen(true); }}>
            + Novo horário
          </button>
        </div>
      </div>

      <div className="filters-bar">
        {(['all', 'available', 'full', 'cancelled'] as const).map(f => (
          <button
            key={f}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' && 'Todos'}
            {f === 'available' && 'Disponíveis'}
            {f === 'full' && 'Lotados'}
            {f === 'cancelled' && 'Cancelados'}
            {' '}
            <span style={{ opacity: 0.7 }}>
              ({f === 'all' ? slots.length : slots.filter(s => s.status === f).length})
            </span>
          </button>
        ))}
      </div>

      {loading && <LoadingSpinner />}
      {error && <div className="alert alert-error">{error}</div>}

      {!loading && filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <h3>Nenhum horário encontrado</h3>
          <p>Clique em &quot;Novo horário&quot; para começar</p>
        </div>
      )}

      {!loading && (
        <div className="slot-grid">
          {filtered.map(slot => (
            <SlotCard
              key={slot.id}
              slot={slot}
              mode="teacher"
              loading={actionLoading === slot.id}
              onEdit={s => { setEditingSlot(s); setModalOpen(true); }}
              onCancel={handleCancel}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {modalOpen && (
        <SlotModal
          slot={editingSlot}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditingSlot(undefined); }}
        />
      )}
    </div>
  );
}
