/**
 * ErrorBoundary.tsx
 * Captura exceções em qualquer componente descendente, impedindo tela em branco.
 * Exibe UI de recuperação amigável e registra detalhes técnicos no console.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorId: string;
}

function generateErrorId(): string {
  return `ISM-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

// Classe sem TypeScript class-fields para compatibilidade com useDefineForClassFields: false
class ErrorBoundaryClass extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    (this as any).state = {
      hasError: false,
      error: null,
      errorId: '',
    } as ErrorBoundaryState;
    (this as any).handleReset = (this as any).handleReset.bind(this);
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: generateErrorId(),
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    const state = (this as any).state as ErrorBoundaryState;
    console.error(
      `[ISM ErrorBoundary] Exceção capturada [${state.errorId}]:\n`,
      error,
      '\nComponentStack:',
      errorInfo.componentStack,
    );
  }

  handleReset(): void {
    (this as any).setState({ hasError: false, error: null, errorId: '' });
    window.location.reload();
  }

  render(): React.ReactNode {
    const state = (this as any).state as ErrorBoundaryState;

    if (state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-secondary-950 text-white p-6">
          <div className="max-w-md w-full text-center space-y-6 bg-secondary-900 p-8 rounded-3xl border border-secondary-800 shadow-2xl">
            <div className="w-16 h-16 bg-brand-500/10 border border-brand-500/30 rounded-2xl flex items-center justify-center mx-auto">
              <img src="/logo-ism.png" alt="Instituto Ser Melhor" className="w-10 h-10 object-contain" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-black text-white">Instituto Ser Melhor</h1>
              <p className="text-secondary-400 text-sm leading-relaxed">
                Ocorreu uma inconsistência temporária. Recarregue a página para continuar.
              </p>
              {state.errorId && (
                <p className="text-secondary-600 text-xs font-mono">ID: {state.errorId}</p>
              )}
            </div>

            {import.meta.env.DEV && state.error && (
              <div className="p-4 bg-red-950/40 border border-red-900/50 rounded-xl text-left text-xs font-mono text-red-300 overflow-auto max-h-48 whitespace-pre-wrap">
                {state.error.toString()}
              </div>
            )}

            <button
              onClick={(this as any).handleReset}
              className="w-full py-3.5 px-6 rounded-full bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm uppercase tracking-widest transition-all duration-200 shadow-lg shadow-brand-600/30"
            >
              Recarregar Aplicação
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

// Wrapper tipado para uso externo
export function ErrorBoundary({ children }: ErrorBoundaryProps): React.ReactElement {
  return React.createElement(ErrorBoundaryClass, { children });
}
