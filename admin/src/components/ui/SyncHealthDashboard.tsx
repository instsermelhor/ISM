/**
 * SyncHealthDashboard.tsx
 * ────────────────────────
 * Widget que monitora o status de sincronização bidirecional
 * entre o Painel Administrativo e o Site Institucional.
 *
 * Verifica todas as 14 coleções/documentos Firestore e exibe:
 *  - Status de cada coleção (OK / Vazio / Erro)
 *  - Timestamp da última atualização
 *  - Alertas para administradores
 */

import React, { useEffect, useState } from 'react';
import {
  CheckCircle2, AlertTriangle, XCircle, RefreshCw,
  Clock, Database, Wifi, WifiOff, ExternalLink,
} from 'lucide-react';
import {
  doc, getDoc, getDocs, collection,
  query, orderBy, limit, Timestamp,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useNavigate } from 'react-router-dom';

// ── Tipos ──────────────────────────────────────────────────────────────────────

type SyncStatus = 'OK' | 'EMPTY' | 'ERROR' | 'LOADING';

interface CollectionHealth {
  id: string;
  label: string;
  collection: string;
  docId?: string;          // Preenchido apenas para documentos únicos
  adminPath: string;       // Rota do admin para editar
  status: SyncStatus;
  count?: number;
  lastUpdated?: Date | null;
  errorMsg?: string;
}

// ── Configuração das 14 coleções ───────────────────────────────────────────────

const COLLECTIONS_TO_CHECK: Omit<CollectionHealth, 'status' | 'count' | 'lastUpdated' | 'errorMsg'>[] = [
  { id: 'hero',       label: 'Hero / Capa',           collection: 'hero_section',       docId: 'main', adminPath: '/site/hero' },
  { id: 'instpage',   label: 'Página Institucional',  collection: 'institutional_page', docId: 'main', adminPath: '/site/institucional' },
  { id: 'nav',        label: 'Navegação (Menu)',       collection: 'site_navigation',    docId: 'main', adminPath: '/site/navegacao' },
  { id: 'footer',     label: 'Rodapé',                collection: 'site_footer',        docId: 'main', adminPath: '/site/navegacao' },
  { id: 'seo',        label: 'SEO',                   collection: 'seo_settings',       docId: 'main', adminPath: '/site/seo' },
  { id: 'donation',   label: 'Seção de Doações',      collection: 'donation_section',   docId: 'main', adminPath: '/site/doacoes' },
  { id: 'services',   label: 'Serviços / Transparência', collection: 'services_page',  docId: 'main', adminPath: '/site/projetos' },
  { id: 'metrics',    label: 'Métricas de Impacto',   collection: 'impact_metrics',     adminPath: '/site/metricas' },
  { id: 'pillars',    label: 'Pilares',               collection: 'pillars',            adminPath: '/site/pilares' },
  { id: 'values',     label: 'Valores Institucionais',collection: 'value_blocks',       adminPath: '/site/institucional' },
  { id: 'govInst',    label: 'Governança (Instâncias)',collection: 'governance_instances', adminPath: '/site/institucional' },
  { id: 'govMem',     label: 'Governança (Membros)',  collection: 'governance_members', adminPath: '/site/institucional' },
  { id: 'timeline',   label: 'Linha do Tempo',        collection: 'timeline_milestones',adminPath: '/site/institucional' },
  { id: 'programs',   label: 'Programas',             collection: 'programs',           adminPath: '/site/projetos' },
  { id: 'blog',       label: 'Blog / Notícias',       collection: 'blog_posts',         adminPath: '/blog' },
  { id: 'partners',   label: 'Parceiros Publicados',  collection: 'partners',           adminPath: '/parceiros' },
];

// ── Status Color Helper ────────────────────────────────────────────────────────

function statusColor(s: SyncStatus) {
  if (s === 'OK')      return '#16a34a';
  if (s === 'EMPTY')   return '#f59e0b';
  if (s === 'ERROR')   return '#ef4444';
  return '#94a3b8';
}

function statusIcon(s: SyncStatus) {
  if (s === 'OK')      return <CheckCircle2 size={14} />;
  if (s === 'EMPTY')   return <AlertTriangle size={14} />;
  if (s === 'ERROR')   return <XCircle size={14} />;
  return <RefreshCw size={14} className="animate-spin" />;
}

function statusLabel(s: SyncStatus) {
  if (s === 'OK')      return 'Sincronizado';
  if (s === 'EMPTY')   return 'Sem dados';
  if (s === 'ERROR')   return 'Erro';
  return 'Verificando…';
}

// ── Função de verificação de saúde ────────────────────────────────────────────

async function checkCollection(
  item: Omit<CollectionHealth, 'status' | 'count' | 'lastUpdated' | 'errorMsg'>
): Promise<CollectionHealth> {
  try {
    if (item.docId) {
      // Documento único
      const snap = await getDoc(doc(db, item.collection, item.docId));
      if (!snap.exists()) {
        return { ...item, status: 'EMPTY', count: 0, lastUpdated: null };
      }
      const data = snap.data();
      const ts = data?.updatedAt;
      const lastUpdated = ts instanceof Timestamp
        ? ts.toDate()
        : (ts ? new Date(ts) : null);
      return { ...item, status: 'OK', count: 1, lastUpdated };
    } else {
      // Coleção
      const q = query(collection(db, item.collection), orderBy('updatedAt', 'desc'), limit(1));
      const snap = await getDocs(q);

      // Contar total (usando getDocs na coleção completa para get de count)
      const allSnap = await getDocs(collection(db, item.collection));
      const count = allSnap.size;

      if (count === 0) {
        return { ...item, status: 'EMPTY', count: 0, lastUpdated: null };
      }

      const lastDoc = snap.docs[0]?.data();
      const ts = lastDoc?.updatedAt;
      const lastUpdated = ts instanceof Timestamp
        ? ts.toDate()
        : (ts ? new Date(ts) : null);

      return { ...item, status: 'OK', count, lastUpdated };
    }
  } catch (err: any) {
    return {
      ...item,
      status: 'ERROR',
      errorMsg: err?.message ?? 'Erro desconhecido',
    };
  }
}

function formatRelTime(d: Date | null | undefined): string {
  if (!d) return 'nunca atualizado';
  const diff = Date.now() - d.getTime();
  if (diff < 60000)    return 'agora mesmo';
  if (diff < 3600000)  return `há ${Math.floor(diff / 60000)} min`;
  if (diff < 86400000) return `há ${Math.floor(diff / 3600000)}h`;
  return `há ${Math.floor(diff / 86400000)}d`;
}

// ── Componente Principal ───────────────────────────────────────────────────────

export const SyncHealthDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<CollectionHealth[]>(
    COLLECTIONS_TO_CHECK.map(c => ({ ...c, status: 'LOADING' as SyncStatus }))
  );
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const onOnline  = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline); };
  }, []);

  const runCheck = async () => {
    setIsChecking(true);
    setItems(prev => prev.map(i => ({ ...i, status: 'LOADING' as SyncStatus })));

    // Verifica todas as coleções em paralelo (lotes de 4 para não sobrecarregar)
    const results: CollectionHealth[] = [];
    const chunks = [];
    for (let i = 0; i < COLLECTIONS_TO_CHECK.length; i += 4) {
      chunks.push(COLLECTIONS_TO_CHECK.slice(i, i + 4));
    }
    for (const chunk of chunks) {
      const chunkResults = await Promise.all(chunk.map(checkCollection));
      results.push(...chunkResults);
      // Atualiza progressivamente
      setItems(prev => {
        const next = [...prev];
        chunkResults.forEach(r => {
          const idx = next.findIndex(n => n.id === r.id);
          if (idx >= 0) next[idx] = r;
        });
        return next;
      });
    }

    setLastChecked(new Date());
    setIsChecking(false);
  };

  useEffect(() => { runCheck(); }, []);

  // ── Estatísticas gerais ────────────────────────────────────────────────────
  const total   = items.length;
  const okCount = items.filter(i => i.status === 'OK').length;
  const emptyCount = items.filter(i => i.status === 'EMPTY').length;
  const errCount = items.filter(i => i.status === 'ERROR').length;
  const loadingCount = items.filter(i => i.status === 'LOADING').length;
  const healthPct = total ? Math.round((okCount / total) * 100) : 0;

  const healthColor = healthPct === 100 ? '#16a34a'
    : healthPct >= 80 ? '#f59e0b'
    : '#ef4444';

  return (
    <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 24px', borderBottom: '1px solid #f3f4f6',
        background: 'linear-gradient(135deg, #f0fdf4, #eff6ff)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: `${healthColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: healthColor }}>
            <Database size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#111827' }}>
              Saúde da Sincronização
            </h3>
            <p style={{ margin: 0, fontSize: 11, color: '#6b7280', fontWeight: 600 }}>
              Admin ↔ Site Institucional — Todas as coleções Firestore
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Online indicator */}
          <span style={{
            display: 'flex', alignItems: 'center', gap: 5,
            fontSize: 11, fontWeight: 700,
            color: isOnline ? '#16a34a' : '#ef4444',
          }}>
            {isOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
            {isOnline ? 'Online' : 'Offline'}
          </span>

          {/* Health % */}
          <span style={{
            fontSize: 22, fontWeight: 900, color: healthColor,
          }}>
            {loadingCount > 0 ? '…' : `${healthPct}%`}
          </span>

          {/* Refresh */}
          <button
            onClick={runCheck}
            disabled={isChecking}
            title="Verificar novamente"
            style={{
              background: isChecking ? '#f3f4f6' : '#f0fdf4',
              border: '1px solid #d1fae5',
              borderRadius: 8, padding: '6px 10px',
              cursor: isChecking ? 'not-allowed' : 'pointer',
              color: '#16a34a', display: 'flex', alignItems: 'center', gap: 5,
              fontSize: 12, fontWeight: 700,
            }}
          >
            <RefreshCw size={13} className={isChecking ? 'animate-spin' : ''} />
            {isChecking ? 'Verificando…' : 'Atualizar'}
          </button>
        </div>
      </div>

      {/* Summary bar */}
      <div style={{
        display: 'flex', gap: 0, borderBottom: '1px solid #f3f4f6',
      }}>
        {[
          { label: 'Sincronizados', count: okCount,    color: '#16a34a', bg: '#f0fdf4' },
          { label: 'Sem dados',     count: emptyCount, color: '#f59e0b', bg: '#fffbeb' },
          { label: 'Erros',         count: errCount,   color: '#ef4444', bg: '#fef2f2' },
        ].map(s => (
          <div key={s.label} style={{
            flex: 1, padding: '10px 16px', background: s.bg,
            display: 'flex', alignItems: 'center', gap: 8,
            borderRight: '1px solid #f3f4f6',
          }}>
            <span style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.count}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#6b7280' }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Collection list */}
      <div style={{ maxHeight: 380, overflowY: 'auto' }}>
        {items.map((item, idx) => {
          const color = statusColor(item.status);
          return (
            <div
              key={item.id}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 20px',
                borderBottom: idx < items.length - 1 ? '1px solid #f9fafb' : 'none',
                background: item.status === 'ERROR' ? '#fef2f2'
                  : item.status === 'EMPTY' ? '#fffbeb'
                  : 'transparent',
                transition: 'background 0.2s',
              }}
            >
              {/* Left: icon + label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                <span style={{ color, flexShrink: 0 }}>{statusIcon(item.status)}</span>
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.label}
                  </p>
                  <p style={{ margin: 0, fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>
                    {item.collection}{item.docId ? `/${item.docId}` : ''}
                  </p>
                </div>
              </div>

              {/* Center: status + count */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, marginLeft: 12, marginRight: 16 }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, color,
                  background: `${color}12`, padding: '2px 8px', borderRadius: 6,
                }}>
                  {statusLabel(item.status)}
                  {item.status === 'OK' && item.count !== undefined && item.count > 1
                    ? ` (${item.count})` : ''}
                </span>
                {item.status === 'OK' && item.lastUpdated && (
                  <span style={{ fontSize: 10, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Clock size={9} />
                    {formatRelTime(item.lastUpdated)}
                  </span>
                )}
                {item.status === 'ERROR' && item.errorMsg && (
                  <span style={{ fontSize: 10, color: '#ef4444', maxWidth: 140, textAlign: 'right' }}>
                    {item.errorMsg.substring(0, 50)}
                  </span>
                )}
              </div>

              {/* Right: Edit button */}
              <button
                onClick={() => navigate(item.adminPath)}
                title={`Editar ${item.label}`}
                style={{
                  background: '#f9fafb', border: '1px solid #e5e7eb',
                  borderRadius: 6, padding: '4px 10px',
                  fontSize: 11, fontWeight: 700, color: '#374151',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                  flexShrink: 0, transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f0fdf4')}
                onMouseLeave={e => (e.currentTarget.style.background = '#f9fafb')}
              >
                Editar <ExternalLink size={10} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      {lastChecked && (
        <div style={{
          padding: '10px 20px', borderTop: '1px solid #f3f4f6',
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 11, color: '#9ca3af', fontWeight: 600,
        }}>
          <Clock size={11} />
          Última verificação: {lastChecked.toLocaleTimeString('pt-BR')}
          {' '}· Alterações no admin refletem no site em &lt; 1 segundo via Firestore onSnapshot.
        </div>
      )}
    </div>
  );
};
