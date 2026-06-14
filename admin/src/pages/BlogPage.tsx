import React, { useEffect, useState } from 'react';
import { PostsService } from '../services/api';
import type { Post, PostStatus } from '../types';
import { Plus, Search, Edit2, Trash2, Eye, Calendar, Clock, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const STATUS_CONFIG: Record<PostStatus, { label: string; badge: string }> = {
  DRAFT: { label: 'Rascunho', badge: 'badge badge-gray' },
  REVIEW: { label: 'Em Revisão', badge: 'badge badge-yellow' },
  SCHEDULED: { label: 'Agendado', badge: 'badge badge-blue' },
  PUBLISHED: { label: 'Publicado', badge: 'badge badge-green' },
  ARCHIVED: { label: 'Arquivado', badge: 'badge badge-gray' },
};

export const BlogPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<PostStatus | 'ALL'>('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    PostsService.getAll().then(setPosts).finally(() => setLoading(false));
  }, []);

  const filtered = posts.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.authorName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'ALL' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza? Esta ação não pode ser desfeita.')) return;
    await PostsService.delete(id);
    setPosts(posts.filter(p => p.id !== id));
  };

  const formatDate = (iso?: string) => iso ? new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const statusCounts = posts.reduce((acc, p) => { acc[p.status] = (acc[p.status] || 0) + 1; return acc; }, {} as Record<string, number>);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: 'var(--gray-900)' }}>Blog & Notícias</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: 13, marginTop: 2 }}>{posts.length} publicações cadastradas</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/conteudo/blog/novo')}>
          <Plus size={16} /> Novo Post
        </button>
      </div>

      {/* Status Pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <button
          onClick={() => setFilterStatus('ALL')}
          style={{
            padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer',
            border: '1px solid', transition: 'all 0.15s',
            background: filterStatus === 'ALL' ? 'var(--gray-900)' : 'transparent',
            color: filterStatus === 'ALL' ? 'white' : 'var(--gray-500)',
            borderColor: filterStatus === 'ALL' ? 'var(--gray-900)' : 'var(--gray-200)'
          }}
        >
          Todos ({posts.length})
        </button>
        {(Object.keys(STATUS_CONFIG) as PostStatus[]).map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer',
              border: '1px solid', transition: 'all 0.15s',
              background: filterStatus === s ? 'var(--gray-100)' : 'transparent',
              color: filterStatus === s ? 'var(--gray-900)' : 'var(--gray-400)',
              borderColor: filterStatus === s ? 'var(--gray-200)' : 'var(--gray-100)'
            }}
          >
            {STATUS_CONFIG[s].label} {statusCounts[s] ? `(${statusCounts[s]})` : ''}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="card" style={{ padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
        <Search size={15} style={{ color: 'var(--gray-400)', flexShrink: 0 }} />
        <input
          placeholder="Buscar por título ou autor..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ border: 'none', outline: 'none', fontSize: 13, flex: 1, fontFamily: 'var(--font-sans)', background: 'transparent', color: 'var(--gray-700)' }}
        />
        <Filter size={15} style={{ color: 'var(--gray-400)' }} />
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <div className="animate-spin" style={{ width: 32, height: 32, border: '3px solid var(--gray-200)', borderTopColor: 'var(--brand-600)', borderRadius: '50%', margin: '0 auto' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--gray-400)' }}>
            <Newspaper size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p style={{ fontWeight: 600 }}>Nenhum post encontrado</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Status</th>
                <th>Categorias</th>
                <th>Autor</th>
                <th>Data</th>
                <th style={{ width: 100, textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(post => (
                <tr key={post.id}>
                  <td>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--gray-900)', marginBottom: 2 }}>{post.title}</p>
                      <p style={{ fontSize: 11, color: 'var(--gray-400)', fontFamily: 'monospace' }}>/blog/{post.slug}</p>
                    </div>
                  </td>
                  <td><span className={STATUS_CONFIG[post.status].badge}>{STATUS_CONFIG[post.status].label}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {post.categories.map(c => (
                        <span key={c} className="badge badge-blue" style={{ fontSize: 10 }}>{c}</span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--brand-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-700)', fontSize: 11, fontWeight: 800 }}>
                        {post.authorName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--gray-700)' }}>{post.authorName.split(' ')[0]}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--gray-500)' }}>
                      {post.status === 'SCHEDULED' ? <Clock size={12} /> : <Calendar size={12} />}
                      {formatDate(post.publishedAt || post.scheduledFor || post.updatedAt)}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
                      <button className="btn btn-icon btn-ghost btn-sm" title="Visualizar" onClick={() => window.open(`http://localhost:3000/blog/${post.slug}`, '_blank')}>
                        <Eye size={14} />
                      </button>
                      <button className="btn btn-icon btn-ghost btn-sm" title="Editar" onClick={() => navigate(`/conteudo/blog/${post.id}`)}>
                        <Edit2 size={14} />
                      </button>
                      <button className="btn btn-icon btn-danger btn-sm" title="Excluir" onClick={() => handleDelete(post.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// Necessário para o import do ícone
const Newspaper = ({ size, style }: { size: number, style?: React.CSSProperties }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
    <path d="M18 14h-8M15 18h-5M10 6h8v4h-8V6Z" />
  </svg>
);
