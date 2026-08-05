/**
 * NewsSection.tsx — C004: Hub de Notícias, Mídia e Artigos do Blog (Site Principal)
 * ─────────────────────────────────────────────────────────────────────────────
 * Seção de Notícias e Mídia Institucional com busca em tempo real,
 * filtros por categoria, modal de leitura dinâmica de artigos e cards de destaque.
 */
import React, { useRef, useState, useMemo } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Newspaper, Calendar, Clock, ArrowRight, User, X, Tag, BookOpen, Search, Filter } from 'lucide-react';

// ── Tipos ──────────────────────────────────────────────────────────────────────

export interface BlogPostItem {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content?: string;
  coverImage?: string;
  author?: {
    name: string;
    role?: string;
    avatarUrl?: string;
  };
  category?: string;
  tags?: string[];
  publishedAt?: string;
  scheduledFor?: string;
  readTimeMinutes?: number;
  featured?: boolean;
}

export interface NewsSectionProps {
  posts?: BlogPostItem[];
}

// ── Posts padrão para fallback gracioso ────────────────────────────────────────

const DEFAULT_BLOG_POSTS: BlogPostItem[] = [
  {
    id: 'seed-1',
    title: 'Relatório de Impacto Socioambiental 2024: Transformando Desafios em Soluções Regenerativas',
    slug: 'relatorio-de-impacto-socioambiental-2024',
    summary: 'Apresentamos os resultados alcançados pelo Instituto Ser Melhor no último ano, destacando mais de 32 mil vidas impactadas e 120 mil hectares de bioma protegidos.',
    content: 'O ano de 2024 marcou um ponto de virada histórico na trajetória do Instituto Ser Melhor. Expandimos nossa atuação para 78 municípios, fortalecendo a Metodologia M-IS de emancipação humana integral. Por meio de nossos programas em Educação, Assistência Social, Preservação de Biomas e Cultura, alcançamos métricas inéditas de Retorno Social sobre o Investimento (SROI de R$ 4,85 para cada R$ 1,00 investido).\n\nA metodologia envolve a escuta ativa das comunidades beneficiadas, capacitação continuada de agentes locais e monitoramento digital de resultados em tempo real. A transparência integral dos recursos alocados garante a independência da nossa governança.',
    coverImage: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800&q=80',
    author: { name: 'Rikardo Ribeiro', role: 'Presidente Executivo', avatarUrl: '' },
    category: 'Relatório de Impacto',
    tags: ['Transparência', 'ESG', 'SROI', 'Sustentabilidade'],
    publishedAt: '2024-12-15T10:00:00.000Z',
    readTimeMinutes: 6,
    featured: true,
  },
  {
    id: 'seed-2',
    title: 'Projeto AURA: Cuidado Mental Preventivo e Suporte Psicossocial nas Comunidades',
    slug: 'projeto-aura-cuidado-mental-preventivo',
    summary: 'Conheça o modelo integrativo de acolhimento psicossocial do Projeto AURA, focado no fortalecimento emocional e quebra de ciclos de vulnerabilidade.',
    content: 'Saúde mental é um direito humano fundamental e pilar indispensável para o desenvolvimento social. O Projeto AURA atua diretamente com populações vulneráveis e agentes públicos, oferecendo suporte emocional humanizado, rodas de conversa, terapia comunitária e práticas integrativas.\n\nEm 2024, mais de 4.500 atendimentos individuais e em grupo foram realizados, com taxa de satisfação de 98% dos participantes e impacto direto na melhoria do clima escolar e comunitário.',
    coverImage: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80',
    author: { name: 'Equipe de Saúde AURA', role: 'Núcleo Psicossocial', avatarUrl: '' },
    category: 'Saúde & Bem-Estar',
    tags: ['Saúde Mental', 'AURA', 'Assistência Social'],
    publishedAt: '2025-01-20T14:30:00.000Z',
    readTimeMinutes: 4,
    featured: false,
  },
  {
    id: 'seed-3',
    title: 'Inovação Educacional: Tecnologia Assistiva e Inclusão Digital em Áreas Rurais',
    slug: 'inovacao-educacional-tecnologia-assistiva',
    summary: 'Como o Instituto Ser Melhor leva infraestrutura digital e laboratórios móveis de aprendizagem para escolas de comunidades ribeirinhas e rurais.',
    content: 'A inclusão digital é pré-requisito para a igualdade de oportunidades no século XXI. Nossa iniciativa de Educação Conectada instalou hubs solares de conectividade e distribuiu tablets com conteúdo pedagógico off-line adaptado para mais de 1.800 estudantes.\n\nO projeto capacita professores locais e incentiva o protagonismo juvenil por meio de feiras de ciência e robótica sustentável.',
    coverImage: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80',
    author: { name: 'Dra. Maria Santos', role: 'Diretora de Educação', avatarUrl: '' },
    category: 'Educação',
    tags: ['Inclusão Digital', 'Educação', 'Tecnologia'],
    publishedAt: '2025-02-01T09:00:00.000Z',
    readTimeMinutes: 5,
    featured: false,
  },
];

// ── Modal de Leitura Completa do Post ─────────────────────────────────────────

const PostModal: React.FC<{
  post: BlogPostItem | null;
  onClose: () => void;
}> = ({ post, onClose }) => {
  if (!post) return null;

  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <AnimatePresence>
      <motion.div
        key="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-start justify-center bg-black/75 backdrop-blur-sm overflow-y-auto p-4 md:p-8"
        role="dialog"
        aria-modal="true"
        aria-label={`Artigo: ${post.title}`}
      >
        <motion.article
          key="modal-content"
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          transition={{ duration: 0.3 }}
          onClick={e => e.stopPropagation()}
          className="relative bg-white rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden my-8"
        >
          {/* Cover Image */}
          {post.coverImage && (
            <div className="relative h-64 md:h-80 w-full overflow-hidden bg-secondary-900">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              {post.category && (
                <span className="absolute bottom-4 left-6 px-3 py-1 bg-brand-600/90 backdrop-blur-md text-white text-xs font-bold rounded-full">
                  {post.category}
                </span>
              )}
            </div>
          )}

          {/* Body */}
          <div className="p-6 md:p-10">
            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-secondary-400 mb-4">
              {formattedDate && (
                <span className="flex items-center gap-1 font-semibold">
                  <Calendar size={13} className="text-brand-600" />
                  {formattedDate}
                </span>
              )}
              {post.readTimeMinutes && (
                <span className="flex items-center gap-1 font-semibold">
                  <Clock size={13} className="text-brand-600" />
                  {post.readTimeMinutes} min de leitura
                </span>
              )}
            </div>

            {/* Title */}
            <h2 className="text-2xl md:text-3xl font-black text-secondary-900 mb-4 leading-tight">
              {post.title}
            </h2>

            {/* Author */}
            {post.author?.name && (
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-secondary-100">
                {post.author.avatarUrl ? (
                  <img
                    src={post.author.avatarUrl}
                    alt={post.author.name}
                    className="w-10 h-10 rounded-full object-cover border border-secondary-200"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center font-bold text-brand-700 text-sm">
                    {post.author.name.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="font-bold text-secondary-900 text-sm">{post.author.name}</p>
                  {post.author.role && (
                    <p className="text-secondary-400 text-xs">{post.author.role}</p>
                  )}
                </div>
              </div>
            )}

            {/* Paragraph Content */}
            <div className="prose prose-sm max-w-none text-secondary-700 leading-relaxed mb-6 space-y-4">
              {(post.content || post.summary).split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="text-base text-secondary-700 leading-relaxed">{paragraph}</p>
              ))}
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-6 border-t border-secondary-100">
                <Tag size={13} className="text-secondary-400 mt-0.5 shrink-0" />
                {post.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-full bg-secondary-100 text-secondary-600 text-xs font-semibold"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-secondary-600 hover:text-secondary-900 hover:bg-white shadow-md transition-all"
            aria-label="Fechar artigo"
          >
            <X size={16} />
          </button>
        </motion.article>
      </motion.div>
    </AnimatePresence>
  );
};

// ── Componente Principal ──────────────────────────────────────────────────────

export const NewsSection: React.FC<NewsSectionProps> = ({ posts = [] }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [selectedPost, setSelectedPost] = useState<BlogPostItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fallback para posts padrão se props vierem vazias
  const allPosts = useMemo(() => {
    return posts.length > 0 ? posts : DEFAULT_BLOG_POSTS;
  }, [posts]);

  // Lista única de categorias
  const categories = useMemo(() => {
    const set = new Set<string>();
    allPosts.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return ['Todos', ...Array.from(set)];
  }, [allPosts]);

  // Filtragem combinada (Categoria + Busca)
  const filteredPosts = useMemo(() => {
    return allPosts.filter(p => {
      const matchCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        (p.content && p.content.toLowerCase().includes(q)) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(q)));
      return matchCategory && matchSearch;
    });
  }, [allPosts, selectedCategory, searchQuery]);

  // Ordenação: Destaques primeiro, depois por data
  const sortedPosts = useMemo(() => {
    return [...filteredPosts].sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return (b.publishedAt ?? '') > (a.publishedAt ?? '') ? 1 : -1;
    });
  }, [filteredPosts]);

  return (
    <>
      <section
        id="blog"
        aria-label="Notícias e Artigos do Instituto Ser Melhor"
        className="py-12 md:py-16 bg-secondary-950 relative overflow-hidden"
      >
        {/* Background pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-20" aria-hidden="true">
          <div className="absolute top-1/4 left-10 w-72 h-72 bg-brand-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-brand-600/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 container mx-auto px-4 md:px-6">
          {/* Header */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-500/30 bg-brand-500/10 mb-5 text-xs font-bold uppercase tracking-widest text-brand-300">
              <Newspaper size={14} />
              Hub de Notícias &amp; Mídia Institucional
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
              Notícias e <span className="text-gradient-brand">Artigos</span>
            </h2>
            <p className="text-secondary-400 max-w-xl mx-auto text-lg leading-relaxed">
              Acompanhe nossas últimas ações em campo, relatórios de impacto e publicações institucionais.
            </p>
          </motion.div>

          {/* Barra de Filtro & Busca */}
          <div className="max-w-4xl mx-auto mb-10 space-y-4">
            {/* Campo de Busca */}
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400" aria-hidden="true" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar notícias por palavras-chave, título ou tag..."
                className="w-full pl-11 pr-10 py-3.5 bg-secondary-900/90 border border-secondary-800 rounded-2xl text-white placeholder-secondary-500 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                aria-label="Buscar artigos do blog"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-white"
                  aria-label="Limpar busca"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Categorias Pills */}
            <div className="flex flex-wrap items-center gap-2 justify-center" role="tablist" aria-label="Filtro por Categoria">
              {categories.map(cat => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    role="tab"
                    aria-selected={isSelected}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                      isSelected
                        ? 'bg-brand-600 text-white border-brand-500 shadow-lg shadow-brand-600/20'
                        : 'bg-secondary-900/60 text-secondary-400 border-secondary-800 hover:border-secondary-700 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid de Artigos */}
          {sortedPosts.length === 0 ? (
            <div className="text-center py-16 text-secondary-500 bg-secondary-900/40 rounded-3xl border border-secondary-800/50 max-w-md mx-auto">
              <BookOpen size={36} className="mx-auto mb-3 opacity-40 text-brand-400" />
              <p className="font-bold text-white mb-1">Nenhum artigo encontrado</p>
              <p className="text-xs">Tente ajustar seus termos de busca ou filtros.</p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('Todos'); }}
                className="mt-4 px-4 py-2 bg-brand-600/20 text-brand-400 border border-brand-500/30 rounded-full text-xs font-bold hover:bg-brand-600/30 transition-all"
              >
                Limpar Filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedPosts.map((post, idx) => {
                const formattedDate = post.publishedAt
                  ? new Date(post.publishedAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })
                  : null;

                return (
                  <motion.article
                    key={post.id || post.slug}
                    initial={{ opacity: 0, y: 28 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: idx * 0.08 }}
                    className="bg-secondary-900/80 border border-secondary-800 rounded-3xl overflow-hidden hover:border-brand-500/40 transition-all duration-300 flex flex-col group hover:-translate-y-1 shadow-lg cursor-pointer"
                    onClick={() => setSelectedPost(post)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Ler artigo: ${post.title}`}
                    onKeyDown={e => e.key === 'Enter' && setSelectedPost(post)}
                  >
                    {/* Featured badge */}
                    {post.featured && (
                      <div className="px-5 pt-4 flex items-center gap-1.5">
                        <span className="flex items-center gap-1 text-[10px] font-bold text-brand-400 uppercase tracking-widest bg-brand-500/10 px-2.5 py-1 rounded-full border border-brand-500/20">
                          <BookOpen size={10} />
                          Destaque
                        </span>
                      </div>
                    )}

                    {/* Image */}
                    {post.coverImage && (
                      <div className="relative h-48 w-full overflow-hidden bg-secondary-950 mt-2">
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                        />
                        {post.category && (
                          <span className="absolute top-4 left-4 px-3 py-1 bg-brand-600/90 backdrop-blur-md text-white text-xs font-bold rounded-full">
                            {post.category}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-6 flex-1 flex flex-col">
                      {/* Meta info */}
                      <div className="flex items-center gap-4 text-xs text-secondary-400 mb-3">
                        {formattedDate && (
                          <span className="flex items-center gap-1">
                            <Calendar size={12} className="text-brand-400" />
                            {formattedDate}
                          </span>
                        )}
                        {post.readTimeMinutes && (
                          <span className="flex items-center gap-1">
                            <Clock size={12} className="text-brand-400" />
                            {post.readTimeMinutes} min de leitura
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-brand-400 transition-colors line-clamp-2 leading-snug">
                        {post.title}
                      </h3>

                      {/* Summary */}
                      <p className="text-secondary-400 text-sm leading-relaxed mb-6 line-clamp-3 flex-1">
                        {post.summary}
                      </p>

                      {/* Footer */}
                      <div className="pt-4 border-t border-secondary-800 flex items-center justify-between mt-auto">
                        {post.author?.name ? (
                          <span className="text-xs text-secondary-400 flex items-center gap-1.5 font-medium">
                            <User size={12} className="text-brand-400" />
                            {post.author.name}
                          </span>
                        ) : <span />}

                        <span className="text-xs font-bold text-brand-400 group-hover:text-brand-300 flex items-center gap-1 transition-colors">
                          Ler Artigo <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Modal de Leitura */}
      {selectedPost && (
        <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}
    </>
  );
};
