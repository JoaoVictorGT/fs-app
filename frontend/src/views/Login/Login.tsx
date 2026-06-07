import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../controllers/useAuth';

export function Login() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const { login, loading, user } = useAuth();
  const navigate = useNavigate();

  // Se já autenticado, redireciona para o dashboard correto
  useEffect(() => {
    if (user) {
      navigate(user.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard', {
        replace: true,
      });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      // onAuthStateChanged vai popular user → useEffect acima redireciona
    } catch (err: any) {
      setError(err.message || 'Credenciais inválidas');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">🏋️</div>
          <div className="login-logo-text">
            Studio <span>Fitness</span>
          </div>
        </div>

        <h1 className="login-title">Bem-vindo de volta</h1>
        <p className="login-subtitle">Acesse sua conta para gerenciar aulas e agendamentos</p>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 16 }}>
            ⚠ {error}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading}
          >
            {loading ? <><span className="spinner spinner-sm" /> Entrando…</> : 'Entrar'}
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <a
            href="/register"
            style={{ fontSize: 13, color: 'var(--text-secondary)' }}
            onClick={e => { e.preventDefault(); navigate('/register'); }}
          >
            Aluno de grupo? <span style={{ color: 'var(--accent)' }}>Cadastre-se</span>
          </a>
        </div>
      </div>
    </div>
  );
}
