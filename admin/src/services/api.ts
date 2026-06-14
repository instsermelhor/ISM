// Mock data service — simulates API (replace with real API calls)
import type {
  User, Post, Service, TeamMember, ContactLead, LeadStatus, PipelineCard,
  AuditLog, HealthCheck, SiteSetting, AnalyticsSummary, TimeSeriesPoint
} from '../types';





// ── AUTH ──────────────────────────────────────────────────────
// Tabela de credenciais: cada usuário tem sua própria senha.
// Em produção NUNCA armazene senhas em texto plano — use bcrypt + backend.
const MOCK_CREDENTIALS: Record<string, string> = {
  'instsermelhor.adm@gmail.com': '@@Rk08266570#',  // Super Admin
  'admin@ism.org':   'admin123',                    // Admin legado (altere antes de ir a producão)
  'editor@ism.org':  'editor123',
  'viewer@ism.org':  'viewer123',
};

const MOCK_USERS: User[] = [
  {
    id: '0',
    name: 'Instituto Ser Melhor',
    email: 'instsermelhor.adm@gmail.com',
    role: 'ADMIN',
    avatarUrl: 'https://ui-avatars.com/api/?name=ISM+Admin&background=16a34a&color=fff&bold=true&size=80',
    isActive: true,
    createdAt: '2024-01-01',
    lastLoginAt: new Date().toISOString(),
  },
  { id: '1', name: 'Rikardo Ribeiro', email: 'admin@ism.org', role: 'ADMIN', avatarUrl: 'https://api.dicebear.com/8.x/initials/svg?seed=RR&backgroundColor=16a34a&textColor=ffffff', isActive: true, createdAt: '2024-01-01' },
  { id: '2', name: 'Maria Santos', email: 'editor@ism.org', role: 'EDITOR', avatarUrl: 'https://api.dicebear.com/8.x/initials/svg?seed=MS&backgroundColor=3b82f6&textColor=ffffff', isActive: true, createdAt: '2024-03-15' },
  { id: '3', name: 'João Oliveira', email: 'viewer@ism.org', role: 'VIEWER', avatarUrl: 'https://api.dicebear.com/8.x/initials/svg?seed=JO&backgroundColor=a855f7&textColor=ffffff', isActive: true, createdAt: '2024-06-01' },
];

export const AuthService = {
  login: async (email: string, password: string): Promise<User> => {
    await delay(800);
    const user = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    const validPassword = MOCK_CREDENTIALS[email.toLowerCase()] || MOCK_CREDENTIALS[email];

    if (!user || !validPassword || password !== validPassword) {
      throw new Error('Credenciais inválidas. Verifique seu e-mail e senha.');
    }
    if (!user.isActive) {
      throw new Error('Conta suspensa. Contate o administrador.');
    }

    // Atualiza lastLoginAt
    user.lastLoginAt = new Date().toISOString();
    localStorage.setItem('ism_admin_user', JSON.stringify(user));
    localStorage.setItem('ism_admin_token', `mock_jwt_${user.id}_${Date.now()}`);
    return user;
  },
  logout: () => {
    localStorage.removeItem('ism_admin_user');
    localStorage.removeItem('ism_admin_token');
  },
  getCurrentUser: (): User | null => {
    try {
      const raw = localStorage.getItem('ism_admin_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      // Storage corrompido — limpar e forçar novo login
      localStorage.removeItem('ism_admin_user');
      localStorage.removeItem('ism_admin_token');
      return null;
    }
  },
  isAuthenticated: (): boolean => !!localStorage.getItem('ism_admin_token'),
};

// ── ANALYTICS ─────────────────────────────────────────────────
export const AnalyticsService = {
  getSummary: async (): Promise<AnalyticsSummary> => {
    await delay(600);
    return {
      pageviews30d: 42817,
      uniqueVisitors30d: 18340,
      bounceRate: 38.4,
      leadsGenerated30d: 127,
      series: generateSeries(30),
      topPages: [
        { path: '/', views: 12400 },
        { path: '/sobre', views: 6800 },
        { path: '/blog', views: 4100 },
        { path: '/doacao', views: 3200 },
        { path: '/contato', views: 2100 },
      ],
      leadsBySource: [
        { source: 'Contato', count: 54 },
        { source: 'Doação', count: 41 },
        { source: 'Parceria', count: 32 },
      ],
    };
  },
};

// ── AUDIT LOG ─────────────────────────────────────────────────
const AUDIT_ACTIONS = ['CREATE', 'UPDATE', 'DELETE', 'PUBLISH', 'ARCHIVE', 'LOGIN'] as const;
const ENTITIES = ['Post', 'HeroSection', 'Service', 'User', 'SiteSettings', 'ContactLead'];
const DESCS: Record<string, string[]> = {
  UPDATE: ['atualizou o Hero', 'editou textos do Sobre', 'modificou configurações de SEO', 'editou post', 'atualizou membro da equipe'],
  PUBLISH: ['publicou post "ODS 2035"', 'publicou serviço "Educação"', 'publicou post "Agenda ISM"'],
  CREATE: ['criou novo post', 'adicionou serviço', 'criou card no Pipeline'],
  DELETE: ['removeu rascunho', 'arquivou lead'],
  LOGIN: ['fez login no sistema'],
  ARCHIVE: ['arquivou lead', 'arquivou post antigo'],
};

const mockAuditLogs: AuditLog[] = Array.from({ length: 40 }, (_, i) => {
  const user = MOCK_USERS[i % 3];
  const action = AUDIT_ACTIONS[i % AUDIT_ACTIONS.length];
  const descs = DESCS[action] || ['realizou ação'];
  return {
    id: `audit_${i}`,
    userId: user.id,
    userName: user.name,
    userAvatar: user.avatarUrl,
    action,
    entity: ENTITIES[i % ENTITIES.length],
    description: descs[i % descs.length],
    ipAddress: `192.168.${Math.floor(i/10)}.${i % 255}`,
    createdAt: new Date(Date.now() - i * 3600000 * 2).toISOString(),
  };
});

export const AuditService = {
  getLogs: async (page = 1, limit = 20): Promise<{ data: AuditLog[]; total: number }> => {
    await delay(400);
    const start = (page - 1) * limit;
    return { data: mockAuditLogs.slice(start, start + limit), total: mockAuditLogs.length };
  },
  getRecent: async (limit = 8): Promise<AuditLog[]> => {
    await delay(300);
    return mockAuditLogs.slice(0, limit);
  },
};

// ── POSTS ─────────────────────────────────────────────────────
const mockPosts: Post[] = [
  { id: '1', title: 'Agenda ISM 2035: Metas de Sustentabilidade', slug: 'agenda-ism-2035', excerpt: 'Apresentamos nosso plano estratégico para os próximos 10 anos.', status: 'PUBLISHED', publishedAt: '2025-06-01T10:00:00Z', authorName: 'Maria Santos', categories: ['Sustentabilidade'], tags: ['ods', '2035'], createdAt: '2025-05-20T08:00:00Z', updatedAt: '2025-06-01T10:00:00Z' },
  { id: '2', title: 'Relatório Anual 2024 — Transparência Total', slug: 'relatorio-anual-2024', excerpt: 'Prestação de contas completa do exercício fiscal 2024.', status: 'PUBLISHED', publishedAt: '2025-03-15T14:00:00Z', authorName: 'Rikardo Ribeiro', categories: ['Governança'], tags: ['financeiro', 'transparência'], createdAt: '2025-03-10T09:00:00Z', updatedAt: '2025-03-15T14:00:00Z' },
  { id: '3', title: 'Novos Projetos de Educação Ambiental', slug: 'projetos-educacao-ambiental', excerpt: 'Expansão dos programas educacionais para 5 novos municípios.', status: 'REVIEW', authorName: 'Maria Santos', categories: ['Educação'], tags: ['ambiental', 'projetos'], createdAt: '2025-06-10T11:00:00Z', updatedAt: '2025-06-12T16:00:00Z' },
  { id: '4', title: 'Parceria com Universidade de São Paulo', slug: 'parceria-usp', excerpt: 'Acordo de cooperação técnica para pesquisa ambiental avançada.', status: 'DRAFT', authorName: 'João Oliveira', categories: ['Parcerias'], tags: ['academia', 'pesquisa'], createdAt: '2025-06-13T09:00:00Z', updatedAt: '2025-06-13T09:00:00Z' },
  { id: '5', title: 'Resultados do Programa Água Limpa', slug: 'resultados-agua-limpa', excerpt: 'Mais de 50 comunidades beneficiadas com acesso a água potável.', status: 'SCHEDULED', scheduledFor: '2025-07-01T10:00:00Z', authorName: 'Maria Santos', categories: ['Impacto Social'], tags: ['agua', 'comunidade'], createdAt: '2025-06-11T14:00:00Z', updatedAt: '2025-06-13T08:00:00Z' },
];

export const PostsService = {
  getAll: async (): Promise<Post[]> => { await delay(400); return mockPosts; },
  getById: async (id: string): Promise<Post | undefined> => { await delay(200); return mockPosts.find(p => p.id === id); },
  create: async (data: Partial<Post>): Promise<Post> => {
    await delay(500);
    const newPost: Post = { id: Date.now().toString(), title: '', slug: '', status: 'DRAFT', authorName: 'Rikardo Ribeiro', categories: [], tags: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...data };
    mockPosts.push(newPost);
    return newPost;
  },
  update: async (id: string, data: Partial<Post>): Promise<Post> => {
    await delay(400);
    const idx = mockPosts.findIndex(p => p.id === id);
    if (idx >= 0) { mockPosts[idx] = { ...mockPosts[idx], ...data, updatedAt: new Date().toISOString() }; return mockPosts[idx]; }
    throw new Error('Post não encontrado');
  },
  delete: async (id: string): Promise<void> => { await delay(300); const idx = mockPosts.findIndex(p => p.id === id); if (idx >= 0) mockPosts.splice(idx, 1); },
};

// ── SERVICES ──────────────────────────────────────────────────
const mockServices: Service[] = [
  { id: '1', title: 'Educação Transformadora', slug: 'educacao', description: 'Programas de educação integral e ambiental para jovens e comunidades.', isPublished: true, order: 1, createdAt: '2024-01-01T00:00:00Z' },
  { id: '2', title: 'Proteção Animal', slug: 'protecao-animal', description: 'Ações de resgate, reabilitação e adoção responsável de animais.', isPublished: true, order: 2, createdAt: '2024-01-01T00:00:00Z' },
  { id: '3', title: 'Preservação Ambiental', slug: 'preservacao', description: 'Projetos de reflorestamento e monitoramento de biomas.', isPublished: true, order: 3, createdAt: '2024-02-15T00:00:00Z' },
  { id: '4', title: 'Desenvolvimento Social', slug: 'desenvolvimento-social', description: 'Apoio a comunidades vulneráveis com capacitação e geração de renda.', isPublished: false, order: 4, createdAt: '2024-06-01T00:00:00Z' },
];

export const ServicesService = {
  getAll: async (): Promise<Service[]> => { await delay(300); return mockServices; },
  create: async (data: Partial<Service>): Promise<Service> => {
    await delay(400);
    const s: Service = { id: Date.now().toString(), title: '', slug: '', description: '', isPublished: false, order: mockServices.length + 1, createdAt: new Date().toISOString(), ...data };
    mockServices.push(s);
    return s;
  },
  update: async (id: string, data: Partial<Service>): Promise<Service> => {
    await delay(300);
    const idx = mockServices.findIndex(s => s.id === id);
    if (idx >= 0) { mockServices[idx] = { ...mockServices[idx], ...data }; return mockServices[idx]; }
    throw new Error('Serviço não encontrado');
  },
  delete: async (id: string): Promise<void> => { await delay(200); const idx = mockServices.findIndex(s => s.id === id); if (idx >= 0) mockServices.splice(idx, 1); },
};

// ── LEADS ─────────────────────────────────────────────────────
const mockLeads: ContactLead[] = [
  { id: '1', name: 'Ana Paula Ferreira', email: 'ana@empresa.com', phone: '(11) 99999-0001', subject: 'Parceria Corporativa', message: 'Gostaríamos de discutir uma parceria ESG com nossa empresa para 2025.', source: 'partner-form', status: 'NEW', createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: '2', name: 'Carlos Eduardo Lima', email: 'carlos@gmail.com', subject: 'Doação Recorrente', message: 'Gostaria de configurar uma doação mensal de R$500.', source: 'donation', status: 'READ', createdAt: new Date(Date.now() - 7200000 * 3).toISOString() },
  { id: '3', name: 'Sofia Mendes', email: 'sofia@univ.br', subject: 'Pesquisa Acadêmica', message: 'Pesquisadora de sustentabilidade, gostaria de colaborar com o instituto.', source: 'contact-form', status: 'REPLIED', notes: 'Enviado e-mail de resposta com agenda.', createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: '4', name: 'Roberto Alves', email: 'roberto@corp.com.br', subject: 'Voluntariado Executivo', message: 'Equipe de 20 voluntários disponível para projetos sociais em SP.', source: 'contact-form', status: 'NEW', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: '5', name: 'Luciana Costa', email: 'lu.costa@ong.org', subject: 'Cooperação Técnica', message: 'Interessada em intercâmbio de metodologias de educação ambiental.', source: 'partner-form', status: 'ARCHIVED', createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
];

export const LeadsService = {
  getAll: async (): Promise<ContactLead[]> => { await delay(400); return mockLeads; },
  updateStatus: async (id: string, status: LeadStatus, notes?: string): Promise<ContactLead> => {
    await delay(300);
    const idx = mockLeads.findIndex(l => l.id === id);
    if (idx >= 0) {
      mockLeads[idx] = { ...mockLeads[idx], status, ...(notes && { notes }) };
      return mockLeads[idx];
    }
    throw new Error('Lead não encontrado');
  },
};

// ── PIPELINE ──────────────────────────────────────────────────
const mockPipeline: PipelineCard[] = [
  { id: 'p1', title: 'ODS 2035 — Artigo de Opinião', stage: 'IDEA', priority: 2, dueDate: '2025-06-30' },
  { id: 'p2', title: 'Relatório de Impacto Q2', stage: 'IDEA', priority: 1 },
  { id: 'p3', title: 'Agenda ISM 2035', stage: 'WRITING', priority: 2, dueDate: '2025-06-20', assignee: 'Maria Santos' },
  { id: 'p4', title: 'Novo Site Mobile', stage: 'WRITING', priority: 1, assignee: 'Rikardo Ribeiro' },
  { id: 'p5', title: 'Relatório Anual 2024', stage: 'REVIEW', priority: 2, dueDate: '2025-06-15', assignee: 'João Oliveira' },
  { id: 'p6', title: 'Newsletter Julho', stage: 'APPROVED', priority: 0, dueDate: '2025-07-01', postId: '3' },
  { id: 'p7', title: 'Agenda ISM 2035 — publicado', stage: 'PUBLISHED', priority: 2, postId: '1' },
  { id: 'p8', title: 'Relatório Anual 2024 — publicado', stage: 'PUBLISHED', priority: 1, postId: '2' },
];

export const PipelineService = {
  getAll: async (): Promise<PipelineCard[]> => { await delay(300); return mockPipeline; },
  move: async (id: string, stage: PipelineCard['stage']): Promise<void> => {
    await delay(200);
    const idx = mockPipeline.findIndex(c => c.id === id);
    if (idx >= 0) mockPipeline[idx].stage = stage;
  },
  create: async (data: Partial<PipelineCard>): Promise<PipelineCard> => {
    await delay(300);
    const c: PipelineCard = { id: `p${Date.now()}`, title: '', stage: 'IDEA', priority: 0, ...data };
    mockPipeline.push(c);
    return c;
  },
};

// ── HEALTH CHECK ──────────────────────────────────────────────
export const HealthService = {
  get: async (): Promise<HealthCheck> => {
    await delay(500);
    return { api: 'ok', db: 'ok', redis: 'ok', storage: 'warn', dbLatency: 12, redisLatency: 0.3, storageUsedPct: 72, uptime: '99.8%' };
  },
};

// ── SETTINGS ──────────────────────────────────────────────────
const defaultSettings: SiteSetting[] = [
  { key: 'site.name', value: 'Instituto Ser Melhor', group: 'general', label: 'Nome do Site', type: 'text' },
  { key: 'site.description', value: 'Catalisadores de transformações sociais e ambientais', group: 'general', label: 'Descrição Curta', type: 'textarea' },
  { key: 'site.logo', value: '/logo-ism.png', group: 'general', label: 'Logo Principal', type: 'image' },
  { key: 'seo.ga_id', value: 'G-XXXXXXXXXX', group: 'seo', label: 'Google Analytics ID', type: 'text' },
  { key: 'seo.meta_title', value: 'Instituto Ser Melhor — Transformação Social', group: 'seo', label: 'Meta Title Global', type: 'text' },
  { key: 'seo.meta_desc', value: 'ONG brasileira que promove transformações sociais e ambientais desde 2007.', group: 'seo', label: 'Meta Description Global', type: 'textarea' },
  { key: 'social.instagram', value: 'https://instagram.com/institutosermelhor', group: 'social', label: 'Instagram', type: 'url' },
  { key: 'social.facebook', value: 'https://facebook.com/institutosermelhor', group: 'social', label: 'Facebook', type: 'url' },
  { key: 'social.linkedin', value: 'https://linkedin.com/company/institutosermelhor', group: 'social', label: 'LinkedIn', type: 'url' },
  { key: 'design.primary_color', value: '#16a34a', group: 'design', label: 'Cor Principal (Brand)', type: 'color' },
  { key: 'design.accent_color', value: '#002776', group: 'design', label: 'Cor Secundária', type: 'color' },
];

export const SettingsService = {
  getAll: async (): Promise<SiteSetting[]> => { await delay(300); return defaultSettings; },
  update: async (key: string, value: string): Promise<void> => {
    await delay(200);
    const idx = defaultSettings.findIndex(s => s.key === key);
    if (idx >= 0) defaultSettings[idx].value = value;
  },
};

// ── USERS ─────────────────────────────────────────────────────
export const UsersService = {
  getAll: async (): Promise<User[]> => { await delay(300); return MOCK_USERS; },
  update: async (id: string, data: Partial<User>): Promise<User> => {
    await delay(300);
    const idx = MOCK_USERS.findIndex(u => u.id === id);
    if (idx >= 0) { Object.assign(MOCK_USERS[idx], data); return MOCK_USERS[idx]; }
    throw new Error('Usuário não encontrado');
  },
};

// ── HELPERS ───────────────────────────────────────────────────
function delay(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

function generateSeries(days: number): TimeSeriesPoint[] {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    return { date: d.toISOString().split('T')[0], pageviews: 800 + Math.round(Math.random() * 2000), leads: 1 + Math.round(Math.random() * 8) };
  });
}
