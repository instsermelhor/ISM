import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DashboardLayout } from './components/layout/DashboardLayout';


// Importações dinâmicas (Code Splitting / Lazy Loading)
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const BlogPage = lazy(() => import('./pages/BlogPage').then(m => ({ default: m.BlogPage })));
const LeadsPage = lazy(() => import('./pages/LeadsPage').then(m => ({ default: m.LeadsPage })));
const PipelinePage = lazy(() => import('./pages/PipelinePage').then(m => ({ default: m.PipelinePage })));
const AuditPage = lazy(() => import('./pages/AuditPage').then(m => ({ default: m.AuditPage })));
const HealthPage = lazy(() => import('./pages/HealthPage').then(m => ({ default: m.HealthPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const FinancialPage = lazy(() => import('./pages/FinancialPage').then(m => ({ default: m.FinancialPage })));
const HeroHomePage = lazy(() => import('./pages/HeroHomePage').then(m => ({ default: m.HeroHomePage })));
const AboutTeamPage = lazy(() => import('./pages/AboutTeamPage').then(m => ({ default: m.AboutTeamPage })));
const ServicesPage = lazy(() => import('./pages/ServicesPage').then(m => ({ default: m.ServicesPage })));
const UsersPage = lazy(() => import('./pages/UsersPage').then(m => ({ default: m.UsersPage })));
const SiteEditorPage = lazy(() => import('./pages/SiteEditorPage').then(m => ({ default: m.SiteEditorPage })));
const DonationEditorPage = lazy(() => import('./pages/DonationEditorPage').then(m => ({ default: m.DonationEditorPage })));
const CMSSeoManagerPage = lazy(() => import('./pages/CMSSeoManagerPage').then(m => ({ default: m.CMSSeoManagerPage })));
const PartnersPage = lazy(() => import('./pages/PartnersPage').then(m => ({ default: m.PartnersPage })));
const CommunicationPage = lazy(() => import('./pages/CommunicationPage'));
const SchedulePage = lazy(() => import('./pages/SchedulePage'));
const EHRPage = lazy(() => import('./pages/EHRPage'));
const BIPage = lazy(() => import('./pages/BIPage'));
const GovernanceSecurityPage = lazy(() => import('./pages/GovernanceSecurityPage'));
const IntegrationHubPage = lazy(() => import('./pages/IntegrationHubPage'));
const DevSecOpsSREPage = lazy(() => import('./pages/DevSecOpsSREPage'));

const LoadingSpinner = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, color: 'var(--brand-600)' }}>
    <div className="animate-spin" style={{ width: 32, height: 32, border: '3px solid var(--gray-200)', borderTopColor: 'var(--brand-600)', borderRadius: '50%' }} />
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected - Dashboard Layout */}
            <Route element={<DashboardLayout />}>
              <Route index element={<DashboardPage />} />

              {/* Editor do Site (Módulo Separado) */}
              <Route path="site" element={<SiteEditorPage />} />
              <Route path="site/hero" element={<HeroHomePage />} />
              <Route path="site/institucional" element={<AboutTeamPage />} />
              <Route path="site/projetos" element={<ServicesPage />} />
              <Route path="site/doacoes" element={<DonationEditorPage />} />
              <Route path="site/seo" element={<CMSSeoManagerPage />} />

              {/* Gestão da Instituição */}
              <Route path="blog" element={<BlogPage />} />
              <Route path="agenda" element={<SchedulePage />} />
              <Route path="pep" element={<EHRPage />} />
              <Route path="bi" element={<BIPage />} />
              <Route path="governanca" element={<GovernanceSecurityPage />} />
              <Route path="integracoes" element={<IntegrationHubPage />} />
              <Route path="devsecops" element={<DevSecOpsSREPage />} />
              <Route path="leads" element={<LeadsPage />} />
              <Route path="parceiros" element={<PartnersPage />} />
              <Route path="comunicacao" element={<CommunicationPage />} />

              {/* Financeiro — cada sub-rota abre uma aba específica */}
              <Route path="financeiro"          element={<FinancialPage initialTab="overview" />} />
              <Route path="financeiro/doacoes"  element={<FinancialPage initialTab="donations" />} />
              <Route path="financeiro/doadores" element={<FinancialPage initialTab="donors" />} />
              <Route path="financeiro/bancario" element={<FinancialPage initialTab="banking" />} />
              <Route path="financeiro/metas"    element={<FinancialPage initialTab="goals" />} />

              {/* Gestão */}
              <Route path="pipeline" element={<PipelinePage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="auditoria" element={<AuditPage />} />
              <Route path="health" element={<HealthPage />} />

              {/* Configurações */}
              <Route path="usuarios" element={<UsersPage />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

