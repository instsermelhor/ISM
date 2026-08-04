/**
 * ProgramLinkFields
 * ──────────────────
 * Campos de links externos para programas com validação HTTPS em tempo real.
 */
import React from 'react';
import { Globe, BookOpen, ExternalLink, FileText, BarChart2, ClipboardList, AlertCircle } from 'lucide-react';

export interface ProgramLinks {
  websiteUrl?: string;
  institutionalPageUrl?: string;
  auraProjectUrl?: string;
  documentsUrl?: string;
  reportsUrl?: string;
  participationFormUrl?: string;
}

interface Props {
  links: ProgramLinks;
  onChange: (links: ProgramLinks) => void;
}

const isValidHttpsUrl = (url?: string): boolean => {
  if (!url || url.trim() === '' || url === 'https://') return true;
  try {
    const u = new URL(url);
    return u.protocol === 'https:';
  } catch {
    return false;
  }
};

const LinkField: React.FC<{
  label: string;
  icon: React.ElementType;
  field: keyof ProgramLinks;
  value?: string;
  onChange: (val: string) => void;
  placeholder?: string;
  required?: boolean;
}> = ({ label, icon: Icon, field: _field, value = '', onChange, placeholder, required }) => {
  const isValid = isValidHttpsUrl(value);
  const hasValue = value && value !== 'https://';

  return (
    <div>
      <label style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
        <Icon size={11} color="#6b7280" />
        {label}
        {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type="url"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder || 'https://...'}
          style={{
            width: '100%', padding: '7px 10px', paddingRight: hasValue && !isValid ? 32 : 10,
            borderRadius: 8, fontSize: 12, boxSizing: 'border-box',
            border: `1px solid ${hasValue && !isValid ? '#fca5a5' : '#e5e7eb'}`,
            background: hasValue && !isValid ? '#fff1f2' : 'white',
            color: '#111827',
            outline: 'none',
          }}
        />
        {hasValue && !isValid && (
          <AlertCircle
            size={14}
            color="#ef4444"
            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }}
          />
        )}
      </div>
      {hasValue && !isValid && (
        <p style={{ fontSize: 10, color: '#dc2626', margin: '2px 0 0 0' }}>
          URL inválida. Use apenas endereços HTTPS (ex: https://exemplo.com.br)
        </p>
      )}
    </div>
  );
};

export const ProgramLinkFields: React.FC<Props> = ({ links, onChange }) => {
  const update = (field: keyof ProgramLinks) => (val: string) =>
    onChange({ ...links, [field]: val || undefined });

  return (
    <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 16, margin: 0 }}>
      <legend style={{ fontSize: 11, fontWeight: 800, color: '#374151', textTransform: 'uppercase', padding: '0 6px' }}>
        Links Externos (HTTPS)
      </legend>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
        <LinkField
          label="Site Oficial"
          icon={Globe}
          field="websiteUrl"
          value={links.websiteUrl}
          onChange={update('websiteUrl')}
          placeholder="https://programa.org"
        />
        <LinkField
          label="Página Institucional"
          icon={BookOpen}
          field="institutionalPageUrl"
          value={links.institutionalPageUrl}
          onChange={update('institutionalPageUrl')}
          placeholder="https://institutosermelhor.org/..."
        />
        <LinkField
          label="Projeto AURA"
          icon={ExternalLink}
          field="auraProjectUrl"
          value={links.auraProjectUrl}
          onChange={update('auraProjectUrl')}
          placeholder="https://aura.institutosermelhor.org/..."
        />
        <LinkField
          label="Documentação / Docs"
          icon={FileText}
          field="documentsUrl"
          value={links.documentsUrl}
          onChange={update('documentsUrl')}
          placeholder="https://docs.exemplo.com"
        />
        <LinkField
          label="Relatórios de Impacto"
          icon={BarChart2}
          field="reportsUrl"
          value={links.reportsUrl}
          onChange={update('reportsUrl')}
          placeholder="https://relatorio.exemplo.com"
        />
        <LinkField
          label="Formulário de Participação"
          icon={ClipboardList}
          field="participationFormUrl"
          value={links.participationFormUrl}
          onChange={update('participationFormUrl')}
          placeholder="https://forms.exemplo.com"
        />
      </div>
    </fieldset>
  );
};
