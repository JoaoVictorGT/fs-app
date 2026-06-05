export interface Teacher {
  id: string;
  name: string;
  email: string;
  academy: string;
  phone?: string;
  bio?: string;
  createdAt: Date;
}

export type CreateTeacherDTO = Omit<Teacher, 'id' | 'createdAt'>;
export type UpdateTeacherDTO = Partial<CreateTeacherDTO>;
