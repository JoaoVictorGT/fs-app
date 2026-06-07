import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Teacher } from '../../models';

export function StudentRegister() {
  const navigate  = useNavigate();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [form, setForm] = useState({
    name:      '',
    email:     '',
    password:  '',
    phone:     '',
    teacherId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.get('/teachers').then(r => setTeachers(r.data)).catch(() => {});
  }, []);

  const set = (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (form.password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      setLoading(false);
      return;
    }

    try {
      /**
       * O backend usa o Firebase Admin SDK para criar o usuário no Firebase Auth
       * e o documento no Firestore — não precisa de token aqui.
       */
      await api.post('/students/register', {
        name:      form.name,
        email:     form.email,
        password:  form.password,
        phone:     form.phone || undefined,
        teacherId: form.teacherId,
        type:      'group',
      });

      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao realizar cadastro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card" style={{ maxWidth: 460 }}>
        <div className="login-logo">
          <div className="login-logo-icon">🏋️</div>
          <div className="login-logo-text">Studio <span>Fitness</span></div>
        </div>

        <h1 className="login-title">Criar conta</h1>
        <p className="login-subtitle">Cadastre-se como aluno de grupo</p>

        {success && (
          <div className="alert alert-success" style={{ marginBottom: 16 }}>
            ✓ Conta criada com sucesso! Redirecionando para o login…
          </div>
        )}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: 16 }}>
            ⚠ {error}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nome completo</label>
            <input
              className="form-input"
              placeholder="Seu nome completo"
              value={form.name}
              onChange={set('name')}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">E-mail</label>
            <input
              type="email"
              className="form-input"
              placeholder="seu@email.com"
              value={form.email}
              onChange={set('email')}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Senha</label>
            <input
              type="password"
              className="form-input"
              placeholder="Mínimo 6 caracteres"
              value={form.password}
              onChange={set('password')}
              required
              minLength={6}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Telefone <span style={{ opacity: 0.5 }}>(opcional)</span></label>
            <input
              className="form-input"
              placeholder="(41) 99999-0000"
              value={form.phone}
              onChange={set('phone')}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Professor</label>
            <select
              className="form-input"
              value={form.teacherId}
              onChange={set('teacherId')}
              required
              disabled={loading}
            >
              <option value="">Selecione um professor</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{t.name} — {t.academy}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading || success}
          >
            {loading
              ? <><span className="spinner spinner-sm" /> Cadastrando…</>
              : 'Criar conta'}
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <a
            href="/login"
            style={{ fontSize: 13, color: 'var(--text-secondary)' }}
            onClick={e => { e.preventDefault(); navigate('/login'); }}
          >
            Já tem conta? <span style={{ color: 'var(--accent)' }}>Entrar</span>
          </a>
        </div>
      </div>
    </div>
  );
}
