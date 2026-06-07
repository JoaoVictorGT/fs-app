import api from './api';
import { AuthUser } from '../models';

/**
 * authService — apenas para interações com o backend.
 * Login/logout são gerenciados pelo Firebase SDK via useAuth.
 */
export const authService = {
  /** Busca o perfil do usuário autenticado no Firestore (via backend). */
  async me(): Promise<AuthUser> {
    const { data } = await api.get<{ user: AuthUser }>('/auth/me');
    return data.user;
  },
};
