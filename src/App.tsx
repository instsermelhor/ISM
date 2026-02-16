import React, { useEffect, useState } from 'react';
import { InstitutionalWrapper } from './components/layout/InstitutionalWrapper';
import { HeroInstitutional } from './components/sections/HeroInstitutional';
import { MissionVisionValues } from './components/sections/MissionVisionValues';
import { TimelineSection } from './components/sections/TimelineSection';
import { IdentityAndNetwork } from './components/sections/IdentityAndNetwork';
import { ValuesSection } from './components/sections/ValuesSection';
import { GovernanceStructure } from './components/sections/GovernanceStructure';
import { TransparencyReport } from './components/sections/TransparencyReport';
import { PartnerSection } from './components/sections/PartnerSection';
import { DonationSection } from './components/sections/DonationSection';
import { InstitutionalService } from './services/data';
import { AppData } from './types';

// Fallback loader component
const LoadingScreen = () => (
  <div className="flex items-center justify-center h-screen bg-white">
    <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
        <p className="text-brand-800 font-medium animate-pulse">Carregando Instituto Ser Melhor...</p>
    </div>
  </div>
);

// Error component
const ErrorScreen = ({ onRetry }: { onRetry: () => void }) => (
  <div className="flex items-center justify-center h-screen bg-white">
    <div className="flex flex-col items-center gap-4 text-center px-4">
        <div className="text-red-500 font-bold text-xl mb-2">Erro ao carregar dados</div>
        <p className="text-gray-600 mb-4">Não foi possível conectar ao sistema.</p>
        <button 
          onClick={onRetry}
          className="px-6 py-2 bg-brand-600 text-white rounded-full font-bold hover:bg-brand-700 transition-colors"
        >
          Tentar Novamente
        </button>
    </div>
  </div>
);

function App() {
  const [data, setData] = useState<AppData | null>(null);
  const [error, setError] = useState(false);

  const loadData = async () => {
    setError(false);
    try {
      const [
        pageRes, 
        valuesRes, 
        governanceInstRes, 
        timelineRes, 
        docsRes, 
        membersRes
      ] = await Promise.all([
        InstitutionalService.getPage(),
        InstitutionalService.getValueBlocks(),
        InstitutionalService.getGovernanceInstances(),
        InstitutionalService.getTimelineMilestones(),
        InstitutionalService.getTransparencyDocuments(),
        InstitutionalService.getGovernanceMembers()
      ]);

      setData({
        page: pageRes.data,
        valueBlocks: valuesRes.data,
        governanceInstances: governanceInstRes.data,
        timelineMilestones: timelineRes.data,
        transparencyDocuments: docsRes.data,
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
    <InstitutionalWrapper>
      <HeroInstitutional data={data.page.attributes} />
      <MissionVisionValues data={data.page.attributes} />
      <TimelineSection milestones={data.timelineMilestones} />
      <IdentityAndNetwork pageData={data.page.attributes} />
      <ValuesSection values={data.valueBlocks} />
      <GovernanceStructure 
        intro={data.page.attributes.governanceIntro}
        instances={data.governanceInstances}
        members={data.governanceMembers} 
      />
      <TransparencyReport 
        intro={data.page.attributes.transparencyIntro}
        documents={data.transparencyDocuments} 
        financials={data.financials} 
      />
      <PartnerSection />
      <DonationSection />
    </InstitutionalWrapper>
  );
}

export default App;