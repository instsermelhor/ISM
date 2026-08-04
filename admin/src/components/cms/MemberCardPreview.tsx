/**
 * MemberCardPreview
 * ──────────────────
 * Componente de pré-visualização em tempo real do card de integrante da liderança
 * exatamente como ele será renderizado no site público.
 */
import React from 'react';
import { Eye, ExternalLink, Globe, BookOpen, Award, Share2, FileText } from 'lucide-react';
import type { GovernanceMemberAdmin } from '../../services/governanceMembersService';

interface Props {
  member: Partial<GovernanceMemberAdmin>;
}

export const MemberCardPreview: React.FC<Props> = ({ member: m }) => {
  const socialLinks = [
    { href: m.linkedinUrl, label: 'LinkedIn', icon: Share2 },
    { href: m.instagramUrl, label: 'Instagram', icon: Share2 },
    { href: m.websiteUrl, label: 'Website', icon: Globe },
    { href: m.lattesUrl, label: 'Lattes', icon: BookOpen },
    { href: m.orcidUrl, label: 'ORCID', icon: Award },
    { href: m.resumeUrl, label: 'Currículo (PDF)', icon: FileText },
  ].filter(l => Boolean(l.href && l.href.startsWith('https://')));

  return (
    <div style={{ maxWidth: 300, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <Eye size={14} color="#6b7280" />
        <span style={{ fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase' }}>
          Pré-visualização do Card
        </span>
      </div>

      <div
        style={{
          background: 'white',
          borderRadius: 20,
          border: '1px solid #e5e7eb',
          padding: 20,
          boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        {/* Badge Destaque */}
        {m.isFeatured && (
          <span
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              background: '#fef3c7',
              color: '#d97706',
              border: '1px solid #fde68a',
              borderRadius: 12,
              padding: '2px 8px',
              fontSize: 9,
              fontWeight: 800,
              textTransform: 'uppercase',
            }}
          >
            ★ Destaque
          </span>
        )}

        {/* Foto com ALT */}
        <div style={{ position: 'relative', marginBottom: 12 }}>
          {m.imageUrl ? (
            <img
              src={m.imageUrl}
              alt={m.imageAlt || m.name || 'Foto do integrante'}
              style={{
                width: 96,
                height: 96,
                borderRadius: 24,
                objectFit: 'cover',
                border: '3px solid #f3f4f6',
                boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
              }}
            />
          ) : (
            <div
              style={{
                width: 96,
                height: 96,
                borderRadius: 24,
                background: '#1e293b',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 32,
                fontWeight: 800,
              }}
            >
              {(m.name || 'N')[0]}
            </div>
          )}
        </div>

        {/* Categoria */}
        {m.category && (
          <span style={{ fontSize: 9, fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
            {m.category.replace(/_/g, ' ')}
          </span>
        )}

        {/* Nome */}
        <h4 style={{ fontSize: 16, fontWeight: 800, color: '#111827', margin: '0 0 2px 0', lineHeight: 1.2 }}>
          {m.name || 'Nome do Integrante'}
        </h4>

        {/* Cargo */}
        <p style={{ fontSize: 12, fontWeight: 700, color: '#16a34a', margin: '0 0 8px 0' }}>
          {m.shortRole || m.role || 'Cargo Institucional'}
        </p>

        {/* Área */}
        {m.area && (
          <p style={{ fontSize: 10, color: '#6b7280', margin: '0 0 10px 0', fontStyle: 'italic' }}>
            {m.area}
          </p>
        )}

        {/* Biografia resumida */}
        <p style={{ fontSize: 11, color: '#4b5563', margin: '0 0 14px 0', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {m.bio || m.shortBio || 'Biografia resumida do integrante...'}
        </p>

        {/* Ícones de Redes Sociais */}
        {socialLinks.length > 0 && (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 14 }}>
            {socialLinks.map((s, idx) => (
              <a
                key={idx}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                title={s.label}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: '#f3f4f6',
                  color: '#374151',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textDecoration: 'none',
                }}
              >
                <s.icon size={13} />
              </a>
            ))}
          </div>
        )}

        {/* Botão Saiba Mais */}
        <button
          type="button"
          style={{
            width: '100%',
            padding: '8px 0',
            background: '#111827',
            color: 'white',
            border: 'none',
            borderRadius: 10,
            fontSize: 11,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
          }}
        >
          Saiba Mais <ExternalLink size={11} />
        </button>
      </div>
    </div>
  );
};
