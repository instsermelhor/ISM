import React, { useState, useEffect } from 'react';
import { 
  Building2, ShieldCheck, Plus, RefreshCw, 
  Users, CheckCircle2, AlertTriangle, Key, ExternalLink, Lock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTenant } from '../contexts/TenantContext';
import { TenantService } from '../services/tenantService';
import type { Tenant, TenantMembership, TenantRole, TenantType } from '../types';

export const TenantsManagerPage: React.FC = () => {
  const { user } = useAuth();
  const { activeTenant, isSuperAdmin, switchTenant } = useTenant();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [members, setMembers] = useState<TenantMembership[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showMemberModal, setShowMemberModal] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form states
  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantSlug, setNewTenantSlug] = useState('');
  const [newTenantType, setNewTenantType] = useState<TenantType>('NGO_PARTNER');
  const [newTenantDoc, setNewTenantDoc] = useState('');
  const [newTenantDomain, setNewTenantDomain] = useState('');

  const [memberUserId, setMemberUserId] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState<TenantRole>('TENANT_VIEWER');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await TenantService.getTenants(isSuperAdmin, activeTenant?.id);
      setTenants(data);
      if (data.length > 0) {
        const current = data.find(t => t.id === activeTenant?.id) || data[0];
        setSelectedTenant(current);
        const mems = await TenantService.getTenantMembers(current.id);
        setMembers(mems);
      }
    } catch (err) {
      console.error('[TenantsPage] Erro ao carregar tenants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isSuperAdmin, activeTenant]);

  const handleSelectTenant = async (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setLoading(true);
    try {
      const mems = await TenantService.getTenantMembers(tenant.id);
      setMembers(mems);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantName || !newTenantSlug) {
      setFeedback({ type: 'error', message: 'Preencha o nome e o slug do tenant.' });
      return;
    }

    try {
      const tenantId = await TenantService.createTenant({
        name: newTenantName,
        slug: newTenantSlug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        type: newTenantType,
        status: 'ACTIVE',
        documentNumber: newTenantDoc || undefined,
        domain: newTenantDomain || undefined,
        settings: {
          primaryColor: '#0A4D68',
          features: {
            customBranding: true,
            crmLeads: true,
            donationsManagement: true,
            bpmWorkflows: true,
            financialReports: true,
            biAnalytics: true,
          },
        },
      });

      setFeedback({ type: 'success', message: `Tenant "${newTenantName}" provisionado com sucesso (${tenantId}).` });
      setShowCreateModal(false);
      setNewTenantName('');
      setNewTenantSlug('');
      setNewTenantDoc('');
      setNewTenantDomain('');
      await loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Falha ao criar tenant.' });
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant || !memberUserId || !memberEmail) {
      setFeedback({ type: 'error', message: 'Preencha UID e E-mail do usuário.' });
      return;
    }

    try {
      await TenantService.addTenantMember(
        selectedTenant.id,
        memberUserId,
        memberEmail,
        memberRole,
        user?.email || 'admin'
      );
      setFeedback({ type: 'success', message: `Membro ${memberEmail} vinculado com sucesso.` });
      setShowMemberModal(false);
      setMemberUserId('');
      setMemberEmail('');
      const mems = await TenantService.getTenantMembers(selectedTenant.id);
      setMembers(mems);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Falha ao vincular membro.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Multi-Tenancy & Isolamento Lógico</h1>
              <p className="text-sm text-slate-500">Gestão de fronteiras organizacionais, isolamento de dados e memberships (MT-001)</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            title="Atualizar"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {isSuperAdmin && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Novo Tenant
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 ${
          feedback.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-rose-600" />}
          <span className="text-sm font-medium">{feedback.message}</span>
        </div>
      )}

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Tenants */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center justify-between">
            <span>Tenants Cadastrados</span>
            <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">{tenants.length}</span>
          </h2>

          <div className="space-y-2">
            {tenants.map(t => {
              const isSelected = selectedTenant?.id === t.id;
              const isActiveTenant = activeTenant?.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => handleSelectTenant(t)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/40 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-900 text-sm">{t.name}</span>
                    {isActiveTenant && (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">Ativo</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">{t.id}</span>
                    <span>•</span>
                    <span className="capitalize">{t.type.toLowerCase().replace('_', ' ')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detalhes do Tenant & Membresias */}
        <div className="lg:col-span-2 space-y-6">
          {selectedTenant ? (
            <>
              {/* Informações do Tenant */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div>
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">{selectedTenant.type}</span>
                    <h2 className="text-xl font-bold text-slate-900">{selectedTenant.name}</h2>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">Namespace ID: {selectedTenant.id}</p>
                  </div>

                  {isSuperAdmin && activeTenant?.id !== selectedTenant.id && (
                    <button
                      onClick={() => switchTenant(selectedTenant.id)}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <Key className="w-3.5 h-3.5" />
                      Alternar Sessão para Este Tenant
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-xs text-slate-500 block">Status</span>
                    <span className="text-sm font-semibold text-emerald-700">{selectedTenant.status}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-xs text-slate-500 block">CNPJ / Doc</span>
                    <span className="text-sm font-semibold text-slate-800">{selectedTenant.documentNumber || '—'}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-xs text-slate-500 block">Domínio</span>
                    <span className="text-sm font-semibold text-slate-800">{selectedTenant.domain || 'Nativo'}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-xs text-slate-500 block">Membros</span>
                    <span className="text-sm font-semibold text-slate-800">{members.length}</span>
                  </div>
                </div>
              </div>

              {/* Membros e Permissões do Tenant */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-slate-700" />
                    <h3 className="text-base font-bold text-slate-900">Membros e Acesso Delegado</h3>
                  </div>

                  {(isSuperAdmin || user?.role === 'ADMIN') && (
                    <button
                      onClick={() => setShowMemberModal(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Vincular Membro
                    </button>
                  )}
                </div>

                {members.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    Nenhum membro vinculado explicitamente a este tenant.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {members.map(m => (
                      <div key={m.id} className="py-3 flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-slate-800 text-sm">{m.userEmail}</div>
                          <div className="text-xs text-slate-400 font-mono">UID: {m.userId}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
                            {m.role}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Regras de Isolamento & Auditoria de Segurança */}
              <div className="bg-emerald-950 text-emerald-100 p-6 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                  <h4 className="font-bold text-sm tracking-wide uppercase">Garantia de Isolamento Multi-Tenant</h4>
                </div>
                <p className="text-xs leading-relaxed text-emerald-200">
                  Todas as operações de leitura, escrita, deleção e exportação para a organização <strong>{selectedTenant.name}</strong> são segregadas em nível de Security Rules, Middleware REST v2 e Token JWT com chave de namespace <code>{selectedTenant.id}</code>. Tentativas de acesso cross-tenant são bloqueadas e registradas na trilha imutável.
                </p>
              </div>
            </>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400">
              Selecione um tenant para visualizar detalhes e membresias.
            </div>
          )}
        </div>
      </div>

      {/* Modal Criar Tenant */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Provisionar Novo Tenant</h3>
            <form onSubmit={handleCreateTenant} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Nome da Organização / Empresa</label>
                <input
                  type="text"
                  value={newTenantName}
                  onChange={e => setNewTenantName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="Ex: Fundação Alpha Brasil"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Slug / Identificador de Namespace</label>
                <input
                  type="text"
                  value={newTenantSlug}
                  onChange={e => setNewTenantSlug(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm font-mono"
                  placeholder="ex: alpha-brasil"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Tipo de Tenant</label>
                <select
                  value={newTenantType}
                  onChange={e => setNewTenantType(e.target.value as TenantType)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="NGO_PARTNER">ONG / OSC Parceira</option>
                  <option value="CORPORATE_SPONSOR">Patrocinador Corporativo</option>
                  <option value="PUBLIC_AGENCY">Órgão Público / Secretaria</option>
                  <option value="REGIONAL_HUB">Polo Regional Descentralizado</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">CNPJ / Documento (Opcional)</label>
                <input
                  type="text"
                  value={newTenantDoc}
                  onChange={e => setNewTenantDoc(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="00.000.000/0001-00"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-slate-600 text-sm font-semibold hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg"
                >
                  Criar Tenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Vincular Membro */}
      {showMemberModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Vincular Usuário ao Tenant</h3>
            <form onSubmit={handleAddMember} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">E-mail do Usuário</label>
                <input
                  type="email"
                  value={memberEmail}
                  onChange={e => setMemberEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="gestor@empresa.com"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">UID do Firebase Auth</label>
                <input
                  type="text"
                  value={memberUserId}
                  onChange={e => setMemberUserId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm font-mono"
                  placeholder="UID gerado no Firebase Auth"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Função / Papel no Tenant</label>
                <select
                  value={memberRole}
                  onChange={e => setMemberRole(e.target.value as TenantRole)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="TENANT_ADMIN">Tenant Admin (Administrador Completo)</option>
                  <option value="TENANT_GESTOR">Tenant Gestor (Projetos & Ações)</option>
                  <option value="TENANT_OPERADOR">Tenant Operador (Atendimento & Leads)</option>
                  <option value="TENANT_VIEWER">Tenant Viewer (Apenas Leitura)</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowMemberModal(false)}
                  className="px-4 py-2 text-slate-600 text-sm font-semibold hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg"
                >
                  Vincular
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
