import jwt from 'jsonwebtoken';
import { mockAuthUsers } from '../data/mockData';
import { JwtPayload } from '../models/user.model';

export class AuthService {
  async login(email: string, password: string): Promise<{ token: string; user: Omit<JwtPayload, never> }> {
    const authUser = mockAuthUsers.find(u => u.email === email && u.password === password);
    if (!authUser) {
      throw { status: 401, message: 'E-mail ou senha inválidos' };
    }

    const payload: JwtPayload = {
      userId: authUser.id,
      email: authUser.email,
      role: authUser.role,
      name: authUser.name,
      profileId: authUser.profileId,
      teacherId: authUser.teacherId,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'studio-fitness-secret', {
      expiresIn: '7d',
    });

    return { token, user: payload };
  }
}
