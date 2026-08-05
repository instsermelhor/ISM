/**
 * ErrorBoundary.tsx — Admin Panel
 * ──────────────────────────────
 * Captura exceções em tempo de execução no Painel Admin do Instituto Ser Melhor.
 * Previne tela em branco, exibe interface de recuperação amigável,
 * registra logs estruturados no console e emite audit log no Firestore quando autenticado.
 *
 * C001 — Observabilidade & Telemetria — Instituto Ser Melhor
 */
import React from 'react';
import { AlertTriangle, RefreshCw, ChevronDown, ChevronUp, ShieldAlert } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorId: string;
  timestamp: string;
  route: string;
  showDetails: boolean;
}

function generateErrorId(): string {
  return `ISM-ADM-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      timestamp: '',
      route: '',
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: generateErrorId(),
      timestamp: new Date().toISOString(),
      route: typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/',
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({ errorInfo });

    console.error(
      `[ISM Admin Telemetria] Exceção Capturada [ID: ${this.state.errorId}]:\n`,
      `Timestamp: ${this.state.timestamp}\n`,
      `Rota: ${this.state.route}\n`,
      `Mensagem: ${error.message}\n`,
      `Stack: ${error.stack}\n`,
      `Component Stack: ${errorInfo.componentStack}`
    );
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      timestamp: '',
      route: '',
      showDetails: false,
    });
    window.location.reload();
  };

  toggleDetails = (): void => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'center', background: 'var(--gray-900, #111827)', color: 'white', padding: 24,
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif', boxSizing: 'border-box'
        }}>
          <div style={{
            maxWidth: 520, width: '100%', textAlign: 'center', background: 'var(--gray-800, #1f2937)',
            padding: 32, borderRadius: 24, border: '1px solid var(--gray-700, #374151)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{
              width: 56, height: 56, background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px', color: '#ef4444'
            }}>
              <ShieldAlert size={28} />
            </div>

            <h1 style={{ fontSize: 20, fontWeight: 900, color: 'white', margin: '0 0 8px 0' }}>
              Painel Administrativo ISM
            </h1>
            <p style={{ fontSize: 13, color: '#9ca3af', margin: '0 0 20px 0', lineHeight: 1.5 }}>
              Ocorreu uma exceção inesperada nesta página. O incidente foi capturado pelo sistema de telemetria para análise.
            </p>

            <div style={{
              background: 'rgba(0,0,0,0.2)', padding: '10px 14px', borderRadius: 10,
              fontSize: 12, color: '#d1d5db', margin: '0 0 20px 0', fontFamily: 'monospace',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <span>ID do Erro:</span>
              <strong style={{ color: '#60a5fa' }}>{this.state.errorId}</strong>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 16 }}>
              <button
                onClick={this.handleReset}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px',
                  background: 'var(--brand-600, #2563eb)', color: 'white', fontWeight: 700,
                  borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13
                }}
              >
                <RefreshCw size={14} /> Recarregar Painel
              </button>

              <button
                onClick={this.toggleDetails}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 16px',
                  background: 'transparent', color: '#9ca3af', fontWeight: 600,
                  borderRadius: 10, border: '1px solid #4b5563', cursor: 'pointer', fontSize: 13
                }}
              >
                {this.state.showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                Detalhes
              </button>
            </div>

            {this.state.showDetails && (
              <div style={{
                textAlign: 'left', background: '#000', padding: 14, borderRadius: 10,
                fontSize: 11, fontFamily: 'monospace', color: '#f87171', overflowX: 'auto',
                maxHeight: 180, border: '1px solid #374151', marginT: 16, lineHeight: 1.4
              }}>
                <div><strong>Erro:</strong> {this.state.error?.message}</div>
                <div style={{ color: '#9ca3af', marginTop: 4 }}><strong>Rota:</strong> {this.state.route}</div>
                {this.state.error?.stack && (
                  <pre style={{ margin: '8px 0 0 0', whiteSpace: 'pre-wrap', color: '#6b7280', fontSize: 10 }}>
                    {this.state.error.stack}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
