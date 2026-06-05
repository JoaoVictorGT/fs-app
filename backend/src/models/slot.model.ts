export type SlotType = 'individual' | 'group';
export type SlotStatus = 'available' | 'full' | 'cancelled';

export interface Slot {
  id: string;
  teacherId: string;
  date: string;       // ISO date: YYYY-MM-DD
  startTime: string;  // HH:mm
  endTime: string;    // HH:mm
  capacity: number;
  currentBookings: number;
  type: SlotType;
  status: SlotStatus;
  description?: string;
  createdAt: Date;
}

export type CreateSlotDTO = Omit<Slot, 'id' | 'currentBookings' | 'status' | 'createdAt'>;
export type UpdateSlotDTO = Partial<Omit<CreateSlotDTO, 'teacherId'>>;
