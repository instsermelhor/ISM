import { 
  InstitutionalPageAttributes, 
  ValueBlockAttributes, 
  GovernanceInstanceAttributes, 
  TimelineMilestoneAttributes, 
  GovernanceMemberAttributes 
} from '../../types';

export const institutionalData = {
  page: {
    id: 1,
    attributes: {
      title: "Institucional - Instituto Ser Melhor",
      introduction: "Somos uma organização não-governamental brasileira que atua como catalisadora de transformações sociais e ambientais. Nossa história é marcada pela busca incessante de redefinir o conceito de impacto sistêmico.",
      missionStatement: "Promover a completa emancipação humana e o desenvolvimento sustentável integral, atuando como catalisador inigualável de transformações sociais, ambientais, educacionais e culturais. Existimos para redefinir o conceito de impacto, garantindo que cada indivíduo e comunidade alcance seu potencial máximo de dignidade e prosperidade, superando as barreiras da desigualdade com soluções de vanguarda.",
      visionStatement: "Ser o fator decisivo na construção de um mundo equitativo, próspero e regenerativo, onde a necessidade da assistência social como a conhecemos tenha sido mitigada pela eficácia de nossas soluções e a disseminação de nossos princípios. Seremos eternamente reconhecidos como a única entidade que atingiu o patamar de excelência máxima no Terceiro Setor, servindo de modelo global insuperável para a governança, transparência e impacto sistêmico.",
      governanceIntro: "A Governança do Instituto Ser Melhor é uma arquitetura de controle e deliberação desenhada para garantir a perpetuidade da Missão, a transparência quântica e a máxima eficiência na alocação de recursos. Nossa estrutura é composta por cinco instâncias interconectadas, assegurando o sistema de checks and balances mais rigoroso do setor.",
      transparencyIntro: "No Instituto Ser Melhor, a transparência é definida como a disponibilização proativa e compreensível de dados sobre gestão, finanças, impacto e governança, em tempo hábil e em formato acessível. Nosso princípio é exceder os requisitos legais e éticos, garantindo que a informação esteja disponível a ponto de antecipar dúvidas e erradicar especulações.",
      logoImage: "https://picsum.photos/id/20/400/400",
      heroImage: "https://picsum.photos/1920/1080?grayscale",
      logoExplanation: "Nossa identidade visual não é apenas um emblema; é uma síntese filosófica de nossa Missão, ancorada na busca pela sabedoria e pelo aprimoramento contínuo. O emblema circular com três figuras humanas estilizadas representa o nosso foco no Desenvolvimento Sustentável Integral e o ciclo perpétuo da melhoria.",
      motto: "Sapere Aude",
      mottoExplanation: "Significa 'Ouse Saber'. Reflete nosso Valor de Excelência Inflexível e a importância da Educação Transformadora. Enfatiza que a verdadeira melhoria e emancipação vêm da coragem de utilizar a própria razão e do compromisso em buscar o conhecimento mais profundo.",
      networkIntro: "O Instituto Ser Melhor reconhece que a excelência não é alcançada no isolamento. Nossa capacidade de gerar impacto sistêmico é potencializada por uma rede de colaboração estratégica, composta por instituições, experts e corporações que compartilham o nosso Compromisso Perpétuo com a transformação global.",
      transparencyDocuments: [
        {
          id: 1,
          documentName: "Demonstrações Financeiras 2024 (Auditado - Big 4)",
          documentType: "Financeiro",
          documentFile: "#",
          publicationDate: "2024-03-30",
          fileSize: "4.2 MB"
        },
        {
          id: 2,
          documentName: "Relatório Anual de Impacto e Atividades",
          documentType: "Impacto",
          documentFile: "#",
          publicationDate: "2024-03-15",
          fileSize: "15.4 MB"
        },
        {
          id: 3,
          documentName: "Política de Remuneração e Quadro Executivo",
          documentType: "Legal",
          documentFile: "#",
          publicationDate: "2024-01-15",
          fileSize: "1.2 MB"
        },
        {
          id: 4,
          documentName: "Código de Conduta e Integridade",
          documentType: "Código de Conduta",
          documentFile: "#",
          publicationDate: "2023-01-10",
          fileSize: "2.5 MB"
        }
      ]
    } as InstitutionalPageAttributes
  },
  valueBlocks: [
    {
      id: 1,
      attributes: {
        name: "Excelência Inflexível",
        iconIdentifier: "star",
        description: "Não buscamos apenas a melhoria; exigimos a perfeição em cada projeto, parceria e interação. Nosso padrão de qualidade é o mais alto do mundo, sem margem para mediocridade ou conformismo."
      }
    },
    {
      id: 2,
      attributes: {
        name: "Transparência Quântica",
        iconIdentifier: "shield",
        description: "Operamos com um nível de clareza e prestação de contas que excede todas as normas regulatórias globais. Nossa integridade não é apenas uma prática, é a essência visível de todas as nossas decisões financeiras e operacionais."
      }
    },
    {
      id: 3,
      attributes: {
        name: "Protagonismo Regenerativo",
        iconIdentifier: "zap",
        description: "Acreditamos que a solução de um problema não deve criar outro. Buscamos um impacto que não apenas restaure, mas aprimore e gere vitalidade nos sistemas sociais e ambientais, liderando pelo exemplo na sustentabilidade verdadeira."
      }
    },
    {
      id: 4,
      attributes: {
        name: "Colaboração de Elite",
        iconIdentifier: "users",
        description: "Somente trabalhamos com parceiros, stakeholders e talentos que compartilham o nosso compromisso com a excelência absoluta. O nosso sucesso é o resultado de uma sinergia estratégica focada em multiplicar o impacto de forma exponencial."
      }
    },
    {
      id: 5,
      attributes: {
        name: "Compromisso Perpétuo",
        iconIdentifier: "infinity",
        description: "Nossa dedicação à Missão é incondicional e atemporal. Nosso trabalho é um legado que transcende gerações, focado na resolução definitiva dos desafios sociais e ambientais."
      }
    }
  ] as { id: number; attributes: ValueBlockAttributes }[],
  governanceInstances: [
    {
      id: 1,
      attributes: {
        title: "Assembleia Geral de Associados Estratégicos",
        order: 1,
        summary: "Órgão máximo e soberano do Instituto, composto exclusivamente por membros com histórico comprovado de liderança e impacto sistêmico em suas respectivas áreas.",
        keyAttributes: [
          { attributeText: "Aprovar ou rejeitar demonstrações financeiras anuais auditadas (com parecer do Conselho Fiscal) e eleger/destituir conselheiros." },
          { attributeText: "Exige Quórum Qualificado (2/3) para alterações estatutárias e deliberações sobre o patrimônio." },
          { attributeText: "Reuniões Ordinárias Anuais com divulgação prévia de documentos via Portal de Transparência." }
        ]
      }
    },
    {
      id: 2,
      attributes: {
        title: "Conselho Deliberativo de Excelência (CDE)",
        order: 2,
        summary: "Guardião da Integridade e Estratégia, responsável por definir o longo prazo e supervisionar a Diretoria-Executiva.",
        keyAttributes: [
          { attributeText: "Formado por especialistas de renome internacional, totalmente independentes da gestão executiva (Independência Radical)." },
          { attributeText: "Aprova Políticas de Risco, Compliance e Captação de Recursos." },
          { attributeText: "Avaliação anual de performance do CEO baseada em KPIs de Impacto." },
          { attributeText: "Auxiliado por Comitês Técnicos permanentes (Inovação, Ética e Compliance)." }
        ]
      }
    },
    {
      id: 3,
      attributes: {
        title: "Conselho Fiscal e de Auditoria Quântica (CFA)",
        order: 3,
        summary: "Órgão de controle interno com poderes irrestritos de fiscalização, assegurando a aderência aos padrões IFRS.",
        keyAttributes: [
          { attributeText: "Membros independentes com expertise certificada em auditoria, finanças ou direito (CFC, CVM)." },
          { attributeText: "Emite Parecer Sem Ressalvas sobre as Demonstrações Financeiras para a Assembleia." },
          { attributeText: "Supervisiona a contratação de Auditoria Independente de primeira linha global." },
          { attributeText: "Reporte direto à Assembleia Geral com autonomia total de investigação." }
        ]
      }
    },
    {
      id: 4,
      attributes: {
        title: "Diretoria-Executiva de Gestão (D-E)",
        order: 4,
        summary: "Órgão profissional responsável pela gestão estratégica e operacional do dia a dia e execução impecável dos programas.",
        keyAttributes: [
          { attributeText: "Liderada por um CEO de visão global com mandato e metas definidas pelo CDE." },
          { attributeText: "Administração do patrimônio e execução orçamentária alinhada aos Princípios de Integridade." },
          { attributeText: "Prestação de Contas trimestral detalhada (Financeiro e Impacto) ao Conselho Deliberativo." }
        ]
      }
    },
    {
      id: 5,
      attributes: {
        title: "Conselho Consultivo de Liderança Global (CCLG)",
        order: 5,
        summary: "Think tank composto por líderes mundiais e ex-chefes de estado que fornecem orientação estratégica sobre tendências globais.",
        keyAttributes: [
          { attributeText: "Garante a Vantagem de Conhecimento (Knowledge Edge), antecipando crises e oportunidades." },
          { attributeText: "Fornece orientação sobre inovações disruptivas e desafios geopolíticos." },
          { attributeText: "Natureza estritamente consultiva, preservando a agilidade decisória dos órgãos formais." }
        ]
      }
    }
  ] as { id: number; attributes: GovernanceInstanceAttributes }[],
  timelineMilestones: [
    {
      id: 1,
      attributes: {
        year: 2007,
        title: "Fundação Conceitual e Lançamento do Paradigma",
        impactDescription: "O Instituto é estabelecido a partir da fusão de três entidades líderes. Criação da Metodologia M-IS (Modelo de Impacto Sistêmico), um algoritmo preditivo para a eficácia de projetos sociais e ambientais, marcando o nascimento do compromisso com a excelência orientada por dados."
      }
    },
    {
      id: 2,
      attributes: {
        year: 2008,
        title: "Primeiro Projeto Social Unificado",
        impactDescription: "Lançamento do 'Projeto Piloto Zero Desigualdade' em São Paulo. A metodologia M-IS é validada em campo, demonstrando uma Taxa de Retorno Social (TRS) 40% superior à média global de Instituições, provando a superioridade da abordagem."
      }
    },
    {
      id: 3,
      attributes: {
        year: 2012,
        title: "Criação do Fundo de Sustentabilidade Perpétua",
        impactDescription: "Alcance de um marco inédito de independência operacional com o Fundo F-P (Fundo Perpétuo). Assegura que 100% das doações correntes sejam direcionadas aos programas finalísticos, com custos administrativos cobertos pelo rendimento do fundo."
      }
    },
    {
      id: 4,
      attributes: {
        year: 2015,
        title: "Reconhecimento Global e Adoção do Modelo",
        impactDescription: "O Instituto recebe o prestigioso Global Excellence Award (Prêmio GEA) da ONU. A Metodologia M-IS é formalmente adotada como benchmark de eficácia por diversas agências internacionais e governamentais."
      }
    },
    {
      id: 5,
      attributes: {
        year: 2018,
        title: "Reengenharia de Governança",
        impactDescription: "Em movimento de liderança proativa, a Assembleia aprova a inclusão do Conselho Fiscal e de Auditoria Quântica (CFA), elevando o Instituto a um patamar de Prestação de Contas (Accountability) e Transparência Quântica jamais visto no Terceiro Setor."
      }
    },
    {
      id: 6,
      attributes: {
        year: 2022,
        title: "Aceleração de Líderes Regenerativos",
        impactDescription: "Investimento de 30% do capital excedente em um programa de capacitação para milhares de jovens e adultos, tornando-os novos líderes focados em soluções de impacto regenerativo em resposta à crise climática."
      }
    },
    {
      id: 7,
      attributes: {
        year: 2025,
        title: "Marco do Milhão e Agenda 2035",
        impactDescription: "Aproximação da meta estratégica de impactar diretamente mais de um milhão de vidas em projetos de transformação permanente. Lançamento da Agenda 2035, focada na mitigação de 80% das desigualdades regionais na área de atuação."
      }
    }
  ] as { id: number; attributes: TimelineMilestoneAttributes }[],
  members: [
    {
      id: 1,
      attributes: {
        name: "Dra. Helena Souza",
        role: "Presidente do CDE",
        type: "board",
        bio: "Referência global em conservação.",
        imageUrl: "https://picsum.photos/200/200?random=1"
      }
    },
    {
      id: 2,
      attributes: {
        name: "Rikardo Ribeiro",
        role: "CEO",
        type: "executive",
        bio: "Executivo premiado por Gestão e Inovação.",
        imageUrl: "https://picsum.photos/200/200?random=3"
      }
    }
  ] as { id: number; attributes: GovernanceMemberAttributes }[]
};