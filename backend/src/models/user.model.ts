export type UserRole = 'teacher' | 'student';

export interface AuthUser {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  name: string;
  /** For students: references student.id; for teachers: references teacher.id */
  profileId: string;
  /** Only for personal students — references teacher.id */
  teacherId?: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
  profileId: string;
  teacherId?: string;
}
