export type StudentType = 'personal' | 'group';

export interface Student {
  id: string;
  name: string;
  email: string;
  type: StudentType;
  teacherId: string;
  phone?: string;
  createdAt: Date;
}

export type CreateStudentDTO = Omit<Student, 'id' | 'createdAt'>;
export type UpdateStudentDTO = Partial<Omit<CreateStudentDTO, 'type' | 'teacherId'>>;
