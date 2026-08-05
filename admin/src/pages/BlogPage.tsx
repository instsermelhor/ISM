/**
 * BlogPage.tsx — C004: Gestão do Hub de Notícias & Artigos (Admin)
 * ─────────────────────────────────────────────────────────────
 * Gerenciador completo de artigos com criação, edição em modal/drawer,
 * status (Rascunho / Publicado / Agendado / Arquivado), tags, categorias,
 * autor, capa e agendamento.
 *
 * Coleção Firestore: blog_posts
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  Plus, Search, Edit2, Trash2, Eye, Calendar, Clock, Filter,
  X, Save, CheckCircle, AlertCircle, FileText, Image as ImageIcon,
  User, Tag, CheckSquare, Sparkles, RefreshCw
} from 'lucide-react';
import { BlogService, type BlogPostData } from '../services/blogService';

type PostStatus = 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED';

const STATUS_CONFIG: Record<PostStatus, { label: string; badge: string; color: string }> = {
  DRAFT:     { label: 'Rascunho', badge: 'badge badge-gray', color: '#6b7280' },
  PUBLISHED: { label: 'Publicado', badge: 'badge badge-green', color: '#16a34a' },
  SCHEDULED: { label: 'Agendado', badge: 'badge badge-blue', color: '#2563eb' },
  ARCHIVED:  { label: 'Arquivado', badge: 'badge badge-gray', color: '#9ca3af' },
};

const DEFAULT_FORM: BlogPostData = {
  title: '',
  slug: '',
  summary: '',
  content: '',
  coverImage: '',
  author: { name: 'Equipe ISM', role: 'Comunicação Institucional', avatarUrl: '' },
  category: 'Institucional',
  tags: ['Transparência', 'Impacto'],
  status: 'PUBLISHED',
  publishedAt: new Date().toISOString(),
  scheduledFor: '',
  readTimeMinutes: 5,
  featured: false,
};

export const BlogPage: React.FC = () => {
  const [posts, setPosts] = useState<BlogPostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<PostStatus | 'ALL'>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  // Modal Editor
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BlogPostData>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await BlogService.getOrSeed();
      setPosts(data);
    } catch (err) {
      console.error('[BlogPage] loadPosts error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  // Handler para abrir modal de novo post
  const handleNewPost = () => {
    setEditingId(null);
    setForm({
      ...DEFAULT_FORM,
      publishedAt: new Date().toISOString(),
    });
    setError(null);
    setIsModalOpen(true);
  };

  // Handler para abrir modal de edição de post existente
  const handleEditPost = (post: BlogPostData) => {
    setEditingId(post.id || null);
    setForm({
      title: post.title || '',
      slug: post.slug || '',
      summary: post.summary || '',
      content: post.content || '',
      coverImage: post.coverImage || '',
      author: {
        name: post.author?.name || 'Equipe ISM',
        role: post.author?.role || '',
        avatarUrl: post.author?.avatarUrl || '',
      },
      category: post.category || 'Institucional',
      tags: post.tags || [],
      status: post.status || 'PUBLISHED',
      publishedAt: post.publishedAt || new Date().toISOString(),
      scheduledFor: post.scheduledFor || '',
      readTimeMinutes: post.readTimeMinutes || 5,
      featured: post.featured || false,
    });
    setError(null);
    setIsModalOpen(true);
  };

  // Auto-geração de slug a partir do título
  const handleTitleChange = (val: string) => {
    const slugified = val
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    setForm(prev => ({
      ...prev,
      title: val,
      slug: prev.slug === '' || prev.slug === prev.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') ? slugified : prev.slug,
    }));
  };

  // Salvar no Firestore
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('O título do artigo é obrigatório.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload: Omit<BlogPostData, 'id'> = {
        ...form,
        slug: form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        publishedAt: form.status === 'PUBLISHED' && !form.publishedAt ? new Date().toISOString() : form.publishedAt,
      };

      if (editingId) {
        await BlogService.update(editingId, payload);
      } else {
        await BlogService.create(payload);
      }

      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        setIsModalOpen(false);
      }, 1200);

      await loadPosts();
    } catch (err) {
      console.error('[BlogPage] handleSave error:', err);
      setError('Erro ao salvar publicação no Firestore.');
    } finally {
      setSaving(false);
    }
  };

  // Deletar post
  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm('Tem certeza que deseja excluir esta publicação? Esta ação não pode ser desfeita.')) return;
    try {
      await BlogService.delete(id);
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('[BlogPage] delete error:', err);
      alert('Erro ao excluir publicação.');
    }
  };

  // Lista única de categorias
  const categoriesList = Array.from(new Set(posts.map(p => p.category).filter(Boolean)));

  // Posts filtrados
  const filtered = posts.filter(p => {
    const q = search.toLowerCase().trim();
    const matchSearch = !q || p.title.toLowerCase().includes(q) || (p.author?.name || '').toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q);
    const matchStatus = filterStatus === 'ALL' || p.status === filterStatus;
    const matchCat = filterCategory === 'ALL' || p.category === filterCategory;
    return matchSearch && matchStatus && matchCat;
  });

  const formatDate = (iso?: string | null) =>
    iso ? new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '12px 0' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileText size={26} color="#16a34a" />
            Blog & Hub de Notícias
          </h1>
          <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>
            Gerencie artigos institucionais, relatórios de impacto e notícias do Instituto Ser Melhor.
          </p>
        </div>
        <button
          onClick={handleNewPost}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', background: '#16a34a', color: 'white',
            fontWeight: 800, borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 14,
          }}
        >
          <Plus size={16} /> Novo Artigo
        </button>
      </div>

      {/* Filters Bar */}
      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 14, padding: 18, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Status pills */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button
              onClick={() => setFilterStatus('ALL')}
              style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                border: '1px solid', transition: 'all 0.15s',
                background: filterStatus === 'ALL' ? '#111827' : 'transparent',
                color: filterStatus === 'ALL' ? 'white' : '#6b7280',
                borderColor: filterStatus === 'ALL' ? '#111827' : '#e5e7eb'
              }}
            >
              Todos ({posts.length})
            </button>
            {(Object.keys(STATUS_CONFIG) as PostStatus[]).map(s => {
              const count = posts.filter(p => p.status === s).length;
              return (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  style={{
                    padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    border: '1px solid', transition: 'all 0.15s',
                    background: filterStatus === s ? `${STATUS_CONFIG[s].color}15` : 'transparent',
                    color: filterStatus === s ? STATUS_CONFIG[s].color : '#6b7280',
                    borderColor: filterStatus === s ? STATUS_CONFIG[s].color : '#e5e7eb'
                  }}
                >
                  {STATUS_CONFIG[s].label} ({count})
                </button>
              );
            })}
          </div>

          {/* Search box */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f9fafb', border: '1px solid #d1d5db', borderRadius: 8, padding: '6px 12px', minWidth: 260 }}>
            <Search size={15} color="#9ca3af" />
            <input
              type="text"
              placeholder="Buscar por título ou autor..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 13, width: '100%' }}
            />
            {search && <X size={14} color="#9ca3af" style={{ cursor: 'pointer' }} onClick={() => setSearch('')} />}
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
            <RefreshCw size={24} style={{ margin: '0 auto 12px', display: 'block', animation: 'spin 1s linear infinite' }} />
            Carregando artigos...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#9ca3af' }}>
            <FileText size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p style={{ fontWeight: 700, margin: 0 }}>Nenhum artigo encontrado</p>
            <p style={{ fontSize: 12, marginTop: 4 }}>Clique em "Novo Artigo" para publicar a primeira matéria.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 800, color: '#6b7280', fontSize: 11, textTransform: 'uppercase' }}>Artigo</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 800, color: '#6b7280', fontSize: 11, textTransform: 'uppercase' }}>Categoria</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 800, color: '#6b7280', fontSize: 11, textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 800, color: '#6b7280', fontSize: 11, textTransform: 'uppercase' }}>Autor</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 800, color: '#6b7280', fontSize: 11, textTransform: 'uppercase' }}>Data</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 800, color: '#6b7280', fontSize: 11, textTransform: 'uppercase' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(post => (
                <tr key={post.id || post.slug} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      {post.coverImage && (
                        <img src={post.coverImage} alt="" style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                      )}
                      <div>
                        <div style={{ fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: 6 }}>
                          {post.featured && <span style={{ background: '#fef3c7', color: '#d97706', fontSize: 10, fontWeight: 800, padding: '1px 6px', borderRadius: 4 }}>★ Destaque</span>}
                          {post.title}
                        </div>
                        <div style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'monospace', marginTop: 2 }}>/blog/{post.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ background: '#eff6ff', color: '#2563eb', padding: '3px 8px', borderRadius: 6, fontWeight: 700, fontSize: 11 }}>
                      {post.category || 'Geral'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      background: `${STATUS_CONFIG[post.status as PostStatus]?.color || '#6b7280'}15`,
                      color: STATUS_CONFIG[post.status as PostStatus]?.color || '#6b7280',
                      padding: '3px 9px', borderRadius: 20, fontWeight: 800, fontSize: 11
                    }}>
                      {STATUS_CONFIG[post.status as PostStatus]?.label || post.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#374151', fontWeight: 600 }}>
                    {post.author?.name || 'Equipe ISM'}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={12} />
                      {formatDate(post.publishedAt || post.createdAt as any)}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                      <button
                        onClick={() => handleEditPost(post)}
                        style={{ padding: 6, background: '#f3f4f6', border: 'none', borderRadius: 6, cursor: 'pointer', color: '#374151' }}
                        title="Editar"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        style={{ padding: 6, background: '#fef2f2', border: 'none', borderRadius: 6, cursor: 'pointer', color: '#ef4444' }}
                        title="Excluir"
                      >
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

      {/* MODAL EDITOR DE ARTIGO */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div style={{
            background: 'white', borderRadius: 16, width: '100%', maxWidth: 750,
            maxHeight: '90vh', overflowY: 'auto', padding: 28, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            position: 'relative',
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid #f3f4f6', pb: 14 }}>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={20} color="#16a34a" />
                {editingId ? 'Editar Artigo' : 'Novo Artigo para o Blog'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                <X size={20} />
              </button>
            </div>

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#dc2626', fontSize: 13 }}>
                <AlertCircle size={15} style={{ display: 'inline', marginRight: 6 }} />
                {error}
              </div>
            )}

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Título & Slug */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: '#374151', display: 'block', marginBottom: 4 }}>TÍTULO DO ARTIGO *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={e => handleTitleChange(e.target.value)}
                  placeholder="ex: Relatório de Impacto Socioambiental 2024"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, fontWeight: 700, boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: '#374151', display: 'block', marginBottom: 4 }}>SLUG (URL)</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={e => setForm(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="relatorio-de-impacto-2024"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 12, fontFamily: 'monospace', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: '#374151', display: 'block', marginBottom: 4 }}>CATEGORIA</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="ex: Relatório de Impacto, Educação, ESG"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13, boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Imagem de Capa */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: '#374151', display: 'block', marginBottom: 4 }}>URL DA IMAGEM DE CAPA</label>
                <input
                  type="url"
                  value={form.coverImage}
                  onChange={e => setForm(prev => ({ ...prev, coverImage: e.target.value }))}
                  placeholder="https://images.unsplash.com/..."
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13, boxSizing: 'border-box' }}
                />
                {form.coverImage && (
                  <div style={{ marginTop: 8, borderRadius: 8, overflow: 'hidden', height: 120, border: '1px solid #e5e7eb' }}>
                    <img src={form.coverImage} alt="Preview da capa" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
              </div>

              {/* Resumo */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: '#374151', display: 'block', marginBottom: 4 }}>RESUMO (EXCERPT / RESUMO CURTO)</label>
                <textarea
                  rows={2}
                  value={form.summary}
                  onChange={e => setForm(prev => ({ ...prev, summary: e.target.value }))}
                  placeholder="Breve resumo da matéria para exibição nos cards..."
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13, lineHeight: 1.5, resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>

              {/* Conteúdo Completo */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: '#374151', display: 'block', marginBottom: 4 }}>CONTEÚDO COMPLETO DO ARTIGO</label>
                <textarea
                  rows={6}
                  value={form.content}
                  onChange={e => setForm(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Escreva ou cole o texto completo da publicação..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13, lineHeight: 1.6, resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>

              {/* Autor */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: '#374151', display: 'block', marginBottom: 4 }}>NOME DO AUTOR</label>
                  <input
                    type="text"
                    value={form.author?.name || ''}
                    onChange={e => setForm(prev => ({ ...prev, author: { ...prev.author, name: e.target.value } }))}
                    placeholder="ex: Rikardo Ribeiro"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13, boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: '#374151', display: 'block', marginBottom: 4 }}>CARGO DO AUTOR</label>
                  <input
                    type="text"
                    value={form.author?.role || ''}
                    onChange={e => setForm(prev => ({ ...prev, author: { ...prev.author, role: e.target.value } }))}
                    placeholder="ex: Presidente Executivo"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13, boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Status, Tempo de Leitura & Destaque */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: '#374151', display: 'block', marginBottom: 4 }}>STATUS</label>
                  <select
                    value={form.status}
                    onChange={e => setForm(prev => ({ ...prev, status: e.target.value as PostStatus }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13, fontWeight: 700, boxSizing: 'border-box' }}
                  >
                    <option value="PUBLISHED">Publicado</option>
                    <option value="DRAFT">Rascunho</option>
                    <option value="SCHEDULED">Agendado</option>
                    <option value="ARCHIVED">Arquivado</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: '#374151', display: 'block', marginBottom: 4 }}>TEMPO DE LEITURA (MIN)</label>
                  <input
                    type="number"
                    min={1}
                    value={form.readTimeMinutes}
                    onChange={e => setForm(prev => ({ ...prev, readTimeMinutes: Number(e.target.value) }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13, fontWeight: 700, boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginTop: 18 }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', color: '#111827' }}>
                    <input
                      type="checkbox"
                      checked={form.featured || false}
                      onChange={e => setForm(prev => ({ ...prev, featured: e.target.checked }))}
                      style={{ width: 16, height: 16, accentColor: '#16a34a' }}
                    />
                    Artigo em Destaque ★
                  </label>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: '#374151', display: 'block', marginBottom: 4 }}>TAGS (SEPARADAS POR VÍRGULA)</label>
                <input
                  type="text"
                  value={(form.tags || []).join(', ')}
                  onChange={e => setForm(prev => ({ ...prev, tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
                  placeholder="Transparência, ESG, SROI, Educação"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>

              {/* Botões do Modal */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12, paddingTop: 16, borderTop: '1px solid #f3f4f6' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '10px 18px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '10px 22px', background: '#16a34a', color: 'white',
                    fontWeight: 800, borderRadius: 8, border: 'none', cursor: 'pointer',
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  {saved ? <CheckCircle size={16} /> : <Save size={16} />}
                  {saved ? 'Salvo!' : saving ? 'Salvando...' : 'Salvar Publicação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
