import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ISM ErrorBoundary] Exceção capturada na árvore de renderização:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-secondary-950 text-white p-6">
          <div className="max-w-md w-full text-center space-y-6 bg-secondary-900 p-8 rounded-3xl border border-secondary-800 shadow-2xl">
            <div className="w-16 h-16 bg-brand-500/10 border border-brand-500/30 rounded-2xl flex items-center justify-center mx-auto text-brand-400">
              <img src="/logo-ism.png" alt="Instituto Ser Melhor" className="w-10 h-10 object-contain" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-white">Instituto Ser Melhor</h1>
              <p className="text-secondary-400 text-sm leading-relaxed">
                Ocorreu uma inconsistência temporária na inicialização da página. Nossa equipe já foi notificada.
              </p>
            </div>

            {import.meta.env.DEV && this.state.error && (
              <div className="p-4 bg-red-950/40 border border-red-900/50 rounded-xl text-left text-xs font-mono text-red-300 overflow-auto max-h-40">
                {this.state.error.toString()}
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full py-3.5 px-6 rounded-full bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm uppercase tracking-widest transition-all duration-200 shadow-lg shadow-brand-600/30"
            >
              Recarregar Aplicação
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
