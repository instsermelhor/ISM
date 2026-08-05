/**
 * ExecutiveReportPage.tsx — D002: Gerador Automático de Relatórios de Impacto & Executive Briefings
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 * Painel administrativo para gerar, visualizar e exportar relatórios executivos em PDF/HTML auditáveis.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  FileText, Printer, Download, Sparkles, RefreshCw, CheckCircle,
  TrendingUp, Shield, BarChart2, Calendar, Award, Building, Globe
} from 'lucide-react';
import { ReportGeneratorService, type ExecutiveReportData } from '../services/reportGeneratorService';

const fmtCurrency = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

export const ExecutiveReportPage: React.FC = () => {
  const [report, setReport] = useState<ExecutiveReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(2024);
  const reportRef = useRef<HTMLDivElement>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await ReportGeneratorService.compileReportData(year);
      setReport(data);
    } catch {
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [year]);

  const handlePrint = () => {
    window.print();
  };

  if (loading || !report) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
        <RefreshCw size={24} style={{ margin: '0 auto 12px', display: 'block', animation: 'spin 1s linear infinite' }} />
        Compilando Relatório Executivo...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1050, margin: '0 auto', padding: '12px 0' }}>
      {/* Action Bar (hidden when printing) */}
      <div className="no-print" style={{
        background: 'white', border: '1px solid #e5e7eb', borderRadius: 16,
        padding: '16px 24px', marginBottom: 24, display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap', gap: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
      }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={24} color="#16a34a" />
            Gerador de Relatórios Executivos
          </h1>
          <p style={{ fontSize: 12, color: '#6b7280', margin: '2px 0 0 0' }}>
            Compilação dinâmica de dados SROI, governança e métricas socioambientais para auditoria.
          </p>
        </div>

        <div style={{ display: 'flex', items: 'center', gap: 12 }}>
          <select
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13, fontWeight: 700 }}
          >
            <option value={2024}>Exercício 2024</option>
            <option value={2023}>Exercício 2023</option>
          </select>

          <button
            onClick={handlePrint}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '9px 18px', background: '#16a34a', color: 'white',
              fontWeight: 800, borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13,
            }}
          >
            <Printer size={15} /> Imprimir / Salvar PDF
          </button>
        </div>
      </div>

      {/* REPORT PAPER (Printable Area) */}
      <div
        ref={reportRef}
        className="printable-report"
        style={{
          background: 'white', border: '1px solid #e5e7eb', borderRadius: 16,
          padding: '48px 56px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          fontFamily: 'Inter, system-ui, sans-serif', color: '#111827',
        }}
      >
        {/* Letterhead Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '3px solid #16a34a', pb: 24, marginBottom: 32 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <img src="/logo-ism.png" alt="ISM" style={{ width: 44, height: 44, objectFit: 'contain' }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', letterSpacing: 2 }}>INSTITUTO</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#1e293b', lineHeight: 1 }}>SER MELHOR</div>
              </div>
            </div>
            <div style={{ fontSize: 11, color: '#6b7280', marginTop: 8 }}>
              Sapere Aude — Ouse Saber · Organização Não Governamental Registrada
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#15803d', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '4px 12px', borderRadius: 20, display: 'inline-block' }}>
              DOCUMENTO AUDITADO
            </div>
            <div style={{ fontSize: 11, color: '#6b7280', marginTop: 6 }}>Gerado em: {report.generatedAt}</div>
            <div style={{ fontSize: 11, color: '#9ca3af' }}>{report.auditorName}</div>
          </div>
        </div>

        {/* Title Block */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: '#111827', margin: '0 0 6px 0', lineHeight: 1.3 }}>
            {report.title}
          </h2>
          <p style={{ fontSize: 13, color: '#4b5563', margin: 0 }}>
            {report.subTitle} — {report.period}
          </p>
        </div>

        {/* SROI HIGHLIGHT BOX */}
        <div style={{
          background: 'linear-gradient(135deg, #052e16 0%, #166534 100%)',
          borderRadius: 16, padding: '24px 32px', color: 'white', marginBottom: 32,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20
        }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: '#4ade80', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>
              RAZÃO SROI OFICIAL (SOCIAL RETURN ON INVESTMENT)
            </div>
            <div style={{ fontSize: 44, fontWeight: 900, color: '#4ade80', fontFamily: 'monospace', lineHeight: 1 }}>
              R$ {report.sroiRatio.toFixed(2).replace('.', ',')}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#bbf7d0', marginTop: 4 }}>
              de retorno social comprovado para cada R$ 1,00 investido
            </div>
          </div>

          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: 24 }}>
            <div style={{ fontSize: 12, color: '#86efac', marginBottom: 2 }}>Investimento Total Alocado:</div>
            <div style={{ fontSize: 18, fontWeight: 900, fontFamily: 'monospace' }}>{fmtCurrency(report.totalInvested)}</div>
            <div style={{ fontSize: 12, color: '#86efac', marginTop: 8, marginBottom: 2 }}>Valor Social Gerado:</div>
            <div style={{ fontSize: 18, fontWeight: 900, fontFamily: 'monospace', color: '#4ade80' }}>{fmtCurrency(report.totalSocialReturn)}</div>
          </div>
        </div>

        {/* Impact Metrics Grid */}
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16, borderBottom: '1px solid #e5e7eb', pb: 8 }}>
            1. Principais Indicadores de Impacto
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {report.metrics.map(m => (
              <div key={m.label} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#16a34a', fontFamily: 'monospace' }}>{m.value}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#111827', marginTop: 4 }}>{m.label}</div>
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{m.sublabel}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Pillars Breakdown Table */}
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16, borderBottom: '1px solid #e5e7eb', pb: 8 }}>
            2. Detalhamento por Pilar de Atuação
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#f3f4f6' }}>
                {['Pilar', 'Recursos Investidos', 'Retorno Social Estimado', 'Razão SROI'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 800, color: '#4b5563', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {report.pillarsBreakdown.map(p => (
                <tr key={p.name} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: '#111827' }}>{p.name}</td>
                  <td style={{ padding: '10px 12px', fontFamily: 'monospace' }}>{fmtCurrency(p.invested)}</td>
                  <td style={{ padding: '10px 12px', fontFamily: 'monospace', color: '#15803d', fontWeight: 700 }}>{fmtCurrency(p.returned)}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 800, color: '#16a34a' }}>R$ {p.ratio.toFixed(2).replace('.', ',')}x</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Governance & Disclaimer */}
        <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, marginBottom: 32 }}>
          <h4 style={{ fontSize: 12, fontWeight: 800, color: '#374151', margin: '0 0 6px 0', textTransform: 'uppercase' }}>
            Nota Metodológica &amp; Conformidade LGPD / Governança
          </h4>
          <p style={{ fontSize: 11, color: '#6b7280', margin: 0, lineHeight: 1.6 }}>
            {report.disclaimer}
          </p>
        </div>

        {/* Signature Block */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 32, borderTop: '1px solid #e5e7eb', marginTop: 40 }}>
          <div style={{ textAlign: 'center', width: '45%' }}>
            <div style={{ borderBottom: '1px solid #9ca3af', marginBottom: 6 }} />
            <div style={{ fontSize: 12, fontWeight: 800, color: '#111827' }}>Diretoria Executiva ISM</div>
            <div style={{ fontSize: 10, color: '#6b7280' }}>Instituto Ser Melhor</div>
          </div>
          <div style={{ textAlign: 'center', width: '45%' }}>
            <div style={{ borderBottom: '1px solid #9ca3af', marginBottom: 6 }} />
            <div style={{ fontSize: 12, fontWeight: 800, color: '#111827' }}>Comitê de Auditoria &amp; SROI</div>
            <div style={{ fontSize: 10, color: '#6b7280' }}>{report.auditorName}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
