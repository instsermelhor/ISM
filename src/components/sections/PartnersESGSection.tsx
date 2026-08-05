/**
 * PartnersESGSection.tsx — E001/E002: Portal Público de Parceiros & Co-benefícios ESG
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 * Seção interativa com Vitrine de Empresas Parceiras, Calculadora de Co-benefícios ESG
 * para relatórios corporativos GRI/ONU e Formulário de Adesão Empresarial.
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Building2, ShieldCheck, Award, TrendingUp, Sparkles,
  Leaf, Users, BookOpen, CheckCircle, AlertCircle, Send, Calculator, Download, Check
} from 'lucide-react';
import { InstitutionalService } from '../../services/data';

/* ── Zod Schema para Parceria Corporativa ── */
const partnerFormSchema = z.object({
  companyName: z.string().min(3, 'Razão Social deve ter pelo menos 3 caracteres'),
  taxId: z.string().min(14, 'CNPJ é obrigatório (14 dígitos)').max(18, 'CNPJ inválido'),
  contactName: z.string().min(3, 'Nome do contato é obrigatório'),
  contactEmail: z.string().email('E-mail corporativo inválido'),
  phone: z.string().min(10, 'Telefone de contato é obrigatório'),
  estimatedBudget: z.string().min(1, 'Selecione uma faixa de orçamento'),
  interestPillar: z.string().min(1, 'Selecione o pilar de interesse'),
  message: z.string().optional(),
});

type PartnerFormData = z.infer<typeof partnerFormSchema>;

/* ── Mocks de Parceiros Publicados ── */
const FALLBACK_PARTNERS = [
  { id: 'p1', name: 'Fundação Bradesco', tier: 'MASTER', logo: '🏢', impact: '12.000 alunos impactados' },
  { id: 'p2', name: 'Instituto Natura', tier: 'MASTER', logo: '🌿', impact: '3.500 famílias rurais assistidas' },
  { id: 'p3', name: 'Itaú Social', tier: 'OURO', logo: '🏦', impact: '45 escolas apoiadas' },
  { id: 'p4', name: 'Grupo Unibanco', tier: 'OURO', logo: '📊', impact: 'Projetos de inclusão produtiva' },
  { id: 'p5', name: 'Suzano Papel & Celulose', tier: 'PRATA', logo: '🌳', impact: '120 mil árvores restauradas' },
  { id: 'p6', name: 'Ambev VOA', tier: 'PRATA', logo: '🍺', impact: 'Capacitação de lideranças de ONGs' },
];

export const PartnersESGSection: React.FC = () => {
  const [partners, setPartners] = useState(FALLBACK_PARTNERS);
  const [corporateInvestment, setCorporateInvestment] = useState<number>(100000);
  const [tierFilter, setTierFilter] = useState<string>('ALL');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (typeof InstitutionalService.getPartners === 'function') {
      InstitutionalService.getPartners().then(res => {
        if (res && res.length > 0) {
          setPartners(res.map((p: any) => ({
            id: p.id,
            name: p.name || p.companyName,
            tier: p.tier || 'PARCEIRO',
            logo: p.logo || '🏢',
            impact: p.impactDescription || 'Investidor Social ISM',
          })));
        }
      }).catch(() => {/* fallback mantido */});
    }
  }, []);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PartnerFormData>({
    resolver: zodResolver(partnerFormSchema),
  });

  // Cálculo de Co-benefícios ESG
  const sroiRatio = 4.83;
  const socialReturn = corporateInvestment * sroiRatio;
  const beneficiaries = Math.round(corporateInvestment / 125); // ~R$ 125/ano por beneficiário
  const co2OffsetTrees = Math.round(corporateInvestment / 25); // ~R$ 25 por árvore plantada

  const onSubmit = async (data: PartnerFormData) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await InstitutionalService.submitPartnerApplication({
        areaOfInterest: data.interestPillar || "CORPORATE_ESG",
        intendedContribution: data.message || "",
        email: data.contactEmail,
        companyName: data.companyName,
        taxId: data.taxId,
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        phone: data.phone,
        estimatedBudget: data.estimatedBudget,
        interestPillar: data.interestPillar,
        message: data.message || '',
        type: 'CORPORATE_ESG',
        status: 'Novo',
      });
      setFormSubmitted(true);
      reset();
    } catch {
      setSubmitError('Erro ao enviar proposta. Por favor, tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPartners = tierFilter === 'ALL'
    ? partners
    : partners.filter(p => p.tier === tierFilter);

  return (
    <section id="partners" style={{ padding: '80px 20px', background: '#f9fafb', color: '#111827', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ maxWidth: 1150, margin: '0 auto' }}>

        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px',
            borderRadius: 20, background: '#f0fdf4', border: '1px solid #bbf7d0',
            color: '#16a34a', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12,
          }}>
            <Building2 size={16} /> Aliança Corporativa & ESG
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 900, color: '#111827', margin: '0 0 12px 0' }}>
            Portal de Parceiros &amp; Co-benefícios Socioambientais
          </h2>
          <p style={{ fontSize: 15, color: '#4b5563', maxWidth: 680, margin: '0 auto', lineHeight: 1.6 }}>
            Sua empresa impulsionando transformação social mensurável com relatórios GRI/ESG auditados e razão SROI R$ 4,83x.
          </p>
        </div>

        {/* ESG CALCULATOR FOR CORPORATE PATRONS */}
        <div style={{
          background: 'linear-gradient(135deg, #052e16 0%, #166534 100%)', borderRadius: 24,
          padding: '36px 40px', color: 'white', marginBottom: 64, boxShadow: '0 10px 30px rgba(22,163,74,0.2)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20, marginBottom: 28 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#4ade80', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>
                CALCULADORA DE CO-BENEFÍCIOS ESG PARA INVESTIDORES
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 900, margin: 0, color: 'white' }}>
                Simule o Impacto do Aporte da sua Empresa
              </h3>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700, color: '#86efac' }}>
              📊 Padrão GRI / ODS ONU
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32, alignItems: 'center' }}>
            {/* Input Slider */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#86efac', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                Investimento Corporativo Estimado (Anual):
              </label>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#4ade80', fontFamily: 'monospace', marginBottom: 12 }}>
                R$ {corporateInvestment.toLocaleString('pt-BR')}
              </div>
              <input
                type="range"
                min={20000}
                max={1000000}
                step={10000}
                value={corporateInvestment}
                onChange={e => setCorporateInvestment(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#4ade80', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#86efac', marginTop: 6 }}>
                <span>R$ 20.000</span>
                <span>R$ 500.000</span>
                <span>R$ 1.000.000+</span>
              </div>
            </div>

            {/* Simulated ESG Co-benefits */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: 16, border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: 10, color: '#86efac', fontWeight: 700, textTransform: 'uppercase' }}>Retorno Social (SROI)</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#4ade80', fontFamily: 'monospace', marginTop: 4 }}>
                  R$ {(socialReturn / 1000).toFixed(0)}k
                </div>
                <div style={{ fontSize: 10, color: '#bbf7d0', marginTop: 2 }}>Multiplicador R$ 4,83x</div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: 16, border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: 10, color: '#86efac', fontWeight: 700, textTransform: 'uppercase' }}>Beneficiários Diretos</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#4ade80', fontFamily: 'monospace', marginTop: 4 }}>
                  {beneficiaries.toLocaleString('pt-BR')}
                </div>
                <div style={{ fontSize: 10, color: '#bbf7d0', marginTop: 2 }}>Pessoas impactadas</div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: 16, border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: 10, color: '#86efac', fontWeight: 700, textTransform: 'uppercase' }}>Pegada Verde</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#4ade80', fontFamily: 'monospace', marginTop: 4 }}>
                  {co2OffsetTrees.toLocaleString('pt-BR')}
                </div>
                <div style={{ fontSize: 10, color: '#bbf7d0', marginTop: 2 }}>Árvores nativas/ano</div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: 16, border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: 10, color: '#86efac', fontWeight: 700, textTransform: 'uppercase' }}>Alinhamento ODS</div>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#4ade80', marginTop: 6 }}>
                  ODS 1, 4, 8, 10, 13
                </div>
                <div style={{ fontSize: 10, color: '#bbf7d0', marginTop: 2 }}>Metas da ONU</div>
              </div>
            </div>
          </div>
        </div>

        {/* VITRINE DE PARCEIROS */}
        <div style={{ marginBottom: 64 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <h3 style={{ fontSize: 20, fontWeight: 900, color: '#111827', margin: 0 }}>
              Empresas &amp; Instituições Parceiras
            </h3>
            <div style={{ display: 'flex', gap: 8 }}>
              {['ALL', 'MASTER', 'OURO', 'PRATA'].map(t => (
                <button
                  key={t}
                  onClick={() => setTierFilter(t)}
                  style={{
                    padding: '6px 14px', borderRadius: 20, border: '1px solid #e5e7eb', cursor: 'pointer',
                    fontSize: 11, fontWeight: 700,
                    background: tierFilter === t ? '#16a34a' : 'white',
                    color: tierFilter === t ? 'white' : '#374151',
                  }}
                >
                  {t === 'ALL' ? 'Todos os Parceiros' : `Parceiros ${t}`}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {filteredPartners.map(p => (
              <div key={p.id} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 16, padding: 20, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>{p.logo}</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#111827', marginBottom: 4 }}>{p.name}</div>
                <div style={{ fontSize: 10, fontWeight: 800, color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: 12, display: 'inline-block', marginBottom: 8 }}>
                  {p.tier}
                </div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>{p.impact}</div>
              </div>
            ))}
          </div>
        </div>

        {/* FORMULÁRIO DE ADESÃO CORPORATIVA */}
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 24, padding: 40, boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <div style={{ maxWidth: 640, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <h3 style={{ fontSize: 22, fontWeight: 900, color: '#111827', margin: '0 0 6px 0' }}>
                Seja uma Empresa Parceira do Instituto Ser Melhor
              </h3>
              <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>
                Preencha o formulário para receber uma proposta personalizada de parceria e relatório de co-benefícios ESG.
              </p>
            </div>

            {formSubmitted ? (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 16, padding: 32, textAlign: 'center', color: '#166534' }}>
                <CheckCircle size={48} color="#16a34a" style={{ margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: 20, fontWeight: 900, margin: '0 0 6px 0' }}>Proposta Enviada com Sucesso!</h4>
                <p style={{ fontSize: 13, color: '#15803d', margin: 0 }}>
                  Nossa equipe de Relações Institucionais entrará em contato em até 24 horas úteis com o dossiê de parceria ESG.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {submitError && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: 12, borderRadius: 8, color: '#dc2626', fontSize: 12 }}>
                    {submitError}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#374151', display: 'block', marginBottom: 4 }}>Razão Social *</label>
                    <input {...register('companyName')} placeholder="Nome da empresa" style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13 }} />
                    {errors.companyName && <span style={{ fontSize: 10, color: '#dc2626' }}>{errors.companyName.message}</span>}
                  </div>

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#374151', display: 'block', marginBottom: 4 }}>CNPJ *</label>
                    <input {...register('taxId')} placeholder="00.000.000/0001-00" style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13 }} />
                    {errors.taxId && <span style={{ fontSize: 10, color: '#dc2626' }}>{errors.taxId.message}</span>}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#374151', display: 'block', marginBottom: 4 }}>Nome do Contato *</label>
                    <input {...register('contactName')} placeholder="Seu nome completo" style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13 }} />
                    {errors.contactName && <span style={{ fontSize: 10, color: '#dc2626' }}>{errors.contactName.message}</span>}
                  </div>

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#374151', display: 'block', marginBottom: 4 }}>E-mail Corporativo *</label>
                    <input {...register('contactEmail')} type="email" placeholder="contato@empresa.com.br" style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13 }} />
                    {errors.contactEmail && <span style={{ fontSize: 10, color: '#dc2626' }}>{errors.contactEmail.message}</span>}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#374151', display: 'block', marginBottom: 4 }}>Telefone / WhatsApp *</label>
                    <input {...register('phone')} placeholder="(11) 99999-9999" style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13 }} />
                    {errors.phone && <span style={{ fontSize: 10, color: '#dc2626' }}>{errors.phone.message}</span>}
                  </div>

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#374151', display: 'block', marginBottom: 4 }}>Orçamento Estimado *</label>
                    <select {...register('estimatedBudget')} style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13 }}>
                      <option value="">Selecione a faixa...</option>
                      <option value="R$ 20k - R$ 50k">R$ 20.000 - R$ 50.000 / ano</option>
                      <option value="R$ 50k - R$ 150k">R$ 50.000 - R$ 150.000 / ano</option>
                      <option value="R$ 150k - R$ 500k">R$ 150.000 - R$ 500.000 / ano</option>
                      <option value="Acima de R$ 500k">Acima de R$ 500.000 / ano</option>
                    </select>
                    {errors.estimatedBudget && <span style={{ fontSize: 10, color: '#dc2626' }}>{errors.estimatedBudget.message}</span>}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#374151', display: 'block', marginBottom: 4 }}>Pilar de Preferência *</label>
                  <select {...register('interestPillar')} style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13 }}>
                    <option value="">Selecione o pilar...</option>
                    <option value="Educação">Educação — Transformação de jovens</option>
                    <option value="Social">Social — Apoio a famílias em vulnerabilidade</option>
                    <option value="Meio Ambiente">Meio Ambiente — Restauração florestal</option>
                    <option value="Cultura">Cultura — Arte e desenvolvimento comunitário</option>
                    <option value="Geral / Todos">Fundo Geral de Impacto Institucional</option>
                  </select>
                  {errors.interestPillar && <span style={{ fontSize: 10, color: '#dc2626' }}>{errors.interestPillar.message}</span>}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '14px 24px', background: '#16a34a', color: 'white', fontWeight: 800,
                    borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 14, marginTop: 8,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: '0 4px 12px rgba(22,163,74,0.3)',
                  }}
                >
                  <Send size={16} /> {submitting ? 'Enviando...' : 'Solicitar Proposta de Parceria ESG'}
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </section>
  );
};
