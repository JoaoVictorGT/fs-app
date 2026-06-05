import { useState, useCallback, createContext, useContext } from 'react';
import { AuthUser } from '../models';
import { authService } from '../services/auth.service';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

interface AuthContext extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthCtx = createContext<AuthContext | null>(null);

function loadStoredAuth(): Pick<AuthState, 'user' | 'token'> {
  try {
    const token = localStorage.getItem('sf_token');
    const user = localStorage.getItem('sf_user');
    return { token, user: user ? JSON.parse(user) : null };
  } catch {
    return { token: null, user: null };
  }
}

export function useAuthProvider(): AuthContext {
  const stored = loadStoredAuth();
  const [state, setState] = useState<AuthState>({
    user: stored.user,
    token: stored.token,
    loading: false,
    error: null,
  });

  const login = useCallback(async (email: string, password: string) => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const { token, user } = await authService.login(email, password);
      localStorage.setItem('sf_token', token);
      localStorage.setItem('sf_user', JSON.stringify(user));
      setState({ user, token, loading: false, error: null });
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Erro ao fazer login';
      setState(s => ({ ...s, loading: false, error: msg }));
      throw new Error(msg);
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    localStorage.removeItem('sf_token');
    localStorage.removeItem('sf_user');
    setState({ user: null, token: null, loading: false, error: null });
  }, []);

  return { ...state, login, logout };
}

export function useAuth(): AuthContext {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
