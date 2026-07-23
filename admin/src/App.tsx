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
const AICoreEnterprisePage = lazy(() => import('./pages/AICoreEnterprisePage'));
const CommandCenterPage = lazy(() => import('./pages/CommandCenterPage'));
const StrategicGovernancePage = lazy(() => import('./pages/StrategicGovernancePage'));
const BPMPage = lazy(() => import('./pages/BPMPage'));
const KnowledgePage = lazy(() => import('./pages/KnowledgePage'));
const ImpactPage = lazy(() => import('./pages/ImpactPage'));
const ComplianceEnterprisePage = lazy(() => import('./pages/ComplianceEnterprisePage'));
const DataGovernancePage = lazy(() => import('./pages/DataGovernancePage'));
const ECMPage = lazy(() => import('./pages/ECMPage'));
const OmnichannelPage = lazy(() => import('./pages/OmnichannelPage'));
const StrategyPmoPage = lazy(() => import('./pages/StrategyPmoPage'));
const DigitalTwinPage = lazy(() => import('./pages/DigitalTwinPage'));
const AiAgentsPage = lazy(() => import('./pages/AiAgentsPage'));
const EnterpriseIntelligencePage = lazy(() => import('./pages/EnterpriseIntelligencePage'));
const BusinessContinuityPage = lazy(() => import('./pages/BusinessContinuityPage'));
const DigitalGovernancePage = lazy(() => import('./pages/DigitalGovernancePage'));
const EnterpriseCommandCenterPage = lazy(() => import('./pages/EnterpriseCommandCenterPage'));
const EnterpriseArchitectureQualityPage = lazy(() => import('./pages/EnterpriseArchitectureQualityPage'));
const EnterpriseIntegrationValidationPage = lazy(() => import('./pages/EnterpriseIntegrationValidationPage'));
const ContinuousEvolutionPage = lazy(() => import('./pages/ContinuousEvolutionPage'));
const EnterpriseReadinessCertificationPage = lazy(() => import('./pages/EnterpriseReadinessCertificationPage'));
const OperationalExcellenceLifecyclePage = lazy(() => import('./pages/OperationalExcellenceLifecyclePage'));
const AutonomousOperationsPage = lazy(() => import('./pages/AutonomousOperationsPage'));
const InstitutionalKnowledgePage = lazy(() => import('./pages/InstitutionalKnowledgePage'));
const StrategicIntelligencePage = lazy(() => import('./pages/StrategicIntelligencePage'));
const SocialImpactPage = lazy(() => import('./pages/SocialImpactPage'));
const GovernanceEIGCAPPage = lazy(() => import('./pages/GovernanceEIGCAPPage'));
const ECDTISPPage = lazy(() => import('./pages/ECDTISPPage'));
const EALOIPPage = lazy(() => import('./pages/EALOIPPage'));
const EMAIVGPPage = lazy(() => import('./pages/EMAIVGPPage'));
const EIRCTPPage = lazy(() => import('./pages/EIRCTPPage'));
const EISRFRPPage = lazy(() => import('./pages/EISRFRPPage'));
const EIPCORFPage = lazy(() => import('./pages/EIPCORFPage'));
const EPRVFOSFPage = lazy(() => import('./pages/EPRVFOSFPage'));
const EHACOPPage = lazy(() => import('./pages/EHACOPPage'));
const EAGSCEPPage = lazy(() => import('./pages/EAGSCEPPage'));
const EDCGCIOSPage = lazy(() => import('./pages/EDCGCIOSPage'));
const EIEIIPPage = lazy(() => import('./pages/EIEIIPPage'));
const EFIIDSPPage = lazy(() => import('./pages/EFIIDSPPage'));
const ESIIEOMPPage = lazy(() => import('./pages/ESIIEOMPPage'));
const ECOIDNSPage = lazy(() => import('./pages/ECOIDNSPage'));
const EAIOSPage = lazy(() => import('./pages/EAIOSPage'));
const EIEBCFPage = lazy(() => import('./pages/EIEBCFPage'));
const EMTFIPPage = lazy(() => import('./pages/EMTFIPPage'));
const EFCEDCPPage = lazy(() => import('./pages/EFCEDCPPage'));
const EMCOPPage = lazy(() => import('./pages/EMCOPPage'));
const ESIPFPPage = lazy(() => import('./pages/ESIPFPPage'));
const ENIODEPPage = lazy(() => import('./pages/ENIODEPPage'));
const EAOSPESPage = lazy(() => import('./pages/EAOSPESPage'));
const ETAGDTPPage = lazy(() => import('./pages/ETAGDTPPage'));
const EDINSPage = lazy(() => import('./pages/EDINSPage'));
const EIOSECCPage = lazy(() => import('./pages/EIOSECCPage'));
const EAEIALPPage = lazy(() => import('./pages/EAEIALPPage'));
const EAICODOPPage = lazy(() => import('./pages/EAICODOPPage'));
const EMIPVSIOSPage = lazy(() => import('./pages/EMIPVSIOSPage'));
const EFICKINPPage = lazy(() => import('./pages/EFICKINPPage'));
const ECIPSIPPage = lazy(() => import('./pages/ECIPSIPPage'));
const EEBIMPPage = lazy(() => import('./pages/EEBIMPPage'));
const ECGDIILPPage = lazy(() => import('./pages/ECGDIILPPage'));
const EAGSCIRPPage = lazy(() => import('./pages/EAGSCIRPPage'));
const EAMCIOSPage = lazy(() => import('./pages/EAMCIOSPage'));
const EPFCSRFPage = lazy(() => import('./pages/EPFCSRFPage'));

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
              <Route path="ia" element={<AICoreEnterprisePage />} />
              <Route path="command-center" element={<CommandCenterPage />} />
              <Route path="governanca-estrategica" element={<StrategicGovernancePage />} />
              <Route path="bpm" element={<BPMPage />} />
              <Route path="conhecimento" element={<KnowledgePage />} />
              <Route path="impacto" element={<ImpactPage />} />
              <Route path="compliance" element={<ComplianceEnterprisePage />} />
              <Route path="dados" element={<DataGovernancePage />} />
              <Route path="ecm" element={<ECMPage />} />
              <Route path="omnichannel" element={<OmnichannelPage />} />
              <Route path="estrategia-pmo" element={<StrategyPmoPage />} />
              <Route path="digital-twin" element={<DigitalTwinPage />} />
              <Route path="ai-agents" element={<AiAgentsPage />} />
              <Route path="enterprise-intelligence" element={<EnterpriseIntelligencePage />} />
              <Route path="business-continuity" element={<BusinessContinuityPage />} />
              <Route path="digital-governance" element={<DigitalGovernancePage />} />
              <Route path="command-center" element={<EnterpriseCommandCenterPage />} />
              <Route path="architecture-quality" element={<EnterpriseArchitectureQualityPage />} />
              <Route path="integration-validation" element={<EnterpriseIntegrationValidationPage />} />
              <Route path="continuous-evolution" element={<ContinuousEvolutionPage />} />
              <Route path="readiness-certification" element={<EnterpriseReadinessCertificationPage />} />
              <Route path="operational-lifecycle" element={<OperationalExcellenceLifecyclePage />} />
              <Route path="autonomous-operations" element={<AutonomousOperationsPage />} />
              <Route path="institutional-knowledge" element={<InstitutionalKnowledgePage />} />
              <Route path="strategic-intelligence" element={<StrategicIntelligencePage />} />
              <Route path="social-impact" element={<SocialImpactPage />} />
              <Route path="governance-eigcap" element={<GovernanceEIGCAPPage />} />
              <Route path="digital-twin-ecdtisp" element={<ECDTISPPage />} />
              <Route path="adaptive-learning-ealoip" element={<EALOIPPage />} />
              <Route path="mission-alignment-emaivgp" element={<EMAIVGPPage />} />
              <Route path="innovation-eirctp" element={<EIRCTPPage />} />
              <Route path="sustainability-resilience-eisrfrp" element={<EISRFRPPage />} />
              <Route path="integrated-certification-eipcorf" element={<EIPCORFPage />} />
              <Route path="production-readiness-eprv-fosf" element={<EPRVFOSFPage />} />
              <Route path="hypercare-ehacop" element={<EHACOPPage />} />
              <Route path="autonomous-governance-eagscep" element={<EAGSCEPPage />} />
              <Route path="digital-constitution-edcgc-ios" element={<EDCGCIOSPage />} />
              <Route path="ecosystem-integration-eieiip" element={<EIEIIPPage />} />
              <Route path="federated-intelligence-efiidsp" element={<EFIIDSPPage />} />
              <Route path="social-impact-esiieomp" element={<ESIIEOMPPage />} />
              <Route path="cognitive-organization-eco-idns" element={<ECOIDNSPage />} />
              <Route path="adaptive-os-eaios" element={<EAIOSPage />} />
              <Route path="excellence-framework-eiebcf" element={<EIEBCFPage />} />
              <Route path="multi-tenant-emtfip" element={<EMTFIPPage />} />
              <Route path="collaborative-ecosystem-efcedcp" element={<EFCEDCPPage />} />
              <Route path="mission-orchestration-emcop" element={<EMCOPPage />} />
              <Route path="social-foresight-esipfp" element={<ESIPFPPage />} />
              <Route path="national-interoperability-eniodep" element={<ENIODEPPage />} />
              <Route path="autonomous-operations-eaospes" element={<EAOSPESPage />} />
              <Route path="digital-trust-etagdtp" element={<ETAGDTPPage />} />
              <Route path="digital-nervous-system-edins" element={<EDINSPage />} />
              <Route path="institutional-operating-system-eios-ecc" element={<EIOSECCPage />} />
              <Route path="autonomous-evolution-eaeialp" element={<EAEIALPPage />} />
              <Route path="adaptive-intelligence-eaicodop" element={<EAICODOPPage />} />
              <Route path="mission-intelligence-emipvsios" element={<EMIPVSIOSPage />} />
              <Route path="federated-intelligence-efickinp" element={<EFICKINPPage />} />
              <Route path="collective-intelligence-ecipsip" element={<ECIPSIPPage />} />
              <Route path="excellence-benchmarking-eebimp" element={<EEBIMPPage />} />
              <Route path="cognitive-governance-ecgdiilp" element={<ECGDIILPPage />} />
              <Route path="autonomous-governance-eagscirp" element={<EAGSCIRPPage />} />
              <Route path="mission-critical-eamcios" element={<EAMCIOSPage />} />
              <Route path="final-certification-epfcsrf" element={<EPFCSRFPage />} />
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

