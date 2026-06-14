import React, { useEffect, useState } from 'react';

// Layout
import { InstitutionalWrapper } from './components/layout/InstitutionalWrapper';

// Sections
import { HeroInstitutional } from './components/sections/HeroInstitutional';
import { MissionVisionValues } from './components/sections/MissionVisionValues';
import { TimelineSection } from './components/sections/TimelineSection';
import { IdentityAndNetwork } from './components/sections/IdentityAndNetwork';
import { ValuesSection } from './components/sections/ValuesSection';
import { GovernanceStructure } from './components/sections/GovernanceStructure';
import { TransparencyReport } from './components/sections/TransparencyReport';
import { PartnerSection } from './components/sections/PartnerSection';
import { DonationSection } from './components/sections/DonationSection';

// UI & Legal
import { Modal } from './components/ui/Modal';
import { PrivacyPolicy } from './components/legal/PrivacyPolicy';
import { TermsOfUse } from './components/legal/TermsOfUse';

// Data & Types
import { InstitutionalService } from './services/data';
import { AppData } from './types';

// Fallback loader component
const LoadingScreen = () => (
  <div className="flex items-center justify-center h-screen bg-secondary-950">
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-secondary-800 border-t-brand-500 rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <img src="/logo-ism.png" alt="Logo" className="w-8 h-8 object-contain" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-white font-bold text-sm">Instituto Ser Melhor</p>
        <p className="text-secondary-500 text-xs mt-1 animate-pulse-slow">Carregando...</p>
      </div>
    </div>
  </div>
);

// Error component
const ErrorScreen = ({ onRetry }: { onRetry: () => void }) => (
  <div className="flex items-center justify-center h-screen bg-secondary-950">
    <div className="flex flex-col items-center gap-5 text-center px-6 max-w-sm">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 text-2xl font-black">
        !
      </div>
      <div>
        <p className="text-white font-bold text-xl mb-2">Erro ao carregar dados</p>
        <p className="text-secondary-400 text-sm leading-relaxed">Não foi possível conectar ao sistema. Verifique sua conexão e tente novamente.</p>
      </div>
      <button
        onClick={onRetry}
        className="px-8 py-3 bg-brand-600 text-white rounded-full font-bold text-sm hover:bg-brand-700 transition-colors shadow-lg shadow-brand-600/30"
      >
        Tentar Novamente
      </button>
    </div>
  </div>
);

function App() {
  const [data, setData] = useState<AppData | null>(null);
  const [error, setError] = useState(false);

  // Modal State
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  const loadData = async () => {
    setError(false);
    try {
      const [
        pageRes, 
        valuesRes, 
        governanceInstRes, 
        timelineRes, 
        membersRes
      ] = await Promise.all([
        InstitutionalService.getPage(),
        InstitutionalService.getValueBlocks(),
        InstitutionalService.getGovernanceInstances(),
        InstitutionalService.getTimelineMilestones(),
        InstitutionalService.getGovernanceMembers()
      ]);

      setData({
        page: pageRes.data,
        valueBlocks: valuesRes.data,
        governanceInstances: governanceInstRes.data,
        timelineMilestones: timelineRes.data,
        governanceMembers: membersRes.data,
        financials: [ 
           { id: 1, name: 'Programas', value: 75, color: '#16a34a' },
           { id: 2, name: 'Admin', value: 15, color: '#1e293b' },
           { id: 3, name: 'Captação', value: 10, color: '#94a3b8' }
        ]
      });
    } catch (error) {
      console.error("Failed to fetch institutional data", error);
      setError(true);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (error) {
    return <ErrorScreen onRetry={loadData} />;
  }

  if (!data) {
    return <LoadingScreen />;
  }

  return (
    <>
      <InstitutionalWrapper 
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        onOpenTerms={() => setIsTermsOpen(true)}
      >
        <HeroInstitutional data={data.page.attributes} />
        <MissionVisionValues data={data.page.attributes} />
        <ValuesSection values={data.valueBlocks} />
        <TimelineSection milestones={data.timelineMilestones} />
        <IdentityAndNetwork pageData={data.page.attributes} />
        <GovernanceStructure 
          intro={data.page.attributes.governanceIntro}
          instances={data.governanceInstances}
          members={data.governanceMembers} 
        />
        <TransparencyReport 
          intro={data.page.attributes.transparencyIntro}
          documents={data.page.attributes.transparencyDocuments} 
          financials={data.financials} 
        />
        <PartnerSection />
        <DonationSection />
      </InstitutionalWrapper>

      {/* Global Legal Modals */}
      <Modal 
        isOpen={isPrivacyOpen} 
        onClose={() => setIsPrivacyOpen(false)}
        title="Política de Privacidade"
      >
        <PrivacyPolicy />
      </Modal>

      <Modal 
        isOpen={isTermsOpen} 
        onClose={() => setIsTermsOpen(false)}
        title="Termos de Uso"
      >
        <TermsOfUse />
      </Modal>
    </>
  );
}

export default App;