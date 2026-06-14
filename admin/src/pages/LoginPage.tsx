import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogIn, Eye, EyeOff, Leaf, Lock } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [lockUntil, setLockUntil] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Rate limiting: bloqueia após 5 tentativas por 30s
    if (lockUntil && Date.now() < lockUntil) {
      const secs = Math.ceil((lockUntil - Date.now()) / 1000);
      setError(`Muitas tentativas. Aguarde ${secs}s antes de tentar novamente.`);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      setAttempts(0);
      navigate('/');
    } catch (err: any) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= 5) {
        setLockUntil(Date.now() + 30000);
        setAttempts(0);
        setError('5 tentativas falhas. Conta bloqueada por 30 segundos.');
      } else {
        setError(`${err.message || 'Credenciais inválidas.'} (tentativa ${newAttempts}/5)`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'linear-gradient(135deg, #0f1117 0%, #1a2235 100%)',
      fontFamily: 'var(--font-sans)'
    }}>
      {/* Left Branding Panel */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px 80px', position: 'relative', overflow: 'hidden'
      }}
        className="login-left"
      >
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: 500, height: 500, borderRadius: '50%', border: '1px solid rgba(34,197,94,0.1)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: 300, height: 300, borderRadius: '50%', border: '1px solid rgba(34,197,94,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '30%', right: '20%', width: 6, height: 6, borderRadius: '50%', background: '#16a34a', boxShadow: '0 0 20px #16a34a' }} />
        <div style={{ position: 'absolute', top: '60%', right: '35%', width: 4, height: 4, borderRadius: '50%', background: '#4ade80' }} />

        <div style={{ maxWidth: 400, position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 60 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: 'linear-gradient(135deg, #16a34a, #4ade80)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Leaf size={26} color="white" />
            </div>
            <div>
              <div style={{ color: '#4ade80', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Instituto Ser Melhor</div>
              <div style={{ color: 'white', fontSize: 16, fontWeight: 900 }}>Admin Panel</div>
            </div>
          </div>

          <h1 style={{ fontSize: 44, fontWeight: 900, color: 'white', lineHeight: 1.1, marginBottom: 20 }}>
            Painel de<br />
            <span style={{ background: 'linear-gradient(90deg, #4ade80, #22c55e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Gestão Completa
            </span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15, lineHeight: 1.7, marginBottom: 48 }}>
            Gerencie todo o conteúdo do site, acompanhe métricas de impacto e mantenha a transparência quântica do Instituto.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { icon: '✦', text: 'CMS completo para editar qualquer seção' },
              { icon: '✦', text: 'Pipeline Kanban para gestão de conteúdo' },
              { icon: '✦', text: 'Analytics integrado com logs de auditoria' },
              { icon: '✦', text: 'Controle de acesso RBAC em 3 níveis' },
            ].map(({ icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ color: '#4ade80', fontSize: 10 }}>{icon}</span>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div style={{
        width: 460, background: 'white',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px 48px'
      }}>
        <h2 style={{ fontSize: 26, fontWeight: 900, color: 'var(--gray-900)', marginBottom: 6 }}>
          Bem-vindo de volta
        </h2>
        <p style={{ color: 'var(--gray-500)', fontSize: 14, marginBottom: 36 }}>
          Entre com suas credenciais de acesso
        </p>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{
              padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: 10, marginBottom: 20, color: '#b91c1c', fontSize: 13,
              animation: 'fadeIn 0.3s ease'
            }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: 18 }}>
            <label className="input-label">E-mail</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>

          <div style={{ marginBottom: 28 }}>
            <label className="input-label">Senha</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                className="input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--gray-400)', display: 'flex', alignItems: 'center'
                }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: 14, borderRadius: 12 }}
          >
            {loading ? (
              <span className="animate-spin" style={{ display: 'flex' }}>
                <LogIn size={16} />
              </span>
            ) : (
              <><LogIn size={16} /> Entrar no Painel</>
            )}
          </button>
        </form>

        {/* Aviso de segurança */}
        <div style={{ marginTop: 28, padding: '14px 18px', background: '#f9fafb', borderRadius: 12, border: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Lock size={14} color="#9ca3af" style={{ flexShrink: 0 }} />
          <p style={{ fontSize: 11, color: '#9ca3af', margin: 0, lineHeight: 1.5 }}>
            Acesso restrito. Suas tentativas de login são registradas. Em caso de perda de acesso, contate o administrador.
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .login-left { display: none !important; }
        }
      `}</style>
    </div>
  );
};
