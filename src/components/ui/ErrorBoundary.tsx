/**
 * ErrorBoundary.tsx
 * Captura exceções em qualquer componente descendente, impedindo tela em branco.
 * Exibe UI de recuperação amigável, registra detalhes técnicos completos no console,
 * e disponibiliza o ID do erro (ex: ISM-MSDHDTJI-1SYH) para auditoria forense.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

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
  return `ISM-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

class ErrorBoundaryClass extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    (this as any).state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      timestamp: '',
      route: '',
      showDetails: false,
    } as ErrorBoundaryState;
    (this as any).handleReset = (this as any).handleReset.bind(this);
    (this as any).toggleDetails = (this as any).toggleDetails.bind(this);
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
    const state = (this as any).state as ErrorBoundaryState;
    (this as any).setState({ errorInfo });

    console.error(
      `[ISM Forensic Audit] Exceção Bootstrap Capturada [ID: ${state.errorId}]:\n`,
      `\nTimestamp: ${state.timestamp}`,
      `\nRota: ${state.route}`,
      `\nMensagem: ${error.message}`,
      `\nStack Trace:\n${error.stack}`,
      `\nComponent Stack:\n${errorInfo.componentStack}`,
    );
  }

  handleReset(): void {
    (this as any).setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      timestamp: '',
      route: '',
      showDetails: false,
    });
    window.location.reload();
  }

  toggleDetails(): void {
    const state = (this as any).state as ErrorBoundaryState;
    (this as any).setState({ showDetails: !state.showDetails });
  }

  render(): React.ReactNode {
    const state = (this as any).state as ErrorBoundaryState;

    if (state.hasError) {
      const isDev = import.meta.env.DEV || (typeof window !== 'undefined' && window.location.search.includes('debug=true'));

      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-secondary-950 text-white p-6">
          <div className="max-w-lg w-full text-center space-y-6 bg-secondary-900 p-8 rounded-3xl border border-secondary-800 shadow-2xl">
            <div className="w-16 h-16 bg-brand-500/10 border border-brand-500/30 rounded-2xl flex items-center justify-center mx-auto">
              <img src="/logo-ism.png" alt="Instituto Ser Melhor" className="w-10 h-10 object-contain" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-black text-white">Instituto Ser Melhor</h1>
              <p className="text-secondary-400 text-sm leading-relaxed">
                Ocorreu uma inconsistência temporária na inicialização da página.
              </p>
              {state.errorId && (
                <p className="text-brand-400 text-xs font-mono font-bold bg-brand-500/10 border border-brand-500/20 py-1 px-3 rounded-full inline-block mt-2">
                  ID do erro: {state.errorId}
                </p>
              )}
            </div>

            {/* Painel expansível de depuração técnica */}
            {(isDev || state.showDetails) && (
              <div className="p-4 bg-red-950/40 border border-red-900/50 rounded-xl text-left text-xs font-mono text-red-300 overflow-auto max-h-64 space-y-3">
                <div>
                  <span className="font-bold text-red-400">Exceção:</span> {state.error?.name}: {state.error?.message}
                </div>
                {state.route && (
                  <div>
                    <span className="font-bold text-red-400">Rota:</span> {state.route}
                  </div>
                )}
                {state.timestamp && (
                  <div>
                    <span className="font-bold text-red-400">Data/Hora:</span> {state.timestamp}
                  </div>
                )}
                {state.error?.stack && (
                  <div>
                    <span className="font-bold text-red-400">Stack Trace:</span>
                    <pre className="mt-1 whitespace-pre-wrap text-[11px] text-red-200">{state.error.stack}</pre>
                  </div>
                )}
                {state.errorInfo?.componentStack && (
                  <div>
                    <span className="font-bold text-red-400">Component Stack:</span>
                    <pre className="mt-1 whitespace-pre-wrap text-[11px] text-red-200">{state.errorInfo.componentStack}</pre>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={(this as any).handleReset}
                className="w-full py-3.5 px-6 rounded-full bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm uppercase tracking-widest transition-all duration-200 shadow-lg shadow-brand-600/30"
              >
                Recarregar Aplicação
              </button>

              {!isDev && (
                <button
                  onClick={(this as any).toggleDetails}
                  className="text-xs text-secondary-500 hover:text-secondary-300 underline transition-colors"
                >
                  {state.showDetails ? 'Ocultar detalhes técnicos' : 'Exibir detalhes técnicos'}
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

export function ErrorBoundary({ children }: ErrorBoundaryProps): React.ReactElement {
  return React.createElement(ErrorBoundaryClass, { children });
}
