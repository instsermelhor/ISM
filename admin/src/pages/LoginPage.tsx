import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogIn, Eye, EyeOff, Leaf, Lock, Mail, ArrowLeft, CheckCircle, KeyRound, X } from 'lucide-react';
import { PasswordResetService } from '../services/api';

// ── Tipos internos do fluxo de recuperação ──────────────────────
type ResetStep = 'email' | 'choose' | 'sent';

interface RecoveryOptions {
  hasPrimary: boolean;
  hasSecondary: boolean;
  maskedPrimary?: string;
  maskedSecondary?: string;
}

// ── Modal de Recuperação de Senha ────────────────────────────────
const ForgotPasswordModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [step, setStep] = useState<ResetStep>('email');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<RecoveryOptions | null>(null);
  const [sentTo, setSentTo] = useState('');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await PasswordResetService.getRecoveryOptions(email.trim());
      setOptions(result);
      setStep('choose');
    } catch {
      setError('Não foi possível processar sua solicitação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendReset = async (type: 'primary' | 'secondary') => {
    setLoading(true);
    setError(null);
    try {
      const result = await PasswordResetService.sendResetLink(email.trim(), type);
      setSentTo(result.maskedEmail);
      setStep('sent');
    } catch {
      setError('Falha ao enviar o link. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, animation: 'fadeIn 0.2s ease',
    }}>
      <div style={{
        background: 'white', borderRadius: 20, width: '100%', maxWidth: 440,
        padding: '40px 40px 36px', position: 'relative',
        boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
        animation: 'slideUp 0.25s cubic-bezier(.16,1,.3,1)',
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16, background: 'none', border: 'none',
            cursor: 'pointer', color: '#9ca3af', padding: 6, borderRadius: 8,
            display: 'flex', alignItems: 'center', transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#f3f4f6')}
          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          aria-label="Fechar"
        >
          <X size={18} />
        </button>

        {/* ── STEP: email ── */}
        {step === 'email' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <KeyRound size={20} color="#2563eb" />
              </div>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#111827', margin: 0 }}>
                  Recuperar senha
                </h3>
                <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>
                  Informe o e-mail cadastrado na sua conta
                </p>
              </div>
            </div>

            {error && (
              <div style={{
                padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca',
                borderRadius: 10, marginBottom: 16, color: '#b91c1c', fontSize: 13,
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleEmailSubmit}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                E-mail da conta
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                autoFocus
                style={{
                  width: '100%', padding: '11px 14px', border: '1.5px solid #d1d5db',
                  borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.15s', marginBottom: 20,
                }}
                onFocus={e => (e.currentTarget.style.borderColor = '#2563eb')}
                onBlur={e => (e.currentTarget.style.borderColor = '#d1d5db')}
              />
              <button
                type="submit"
                disabled={loading || !email.trim()}
                style={{
                  width: '100%', padding: '12px', borderRadius: 11,
                  background: loading ? '#93c5fd' : 'linear-gradient(135deg, #1d4ed8, #2563eb)',
                  color: 'white', border: 'none', fontSize: 14, fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'opacity 0.15s',
                }}
              >
                {loading ? 'Verificando...' : <><Mail size={15} /> Continuar</>}
              </button>
            </form>
          </>
        )}

        {/* ── STEP: choose email ── */}
        {step === 'choose' && options && (
          <>
            <button
              onClick={() => setStep('email')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
                cursor: 'pointer', color: '#6b7280', fontSize: 13, padding: 0, marginBottom: 20,
              }}
            >
              <ArrowLeft size={14} /> Voltar
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Mail size={20} color="#16a34a" />
              </div>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#111827', margin: 0 }}>
                  Escolha onde receber o link
                </h3>
                <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>
                  Selecione o endereço de e-mail para envio
                </p>
              </div>
            </div>

            {error && (
              <div style={{
                padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca',
                borderRadius: 10, marginBottom: 16, color: '#b91c1c', fontSize: 13,
              }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* E-mail primário */}
              {options.hasPrimary && (
                <button
                  onClick={() => handleSendReset('primary')}
                  disabled={loading}
                  style={{
                    padding: '16px 20px', borderRadius: 12,
                    border: '1.5px solid #e5e7eb', background: loading ? '#f9fafb' : 'white',
                    cursor: loading ? 'not-allowed' : 'pointer', textAlign: 'left',
                    transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 14,
                  }}
                  onMouseEnter={e => { if (!loading) { e.currentTarget.style.borderColor = '#16a34a'; e.currentTarget.style.background = '#f0fdf4'; } }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = 'white'; }}
                >
                  <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Mail size={16} color="#16a34a" />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 2 }}>
                      E-mail primário (principal)
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>
                      {options.maskedPrimary}
                    </div>
                  </div>
                </button>
              )}

              {/* E-mail secundário */}
              {options.hasSecondary && options.maskedSecondary && (
                <button
                  onClick={() => handleSendReset('secondary')}
                  disabled={loading}
                  style={{
                    padding: '16px 20px', borderRadius: 12,
                    border: '1.5px solid #e5e7eb', background: loading ? '#f9fafb' : 'white',
                    cursor: loading ? 'not-allowed' : 'pointer', textAlign: 'left',
                    transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 14,
                  }}
                  onMouseEnter={e => { if (!loading) { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.background = '#faf5ff'; } }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = 'white'; }}
                >
                  <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: 'linear-gradient(135deg, #faf5ff, #ede9fe)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Mail size={16} color="#7c3aed" />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 2 }}>
                      E-mail secundário (backup)
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>
                      {options.maskedSecondary}
                    </div>
                  </div>
                </button>
              )}
            </div>

            {loading && (
              <p style={{ textAlign: 'center', fontSize: 13, color: '#6b7280', marginTop: 16 }}>
                Enviando link de recuperação...
              </p>
            )}
          </>
        )}

        {/* ── STEP: sent ── */}
        {step === 'sent' && (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <CheckCircle size={32} color="#16a34a" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111827', marginBottom: 8 }}>
              Link enviado com sucesso!
            </h3>
            <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6, marginBottom: 24 }}>
              Um link de recuperação de senha foi enviado para{' '}
              <strong style={{ color: '#111827' }}>{sentTo}</strong>.
              <br />
              Verifique sua caixa de entrada e o spam.
            </p>
            <div style={{
              padding: '12px 16px', background: '#fffbeb', border: '1px solid #fde68a',
              borderRadius: 10, fontSize: 12, color: '#92400e', marginBottom: 20, textAlign: 'left',
            }}>
              ⚠️ O link expira em <strong>30 minutos</strong>. Se não receber, aguarde alguns minutos e tente novamente.
            </div>
            <button
              onClick={onClose}
              style={{
                width: '100%', padding: '12px', borderRadius: 11,
                background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                color: 'white', border: 'none', fontSize: 14, fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Voltar ao login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Página de Login ──────────────────────────────────────────────
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
  const [showForgot, setShowForgot] = useState(false);

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
    <>
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

            <div style={{ marginBottom: 12 }}>
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

            {/* Esqueci minha senha */}
            <div style={{ textAlign: 'right', marginBottom: 24 }}>
              <button
                type="button"
                onClick={() => setShowForgot(true)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#2563eb', fontSize: 13, fontWeight: 600, padding: 0,
                  textDecoration: 'underline', textUnderlineOffset: 3,
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#1d4ed8')}
                onMouseLeave={e => (e.currentTarget.style.color = '#2563eb')}
              >
                Esqueci minha senha
              </button>
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
              Acesso restrito. Suas tentativas de login são registradas. Em caso de perda de acesso, utilize a recuperação de senha ou contate o administrador.
            </p>
          </div>
        </div>

        <style>{`
          @media (max-width: 768px) {
            .login-left { display: none !important; }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px) scale(0.97); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>
      </div>

      {/* Modal Recuperação de Senha */}
      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}
    </>
  );
};
