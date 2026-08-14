import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { OfflineQueueService } from '../../services/offlineQueueService';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [pendingCount, setPendingCount] = useState(0);
  const [justReconnected, setJustReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setJustReconnected(true);
      setTimeout(() => setJustReconnected(false), 4000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setJustReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const unsubscribe = OfflineQueueService.subscribe((count) => {
      setPendingCount(count);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, []);

  if (isOnline && !justReconnected && pendingCount === 0) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed top-3 left-1/2 -translate-x-1/2 z-50 animate-fade-in px-4 py-2 rounded-full shadow-lg border text-xs font-semibold flex items-center gap-2 transition-all ${
        !isOnline
          ? 'bg-amber-500 text-white border-amber-600'
          : justReconnected
          ? 'bg-emerald-600 text-white border-emerald-700'
          : 'bg-blue-600 text-white border-blue-700'
      }`}
    >
      {!isOnline ? (
        <>
          <WifiOff size={14} className="animate-pulse" />
          <span>Você está offline. O site continua funcionando e dados serão sincronizados ao reconectar.</span>
          {pendingCount > 0 && (
            <span className="bg-amber-700/80 px-2 py-0.5 rounded-full text-[10px] font-bold">
              {pendingCount} pendente{pendingCount > 1 ? 's' : ''}
            </span>
          )}
        </>
      ) : justReconnected ? (
        <>
          <CheckCircle2 size={14} />
          <span>Conexão restabelecida! Sincronizando dados pendentes...</span>
        </>
      ) : (
        <>
          <RefreshCw size={14} className="animate-spin" />
          <span>Sincronizando {pendingCount} envio{pendingCount > 1 ? 's' : ''} pendente{pendingCount > 1 ? 's' : ''}...</span>
        </>
      )}
    </div>
  );
};
