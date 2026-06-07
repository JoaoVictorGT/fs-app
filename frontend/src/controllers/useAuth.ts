import { useState, useCallback, useEffect, createContext, useContext } from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { firebaseAuth } from '../config/firebase';
import { AuthUser } from '../models';
import api from '../services/api';

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

interface AuthContext extends AuthState {
  login:  (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthCtx = createContext<AuthContext | null>(null);

export function useAuthProvider(): AuthContext {
  const [state, setState] = useState<AuthState>({
    user:    null,
    loading: true,   // true até o onAuthStateChanged disparar
    error:   null,
  });

  // Observa mudanças de sessão do Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      firebaseAuth,
      async (firebaseUser: FirebaseUser | null) => {
        if (!firebaseUser) {
          localStorage.removeItem('sf_user');
          setState({ user: null, loading: false, error: null });
          return;
        }

        try {
          // Obtém ID Token fresco e busca o perfil do Firestore via backend
          const token = await firebaseUser.getIdToken();
          localStorage.setItem('sf_token', token);

          const { data } = await api.get<{ user: AuthUser }>('/auth/me');
          localStorage.setItem('sf_user', JSON.stringify(data.user));
          setState({ user: data.user, loading: false, error: null });
        } catch {
          // Token válido mas perfil não encontrado no Firestore (ex: após registro não concluído)
          setState({ user: null, loading: false, error: null });
        }
      }
    );

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      await signInWithEmailAndPassword(firebaseAuth, email, password);
      // onAuthStateChanged dispara automaticamente e carrega o perfil
    } catch (err: any) {
      const code = err.code as string | undefined;
      let msg = 'Erro ao fazer login';
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        msg = 'E-mail ou senha inválidos';
      } else if (code === 'auth/too-many-requests') {
        msg = 'Muitas tentativas. Aguarde alguns minutos.';
      } else if (code === 'auth/network-request-failed') {
        msg = 'Erro de conexão. Verifique sua internet.';
      }
      setState(s => ({ ...s, loading: false, error: msg }));
      throw new Error(msg);
    }
  }, []);

  const logout = useCallback(async () => {
    setState(s => ({ ...s, loading: true }));
    try {
      await signOut(firebaseAuth);
      localStorage.removeItem('sf_token');
      localStorage.removeItem('sf_user');
      // onAuthStateChanged vai setar user = null automaticamente
    } catch {
      // Ignora erros no logout
    }
  }, []);

  return { ...state, login, logout };
}

export function useAuth(): AuthContext {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
