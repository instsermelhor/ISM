/**
 * BeneficiaryPortalModal.tsx — G002: Portal do Beneficiário & Cadastro de Famílias Assistidas
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 * Modal restrito para beneficiários e famílias assistidas:
 *   - Login por CPF/Protocolo com suporte a demo (CPF: 123.456.789-00)
 *   - Formulário de Novo Cadastro Familiar (Dados socioeconômicos e composição)
 *   - Cartão Digital do Beneficiário com QR Code e protocolo
 *   - Painel de Benefícios Ativos (Cestas, Reforço, Apoio Psicossocial)
 *   - Agendamento de Retiradas e Atendimentos
 */

import React, { useState } from 'react';
import {
  UserCheck,
  QrCode,
  Calendar,
  Package,
  PlusCircle,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  HeartHandshake,
  Users,
  Building,
} from 'lucide-react';
import {
  BeneficiaryService,
  BeneficiaryProfile,
  BenefitType,
  FamilyMember,
} from '../../services/beneficiaryService';

interface BeneficiaryPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BeneficiaryPortalModal: React.FC<BeneficiaryPortalModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [cpfInput, setCpfInput] = useState('');
  const [profile, setProfile] = useState<BeneficiaryProfile | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form State Novo Cadastro
  const [regForm, setRegForm] = useState({
    responsibleName: '',
    cpf: '',
    nis: '',
    phone: '',
    email: '',
    street: '',
    number: '',
    neighborhood: '',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '',
    monthlyIncome: '',
  });

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([
    { name: '', age: 0, relationship: 'Filho(a)' },
  ]);

  // Form Agendamento
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [selectedBenefit, setSelectedBenefit] = useState<BenefitType>('CESTA_ALIMENTAR');
  const [scheduleDate, setScheduleDate] = useState('2026-08-20');
  const [scheduleTime, setScheduleTime] = useState('10:00');
  const [scheduleSuccess, setScheduleSuccess] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await BeneficiaryService.login(cpfInput || '12345678900');
      setProfile(res);
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
      const validMembers = familyMembers.filter((m) => m.name.trim() !== '');
      const res = await BeneficiaryService.registerFamily({
        ...regForm,
        monthlyIncome: parseFloat(regForm.monthlyIncome) || 0,
        familyMembers: validMembers,
      });
      setProfile(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro no cadastro.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = () => {
    setFamilyMembers([...familyMembers, { name: '', age: 0, relationship: 'Filho(a)' }]);
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    try {
      await BeneficiaryService.requestBenefit(
        profile.cpf,
        selectedBenefit,
        scheduleDate,
        scheduleTime
      );
      setScheduleSuccess(true);
      setShowScheduleForm(false);
    } catch (err: any) {
      setErrorMsg(err.message);
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
      aria-labelledby="beneficiary-modal-title"
    >
      <div
        style={{
          background: '#0f172a',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 24,
          width: '100%',
          maxWidth: profile ? 900 : 540,
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
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), transparent)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'rgba(34, 197, 94, 0.15)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <HeartHandshake color="#4ade80" size={24} />
            </div>
            <div>
              <h2
                id="beneficiary-modal-title"
                style={{ fontSize: 20, fontWeight: 800, margin: 0 }}
              >
                Portal do Beneficiário
              </h2>
              <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 13, margin: 0 }}>
                Instituto Ser Melhor — Área de Atendimento Familiar
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

        {/* CONTEÚDO 1: NÃO AUTENTICADO (LOGIN / CADASTRO) */}
        {!profile && (
          <div style={{ padding: 28 }}>
            {/* Tabs */}
            <div
              style={{
                display: 'flex',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 14,
                padding: 4,
                marginBottom: 24,
              }}
            >
              <button
                onClick={() => {
                  setActiveTab('LOGIN');
                  setErrorMsg(null);
                }}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: 10,
                  border: 'none',
                  background: activeTab === 'LOGIN' ? '#22c55e' : 'transparent',
                  color: activeTab === 'LOGIN' ? '#0f172a' : 'rgba(255, 255, 255, 0.7)',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                Já possuo cadastro
              </button>
              <button
                onClick={() => {
                  setActiveTab('REGISTER');
                  setErrorMsg(null);
                }}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: 10,
                  border: 'none',
                  background: activeTab === 'REGISTER' ? '#22c55e' : 'transparent',
                  color: activeTab === 'REGISTER' ? '#0f172a' : 'rgba(255, 255, 255, 0.7)',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                Cadastrar Nova Família
              </button>
            </div>

            {/* TAB LOGIN */}
            {activeTab === 'LOGIN' && (
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>
                    CPF ou Número de Protocolo Familiar
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 123.456.789-00 ou ISM-FAM-2026-0104"
                    value={cpfInput}
                    onChange={(e) => setCpfInput(e.target.value)}
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
                    Para teste demonstrativo, clique em acessar sem digitar ou use o CPF 123.456.789-00.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: '#22c55e',
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
                  {loading ? 'Acessando...' : 'Acessar Área Restrita'}
                </button>
              </form>
            )}

            {/* TAB REGISTER */}
            {activeTab === 'REGISTER' && (
              <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Nome do Responsável *</label>
                    <input
                      required
                      type="text"
                      placeholder="Nome Completo"
                      value={regForm.responsibleName}
                      onChange={(e) => setRegForm({ ...regForm, responsibleName: e.target.value })}
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>NIS (opcional)</label>
                    <input
                      type="text"
                      placeholder="Número do NIS"
                      value={regForm.nis}
                      onChange={(e) => setRegForm({ ...regForm, nis: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
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
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Endereço (Rua/Av) *</label>
                    <input
                      required
                      type="text"
                      placeholder="Rua..."
                      value={regForm.street}
                      onChange={(e) => setRegForm({ ...regForm, street: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Número *</label>
                    <input
                      required
                      type="text"
                      placeholder="123"
                      value={regForm.number}
                      onChange={(e) => setRegForm({ ...regForm, number: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Renda Familiar Total (R$) *</label>
                  <input
                    required
                    type="number"
                    placeholder="Ex: 1412.00"
                    value={regForm.monthlyIncome}
                    onChange={(e) => setRegForm({ ...regForm, monthlyIncome: e.target.value })}
                    style={inputStyle}
                  />
                </div>

                {/* Composição Familiar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                      Dependentes / Membros da Família
                    </label>
                    <button
                      type="button"
                      onClick={handleAddMember}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#4ade80',
                        fontSize: 12,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <PlusCircle size={14} /> Adicionar Membro
                    </button>
                  </div>

                  {familyMembers.map((m, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <input
                        type="text"
                        placeholder="Nome do dependente"
                        value={m.name}
                        onChange={(e) => {
                          const copy = [...familyMembers];
                          copy[idx].name = e.target.value;
                          setFamilyMembers(copy);
                        }}
                        style={{ ...inputStyle, flex: 2 }}
                      />
                      <input
                        type="number"
                        placeholder="Idade"
                        value={m.age || ''}
                        onChange={(e) => {
                          const copy = [...familyMembers];
                          copy[idx].age = parseInt(e.target.value) || 0;
                          setFamilyMembers(copy);
                        }}
                        style={{ ...inputStyle, flex: 1 }}
                      />
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: '#22c55e',
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
                  {loading ? 'Cadastrando...' : 'Finalizar Cadastro Familiar'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* CONTEÚDO 2: BENEFICIÁRIO AUTENTICADO (PAINEL DO BENEFICIÁRIO) */}
        {profile && (
          <div style={{ padding: 28 }}>
            {/* Top Bar perfil */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr',
                gap: 20,
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 16,
                padding: 20,
                marginBottom: 24,
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span
                    style={{
                      background: profile.status === 'ACTIVE' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                      color: profile.status === 'ACTIVE' ? '#4ade80' : '#fbbf24',
                      border: `1px solid ${profile.status === 'ACTIVE' ? 'rgba(34, 197, 94, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
                      borderRadius: 20,
                      padding: '2px 10px',
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {profile.status === 'ACTIVE' ? 'CADASTRO ATIVO' : 'EM ANÁLISE SOCIAL'}
                  </span>
                  <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12, fontFamily: 'monospace' }}>
                    {profile.protocolNumber}
                  </span>
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 4px' }}>{profile.responsibleName}</h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 13, margin: 0 }}>
                  Composição: {profile.familyMembersCount} pessoas | Renda Per Capita: R$ {profile.monthlyIncomePerCapita.toFixed(2)}/mês
                </p>
              </div>

              {/* Cartão Digital QR */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 12,
                  padding: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    background: 'white',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <QrCode size={36} color="#0f172a" />
                </div>
                <div>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', display: 'block' }}>
                    CARTÃO DIGITAL
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#4ade80' }}>
                    VALIDADO ISM
                  </span>
                </div>
              </div>
            </div>

            {/* Ações / Solicitacao */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h4 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Benefícios & Atendimentos</h4>
              <button
                onClick={() => setShowScheduleForm(!showScheduleForm)}
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
                <Calendar size={14} /> Solicitacao / Agendamento
              </button>
            </div>

            {/* Form de Agendamento */}
            {showScheduleForm && (
              <form
                onSubmit={handleScheduleSubmit}
                style={{
                  background: 'rgba(34, 197, 94, 0.05)',
                  border: '1px solid rgba(34, 197, 94, 0.2)',
                  borderRadius: 14,
                  padding: 16,
                  marginBottom: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>Tipo de Benefício</label>
                    <select
                      value={selectedBenefit}
                      onChange={(e) => setSelectedBenefit(e.target.value as BenefitType)}
                      style={{ ...inputStyle, background: '#1e293b' }}
                    >
                      <option value="CESTA_ALIMENTAR">Cesta Nutricional</option>
                      <option value="APOIO_PSICOSSOCIAL">Apoio Psicossocial</option>
                      <option value="REFORCO_ESCOLAR">Reforço Escolar</option>
                      <option value="KIT_MATERIAL_ESCOLAR">Kit Escolar</option>
                      <option value="OFICINA_CAPACITACAO">Oficina de Capacitação</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>Data</label>
                    <input
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>Horário</label>
                    <input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  style={{
                    background: '#22c55e',
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
                  Confirmar Agendamento
                </button>
              </form>
            )}

            {/* Sucesso de agendamento */}
            {scheduleSuccess && (
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
                ✓ Solicitação/agendamento realizado com sucesso!
              </div>
            )}

            {/* Lista de Benefícios */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
              {profile.benefits.map((b) => (
                <div
                  key={b.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 14,
                    padding: 16,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <Package size={16} color="#4ade80" />
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{b.title}</span>
                  </div>
                  <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 12, margin: '0 0 10px' }}>
                    {b.description}
                  </p>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: b.status === 'DISPONIVEL' ? '#4ade80' : 'rgba(255,255,255,0.5)',
                    }}
                  >
                    Status: {b.status}
                  </span>
                </div>
              ))}
            </div>

            {/* Lista de Agendamentos */}
            <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Meus Agendamentos</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {profile.appointments.length === 0 ? (
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Nenhum agendamento pendente.</p>
              ) : (
                profile.appointments.map((a) => (
                  <div
                    key={a.id}
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
                      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{a.title}</div>
                      <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }}>
                        {a.date} às {a.time} — {a.location}
                      </div>
                    </div>
                    <span
                      style={{
                        background: 'rgba(34, 197, 94, 0.15)',
                        color: '#4ade80',
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: 20,
                      }}
                    >
                      {a.status}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Sair */}
            <button
              onClick={() => setProfile(null)}
              style={{
                marginTop: 24,
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'rgba(255, 255, 255, 0.6)',
                borderRadius: 10,
                padding: '8px 16px',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              Sair do Portal
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

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
