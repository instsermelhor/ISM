import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { BlogPage } from './pages/BlogPage';
import { LeadsPage } from './pages/LeadsPage';
import { PipelinePage } from './pages/PipelinePage';
import { AuditPage } from './pages/AuditPage';
import { HealthPage } from './pages/HealthPage';
import { SettingsPage } from './pages/SettingsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { FinancialPage } from './pages/FinancialPage';
import { HeroHomePage } from './pages/HeroHomePage';
import { AboutTeamPage } from './pages/AboutTeamPage';
import { ServicesPage } from './pages/ServicesPage';
import { UsersPage } from './pages/UsersPage';

// Placeholder pages for sections under development
// const PlaceholderPage = ({ title, description }: { title: string; description: string }) => (
//   <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 16, color: 'var(--gray-400)' }}>
//     <div style={{ width: 80, height: 80, borderRadius: 20, background: 'var(--brand-50)', border: '2px dashed var(--brand-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
//       🚧
//     </div>
//     <div style={{ textAlign: 'center' }}>
//       <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--gray-700)', marginBottom: 6 }}>{title}</h2>
//       <p style={{ fontSize: 14, color: 'var(--gray-400)', maxWidth: 300 }}>{description}</p>
//     </div>
//     <span className="badge badge-yellow" style={{ marginTop: 8 }}>Em Desenvolvimento</span>
//   </div>
// );


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected - Dashboard Layout */}
          <Route element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />

            {/* Conteúdo */}
            <Route path="conteudo/hero" element={<HeroHomePage />} />
            <Route path="conteudo/sobre" element={<AboutTeamPage />} />
            <Route path="conteudo/servicos" element={<ServicesPage />} />
            <Route path="conteudo/blog" element={<BlogPage />} />
            <Route path="conteudo/leads" element={<LeadsPage />} />

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
            <Route path="configuracoes" element={<SettingsPage />} />
            <Route path="usuarios" element={<UsersPage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
