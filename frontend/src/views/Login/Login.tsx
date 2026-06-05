import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../controllers/useAuth';

const DEMO_CREDS = [
  { label: 'Professor', email: 'maria@studiofitness.com', password: 'teacher123' },
  { label: 'Aluno (personal)', email: 'joao@email.com', password: 'student123' },
  { label: 'Aluno (grupo)', email: 'carlos@email.com', password: 'student123' },
];

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      const stored = localStorage.getItem('sf_user');
      const authUser = stored ? JSON.parse(stored) : null;
      if (authUser?.role === 'teacher') navigate('/teacher/dashboard');
      else navigate('/student/dashboard');
    } catch (err: any) {
      setError(err.message || 'Credenciais inválidas');
    }
  };

  const fillCreds = (c: typeof DEMO_CREDS[0]) => {
    setEmail(c.email);
    setPassword(c.password);
    setError('');
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

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? <><span className="spinner spinner-sm" /> Entrando…</> : 'Entrar'}
          </button>
        </form>

        <div className="login-demo">
          <p>Credenciais de demonstração</p>
          {DEMO_CREDS.map(c => (
            <div
              key={c.email}
              className="cred"
              style={{ cursor: 'pointer', padding: '4px 0', borderRadius: 4 }}
              onClick={() => fillCreds(c)}
            >
              <span>{c.label}</span>
              <span style={{ color: 'var(--accent)', fontSize: 11 }}>{c.email}</span>
            </div>
          ))}
          <p style={{ marginTop: 6, fontSize: 11, color: 'var(--text-muted)' }}>
            Clique em uma credencial para preencher automaticamente
          </p>
        </div>

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
