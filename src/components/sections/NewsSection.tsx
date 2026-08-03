import React, { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Newspaper, Calendar, Clock, ArrowRight, User, X, Tag, BookOpen } from 'lucide-react';

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
  readTimeMinutes?: number;
  featured?: boolean;
}

export interface NewsSectionProps {
  posts?: BlogPostItem[];
}

// ── Modal de leitura completa do post ─────────────────────────────────────────

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
        className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm overflow-y-auto p-4 md:p-8"
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
          {/* Cover */}
          {post.coverImage && (
            <div className="relative h-64 w-full overflow-hidden bg-secondary-900">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              {post.category && (
                <span className="absolute bottom-4 left-6 px-3 py-1 bg-brand-600/90 backdrop-blur-md text-white text-xs font-bold rounded-full">
                  {post.category}
                </span>
              )}
            </div>
          )}

          {/* Body */}
          <div className="p-6 md:p-8">
            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-secondary-400 mb-4">
              {formattedDate && (
                <span className="flex items-center gap-1">
                  <Calendar size={12} className="text-brand-500" />
                  {formattedDate}
                </span>
              )}
              {post.readTimeMinutes && (
                <span className="flex items-center gap-1">
                  <Clock size={12} className="text-brand-500" />
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
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center">
                    <User size={16} className="text-brand-600" />
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

            {/* Content */}
            <div className="prose prose-sm max-w-none text-secondary-600 leading-relaxed mb-6">
              {post.content ? (
                <p style={{ whiteSpace: 'pre-wrap' }}>{post.content}</p>
              ) : (
                <p>{post.summary}</p>
              )}
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-4 border-t border-secondary-100">
                <Tag size={12} className="text-secondary-400 mt-0.5 shrink-0" />
                {post.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-full bg-secondary-100 text-secondary-500 text-xs font-medium"
                  >
                    {tag}
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

// ── Seção de Notícias Principal ───────────────────────────────────────────────

export const NewsSection: React.FC<NewsSectionProps> = ({ posts = [] }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [selectedPost, setSelectedPost] = useState<BlogPostItem | null>(null);

  if (!posts || posts.length === 0) return null;

  // Destaque: featured primeiro, depois por data
  const sorted = [...posts].sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return (b.publishedAt ?? '') > (a.publishedAt ?? '') ? 1 : -1;
  });

  const displayPosts = sorted.slice(0, 3);

  return (
    <>
      <section
        id="blog"
        aria-label="Notícias e Artigos do Instituto Ser Melhor"
        className="py-24 bg-secondary-950 relative overflow-hidden"
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
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-500/30 bg-brand-500/10 mb-5 text-xs font-bold uppercase tracking-widest text-brand-300">
              <Newspaper size={14} />
              Transparência &amp; Informação
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
              Notícias e <span className="text-gradient-brand">Artigos</span>
            </h2>
            <p className="text-secondary-400 max-w-xl mx-auto text-lg leading-relaxed">
              Acompanhe nossas últimas ações em campo, relatórios de impacto e publicações institucionais.
            </p>
          </motion.div>

          {/* Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayPosts.map((post, idx) => {
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
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
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
                      <span className="flex items-center gap-1 text-[10px] font-bold text-brand-400 uppercase tracking-widest">
                        <BookOpen size={10} />
                        Destaque
                      </span>
                    </div>
                  )}

                  {/* Image */}
                  {post.coverImage && (
                    <div className="relative h-48 w-full overflow-hidden bg-secondary-950">
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

          {/* Ver todos — aparece se houver mais posts */}
          {posts.length > 3 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex justify-center mt-12"
            >
              <button
                onClick={() => {
                  // Abre o primeiro post não exibido; pode ser expandido para página de blog completa
                  setSelectedPost(sorted[3]);
                }}
                className="px-8 py-3 rounded-full border border-brand-500/40 text-brand-400 text-sm font-bold hover:bg-brand-500/10 transition-all flex items-center gap-2"
              >
                Ver mais artigos
                <ArrowRight size={14} />
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Modal de leitura */}
      {selectedPost && (
        <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}
    </>
  );
};
