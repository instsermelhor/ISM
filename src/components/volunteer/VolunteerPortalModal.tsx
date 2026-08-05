/**
 * VolunteerPortalModal.tsx — G003: Área de Voluntários & Registro de Horas
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 * Modal do Programa de Voluntariado do Instituto Ser Melhor:
 *   - Vitrine de Vagas de Voluntariado (Presencial e Remoto)
 *   - Form de Inscrição para Novos Voluntários
 *   - Login do Voluntário & Painel de Horas Aprovadas
 *   - Lançamento de Horas Cumpridas
 *   - Emissão e Visualização do Certificado Oficial de Voluntariado
 */

import React, { useState } from 'react';
import {
  Users,
  Award,
  Clock,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  X,
  Briefcase,
  MapPin,
  QrCode,
  FileCheck,
  Send,
  Sparkles,
} from 'lucide-react';
import {
  VolunteerService,
  VolunteerProfile,
  VolunteerOpportunity,
  VolunteerArea,
  VOLUNTEER_OPPORTUNITIES,
} from '../../services/volunteerService';

interface VolunteerPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VolunteerPortalModal: React.FC<VolunteerPortalModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [view, setView] = useState<'CATALOG' | 'LOGIN' | 'REGISTER' | 'DASHBOARD'>('CATALOG');
  const [selectedArea, setSelectedArea] = useState<VolunteerArea | 'ALL'>('ALL');
  const [emailInput, setEmailInput] = useState('');
  const [profile, setProfile] = useState<VolunteerProfile | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form Inscrição Voluntário
  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
  });
  const [selectedInterests, setSelectedInterests] = useState<VolunteerArea[]>(['EDUCACAO']);

  // Form Lançamento de Horas
  const [showLogForm, setShowLogForm] = useState(false);
  const [logTitle, setLogTitle] = useState('Educador de Reforço Escolar');
  const [logDate, setLogDate] = useState('2026-08-05');
  const [logHours, setLogHours] = useState('4');
  const [logDesc, setLogDesc] = useState('');
  const [logSuccess, setLogSuccess] = useState(false);

  // Modal Certificado
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  if (!isOpen) return null;

  const opportunities = VolunteerService.getOpportunities(selectedArea);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await VolunteerService.login(emailInput || 'voluntario@exemplo.com');
      setProfile(res);
      setView('DASHBOARD');
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao realizar login.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await VolunteerService.registerVolunteer({
        ...regForm,
        areasOfInterest: selectedInterests,
      });
      setProfile(res);
      setView('DASHBOARD');
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro no cadastro.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogHoursSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    try {
      await VolunteerService.logHours(
        profile.email,
        logTitle,
        logDate,
        parseFloat(logHours) || 0,
        logDesc
      );
      setLogSuccess(true);
      setShowLogForm(false);
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const toggleInterest = (area: VolunteerArea) => {
    if (selectedInterests.includes(area)) {
      setSelectedInterests(selectedInterests.filter((a) => a !== area));
    } else {
      setSelectedInterests([...selectedInterests, area]);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9990,
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="volunteer-modal-title"
    >
      <div
        style={{
          background: '#0f172a',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 24,
          width: '100%',
          maxWidth: view === 'DASHBOARD' || view === 'CATALOG' ? 920 : 540,
          maxHeight: '90vh',
          overflowY: 'auto',
          color: 'white',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '24px 28px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), transparent)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'rgba(168, 85, 247, 0.2)',
                border: '1px solid rgba(168, 85, 247, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Users color="#c084fc" size={24} />
            </div>
            <div>
              <h2
                id="volunteer-modal-title"
                style={{ fontSize: 20, fontWeight: 800, margin: 0 }}
              >
                Programa de Voluntariado
              </h2>
              <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 13, margin: 0 }}>
                Instituto Ser Melhor — Transformando vidas através da ação coletiva
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              borderRadius: 10,
              color: 'rgba(255, 255, 255, 0.6)',
              cursor: 'pointer',
              width: 34,
              height: 34,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Mensagem de Erro */}
        {errorMsg && (
          <div
            style={{
              margin: '16px 28px 0',
              padding: '12px 16px',
              borderRadius: 12,
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <AlertCircle size={16} />
            {errorMsg}
          </div>
        )}

        {/* NAVEGAÇÃO DE VIEWS */}
        <div style={{ padding: '20px 28px 0', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={() => setView('CATALOG')}
            style={navBtnStyle(view === 'CATALOG')}
          >
            <Briefcase size={14} /> Vagas Abertas
          </button>
          <button
            onClick={() => setView('REGISTER')}
            style={navBtnStyle(view === 'REGISTER')}
          >
            <PlusCircle size={14} /> Quero ser Voluntário
          </button>

          {!profile ? (
            <button
              onClick={() => setView('LOGIN')}
              style={navBtnStyle(view === 'LOGIN')}
            >
              <Users size={14} /> Já sou Voluntário (Login)
            </button>
          ) : (
            <button
              onClick={() => setView('DASHBOARD')}
              style={navBtnStyle(view === 'DASHBOARD')}
            >
              <Award size={14} /> Meu Painel ({profile.totalHoursApproved}h)
            </button>
          )}
        </div>

        {/* VIEW 1: CATÁLOGO DE VAGAS */}
        {view === 'CATALOG' && (
          <div style={{ padding: 28 }}>
            {/* Filtros por Área */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
              {(['ALL', 'EDUCACAO', 'TECNOLOGIA', 'MEIO_AMBIENTE', 'SAUDE_BEM_ESTAR', 'EVENTOS_CULTURA'] as const).map((a) => (
                <button
                  key={a}
                  onClick={() => setSelectedArea(a)}
                  style={{
                    background: selectedArea === a ? '#c084fc' : 'rgba(255,255,255,0.06)',
                    color: selectedArea === a ? '#0f172a' : 'rgba(255,255,255,0.7)',
                    border: 'none',
                    borderRadius: 20,
                    padding: '6px 14px',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {a === 'ALL' ? 'Todas as Áreas' : a.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Grid de Oportunidades */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              {opportunities.map((op) => (
                <div
                  key={op.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 16,
                    padding: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                      <span
                        style={{
                          background: 'rgba(168, 85, 247, 0.2)',
                          color: '#c084fc',
                          borderRadius: 20,
                          padding: '2px 8px',
                          fontSize: 10,
                          fontWeight: 700,
                        }}
                      >
                        {op.area}
                      </span>
                      <span
                        style={{
                          background: 'rgba(59, 130, 246, 0.2)',
                          color: '#60a5fa',
                          borderRadius: 20,
                          padding: '2px 8px',
                          fontSize: 10,
                          fontWeight: 700,
                        }}
                      >
                        {op.modality}
                      </span>
                    </div>

                    <h4 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px' }}>{op.title}</h4>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, margin: '0 0 12px' }}>
                      {op.description}
                    </p>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <MapPin size={12} /> {op.location}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Clock size={12} /> Carga semanal: {op.weeklyHours}h/semana
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setView('REGISTER')}
                    style={{
                      marginTop: 16,
                      background: 'rgba(168, 85, 247, 0.15)',
                      border: '1px solid rgba(168, 85, 247, 0.4)',
                      color: '#c084fc',
                      borderRadius: 10,
                      padding: '8px 14px',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Inscrever-se para esta vaga
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 2: LOGIN DO VOLUNTÁRIO */}
        {view === 'LOGIN' && (
          <div style={{ padding: 28 }}>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>
                  E-mail do Voluntário ou Nº de Registro (ex: ISM-VOL-2026-0014)
                </label>
                <input
                  type="text"
                  placeholder="Ex: voluntario@exemplo.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 12,
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: 'white',
                    fontSize: 14,
                    outline: 'none',
                  }}
                />
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4, display: 'block' }}>
                  Para teste demonstrativo, use voluntario@exemplo.com.
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  background: '#c084fc',
                  color: '#0f172a',
                  border: 'none',
                  borderRadius: 12,
                  padding: '14px',
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: 'pointer',
                  marginTop: 8,
                }}
              >
                {loading ? 'Acessando...' : 'Acessar Painel do Voluntário'}
              </button>
            </form>
          </div>
        )}

        {/* VIEW 3: INSCRIÇÃO DE NOVO VOLUNTÁRIO */}
        {view === 'REGISTER' && (
          <div style={{ padding: 28 }}>
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Nome Completo *</label>
                  <input
                    required
                    type="text"
                    placeholder="Seu nome"
                    value={regForm.name}
                    onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>E-mail *</label>
                  <input
                    required
                    type="email"
                    placeholder="seu.email@exemplo.com"
                    value={regForm.email}
                    onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Telefone / WhatsApp *</label>
                  <input
                    required
                    type="text"
                    placeholder="(11) 90000-0000"
                    value={regForm.phone}
                    onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>CPF *</label>
                  <input
                    required
                    type="text"
                    placeholder="000.000.000-00"
                    value={regForm.cpf}
                    onChange={(e) => setRegForm({ ...regForm, cpf: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Seleção de Áreas de Interesse */}
              <div>
                <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: 8 }}>
                  Áreas de Interesse de Atuação *
                </label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {(['EDUCACAO', 'SAUDE_BEM_ESTAR', 'MEIO_AMBIENTE', 'EVENTOS_CULTURA', 'TECNOLOGIA'] as const).map((a) => {
                    const isSelected = selectedInterests.includes(a);
                    return (
                      <button
                        key={a}
                        type="button"
                        onClick={() => toggleInterest(a)}
                        style={{
                          background: isSelected ? 'rgba(168, 85, 247, 0.25)' : 'rgba(255,255,255,0.05)',
                          border: `1px solid ${isSelected ? '#c084fc' : 'rgba(255,255,255,0.1)'}`,
                          color: isSelected ? '#c084fc' : 'rgba(255,255,255,0.6)',
                          borderRadius: 20,
                          padding: '6px 12px',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {isSelected ? '✓ ' : ''}{a.replace('_', ' ')}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  background: '#c084fc',
                  color: '#0f172a',
                  border: 'none',
                  borderRadius: 12,
                  padding: '14px',
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: 'pointer',
                  marginTop: 12,
                }}
              >
                {loading ? 'Cadastrando...' : 'Concluir Inscrição de Voluntário'}
              </button>
            </form>
          </div>
        )}

        {/* VIEW 4: PAINEL DO VOLUNTÁRIO (DASHBOARD & HORAS) */}
        {view === 'DASHBOARD' && profile && (
          <div style={{ padding: 28 }}>
            {/* Stats Bar */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 16,
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  background: 'rgba(168, 85, 247, 0.1)',
                  border: '1px solid rgba(168, 85, 247, 0.25)',
                  borderRadius: 16,
                  padding: 16,
                }}
              >
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginBottom: 4 }}>
                  Horas Aprovadas
                </div>
                <div style={{ color: '#c084fc', fontSize: 28, fontWeight: 900, fontFamily: 'monospace' }}>
                  {profile.totalHoursApproved}h
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  borderRadius: 16,
                  padding: 16,
                }}
              >
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginBottom: 4 }}>
                  Horas Pendentes de Validação
                </div>
                <div style={{ color: '#fbbf24', fontSize: 28, fontWeight: 900, fontFamily: 'monospace' }}>
                  {profile.totalHoursPending}h
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 16,
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>REGISTRO OFICIAL</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'white', fontFamily: 'monospace' }}>
                  {profile.registrationNumber}
                </span>
              </div>
            </div>

            {/* Ações */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h4 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Histórico de Atividades</h4>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setShowCertificateModal(true)}
                  style={{
                    background: 'rgba(34, 197, 94, 0.15)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    color: '#4ade80',
                    borderRadius: 10,
                    padding: '8px 14px',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Award size={14} /> Ver Certificado Oficial
                </button>
                <button
                  onClick={() => setShowLogForm(!showLogForm)}
                  style={{
                    background: 'rgba(168, 85, 247, 0.2)',
                    border: '1px solid rgba(168, 85, 247, 0.4)',
                    color: '#c084fc',
                    borderRadius: 10,
                    padding: '8px 14px',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <PlusCircle size={14} /> Lançar Horas
                </button>
              </div>
            </div>

            {/* Form de Lançamento de Horas */}
            {showLogForm && (
              <form
                onSubmit={handleLogHoursSubmit}
                style={{
                  background: 'rgba(168, 85, 247, 0.05)',
                  border: '1px solid rgba(168, 85, 247, 0.2)',
                  borderRadius: 14,
                  padding: 16,
                  marginBottom: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>Oportunidade / Ação</label>
                    <input
                      required
                      type="text"
                      value={logTitle}
                      onChange={(e) => setLogTitle(e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>Data</label>
                    <input
                      required
                      type="date"
                      value={logDate}
                      onChange={(e) => setLogDate(e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>Horas</label>
                    <input
                      required
                      type="number"
                      value={logHours}
                      onChange={(e) => setLogHours(e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>Descrição da Atividade</label>
                  <input
                    required
                    type="text"
                    placeholder="Resumo do trabalho realizado..."
                    value={logDesc}
                    onChange={(e) => setLogDesc(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <button
                  type="submit"
                  style={{
                    background: '#c084fc',
                    color: '#0f172a',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 12px',
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: 'pointer',
                    alignSelf: 'flex-end',
                  }}
                >
                  Enviar para Validação
                </button>
              </form>
            )}

            {logSuccess && (
              <div
                style={{
                  padding: 12,
                  borderRadius: 10,
                  background: 'rgba(34, 197, 94, 0.15)',
                  color: '#86efac',
                  fontSize: 13,
                  marginBottom: 16,
                }}
              >
                ✓ Horas lançadas com sucesso! Aguardando aprovação da coordenação.
              </div>
            )}

            {/* Lista de Registros */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {profile.activityLogs.map((l) => (
                <div
                  key={l.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: 12,
                    padding: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{l.opportunityTitle}</div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }}>
                      {l.date} — {l.description}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontWeight: 800, color: '#c084fc', fontFamily: 'monospace' }}>
                      +{l.hoursSpent}h
                    </span>
                    <span
                      style={{
                        background: l.status === 'APROVADO' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: l.status === 'APROVADO' ? '#4ade80' : '#fbbf24',
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '4px 8px',
                        borderRadius: 14,
                      }}
                    >
                      {l.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODAL CERTIFICADO DE VOLUNTARIADO */}
        {showCertificateModal && profile && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: 'rgba(0, 0, 0, 0.85)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
            }}
          >
            <div
              style={{
                background: '#ffffff',
                color: '#0f172a',
                borderRadius: 20,
                padding: 40,
                maxWidth: 600,
                width: '100%',
                border: '8px solid #c084fc',
                textAlign: 'center',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              }}
            >
              <Award size={48} color="#9333ea" style={{ marginBottom: 12 }} />
              <h3 style={{ fontSize: 22, fontWeight: 900, color: '#581c87', margin: '0 0 6px' }}>
                CERTIFICADO DE VOLUNTARIADO
              </h3>
              <p style={{ fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1 }}>
                Instituto Ser Melhor — CNPJ 09.040.440/0001-47
              </p>

              <div style={{ margin: '24px 0', fontSize: 14, lineHeight: 1.6, color: '#334155' }}>
                Certificamos que <strong>{profile.name}</strong>, inscrito(a) sob o CPF nº <strong>{profile.cpf}</strong>, cumpriu dedicadamente a carga horária total de:
                <div style={{ fontSize: 36, fontWeight: 900, color: '#9333ea', margin: '12px 0' }}>
                  {profile.totalHoursApproved} HORAS DE AÇÃO SOCIAL
                </div>
                contribuindo ativamente para os programas de transformação social e ambiental da nossa instituição.
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid #e2e8f0',
                  paddingTop: 20,
                  marginTop: 20,
                }}
              >
                <div style={{ textAlign: 'left', fontSize: 11, color: '#64748b' }}>
                  <div>Registro: <strong>{profile.registrationNumber}</strong></div>
                  <div>Emissão: {new Date().toLocaleDateString('pt-BR')}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <QrCode size={40} color="#0f172a" />
                  <span style={{ fontSize: 10, color: '#16a34a', fontWeight: 700 }}>
                    VALIDADO DIGITALMENTE
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowCertificateModal(false)}
                style={{
                  marginTop: 24,
                  background: '#9333ea',
                  color: 'white',
                  border: 'none',
                  borderRadius: 10,
                  padding: '10px 24px',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Fechar Certificado
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const navBtnStyle = (active: boolean): React.CSSProperties => ({
  background: active ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255,255,255,0.04)',
  border: `1px solid ${active ? 'rgba(168, 85, 247, 0.4)' : 'rgba(255,255,255,0.08)'}`,
  color: active ? '#c084fc' : 'rgba(255,255,255,0.7)',
  borderRadius: 12,
  padding: '8px 14px',
  fontSize: 12,
  fontWeight: 700,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: 6,
});

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  background: 'rgba(255, 255, 255, 0.06)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  color: 'white',
  fontSize: 13,
  outline: 'none',
  marginTop: 4,
};
