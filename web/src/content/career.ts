// Trajetória profissional, formação acadêmica, certificações e eventos.
// Fonte: informações fornecidas pelo autor. Nada além delas foi acrescentado.
// Datas como 'AAAA' ou 'AAAA-MM'. Nomes próprios (empresas, cursos, instituições) não são traduzidos.
import type { Localized } from '../i18n';
import type { IconName } from '../components/icons';

type L<T> = Localized<T>;

/* ------------------------------------------------------------------ */
/* Trajetória profissional (ordem cronológica inversa)                 */
/* ------------------------------------------------------------------ */
export interface Role {
  id: string;
  org: string;
  title: L<string>;
  start: string;
  end?: string;
  ongoing?: boolean;
  summary: L<string>;
  /** Observação curta exibida junto ao resumo. */
  note?: L<string>;
  duties: L<string[]>;
  skills: L<string[]>;
  /** Ferramentas (o logo aparece quando existe na biblioteca de marcas). */
  tools?: readonly string[];
}

export const ROLES: readonly Role[] = [
  {
    id: 'segunda-vitrine', org: 'Segunda Vitrine', start: '2026-11', ongoing: true,
    title: { pt: 'Cofundador e Coordenador de Projetos', en: 'Co-founder and Project Coordinator', es: 'Cofundador y Coordinador de Proyectos' },
    summary: {
      pt: 'Estruturação de uma iniciativa estudantil independente que conecta talentos acadêmicos a empresas por meio de soluções tecnológicas.',
      en: 'Setting up an independent student initiative that connects academic talent with companies through technology solutions.',
      es: 'Estructuración de una iniciativa estudiantil independiente que conecta talento académico con empresas mediante soluciones tecnológicas.',
    },
    note: {
      pt: 'Iniciativa estudantil independente, sem vínculo institucional com a FATEC.',
      en: 'Independent student initiative, with no institutional link to FATEC.',
      es: 'Iniciativa estudiantil independiente, sin vínculo institucional con FATEC.',
    },
    duties: {
      pt: ['Planejamento, organização e acompanhamento de projetos', 'Levantamento de necessidades', 'Definição de objetivos e escopo', 'Organização e distribuição de tarefas', 'Acompanhamento de prazos e entregas', 'Alinhamento entre demandas das empresas e competências da equipe', 'Organização da comunicação', 'Apoio à documentação e apresentação dos projetos', 'Articulação entre participantes e oportunidades'],
      en: ['Planning, organizing and tracking projects', 'Requirements gathering', 'Defining goals and scope', 'Organizing and distributing tasks', 'Tracking deadlines and deliverables', 'Aligning company demands with the team’s skills', 'Organizing communication', 'Supporting project documentation and presentation', 'Connecting participants and opportunities'],
      es: ['Planificación, organización y seguimiento de proyectos', 'Levantamiento de necesidades', 'Definición de objetivos y alcance', 'Organización y distribución de tareas', 'Seguimiento de plazos y entregas', 'Alineación entre demandas de las empresas y competencias del equipo', 'Organización de la comunicación', 'Apoyo a la documentación y presentación de los proyectos', 'Articulación entre participantes y oportunidades'],
    },
    skills: {
      pt: ['Gestão e coordenação de projetos', 'Planejamento', 'Liderança colaborativa', 'Comunicação', 'Organização', 'Resolução de problemas', 'Desenvolvimento de soluções tecnológicas'],
      en: ['Project management and coordination', 'Planning', 'Collaborative leadership', 'Communication', 'Organization', 'Problem solving', 'Technology solution development'],
      es: ['Gestión y coordinación de proyectos', 'Planificación', 'Liderazgo colaborativo', 'Comunicación', 'Organización', 'Resolución de problemas', 'Desarrollo de soluciones tecnológicas'],
    },
    tools: ['Trello', 'Jira', 'Discord'],
  },
  {
    id: 'contmor', org: 'Contmor Assessoria Contábil', start: '2023-08', end: '2024-07',
    title: { pt: 'Analista de Legalização', en: 'Legalization Analyst', es: 'Analista de Legalización' },
    summary: {
      pt: 'Condução autônoma do departamento de Legalização Empresarial, com reporte direto ao proprietário do escritório.',
      en: 'Autonomous management of the Business Legalization department, reporting directly to the firm’s owner.',
      es: 'Conducción autónoma del departamento de Legalización Empresarial, con reporte directo al propietario de la oficina.',
    },
    duties: {
      pt: ['Gestão das demandas de clientes', 'Atendimento e orientação', 'Abertura, alteração e encerramento de empresas', 'Análise documental', 'Investigação de situações cadastrais, societárias e tributárias', 'Consulta a bases públicas e privadas', 'Identificação de inconsistências', 'Acompanhamento de processos administrativos', 'Controle de certidões, pendências e prazos', 'Organização e análise de informações em planilhas', 'Elaboração de relatórios gerenciais', 'Identificação de oportunidades de melhoria', 'Resolução de problemas complexos'],
      en: ['Client demand management', 'Client service and guidance', 'Company incorporation, amendment and dissolution', 'Document analysis', 'Investigation of registry, corporate and tax situations', 'Research in public and private databases', 'Identifying inconsistencies', 'Tracking administrative proceedings', 'Control of certificates, pending items and deadlines', 'Organizing and analyzing information in spreadsheets', 'Preparing management reports', 'Identifying improvement opportunities', 'Solving complex problems'],
      es: ['Gestión de las demandas de clientes', 'Atención y orientación', 'Apertura, modificación y cierre de empresas', 'Análisis documental', 'Investigación de situaciones registrales, societarias y tributarias', 'Consulta a bases públicas y privadas', 'Identificación de inconsistencias', 'Seguimiento de procesos administrativos', 'Control de certificados, pendientes y plazos', 'Organización y análisis de información en hojas de cálculo', 'Elaboración de informes gerenciales', 'Identificación de oportunidades de mejora', 'Resolución de problemas complejos'],
    },
    skills: {
      pt: ['Análise de dados', 'Validação de informações', 'Gestão de processos', 'Autonomia', 'Organização', 'Resolução de problemas', 'Controles e indicadores'],
      en: ['Data analysis', 'Information validation', 'Process management', 'Autonomy', 'Organization', 'Problem solving', 'Controls and indicators'],
      es: ['Análisis de datos', 'Validación de información', 'Gestión de procesos', 'Autonomía', 'Organización', 'Resolución de problemas', 'Controles e indicadores'],
    },
    tools: ['Excel', 'Power BI'],
  },
  {
    id: 'conube', org: 'Conube', start: '2022-05', end: '2023-02',
    title: { pt: 'Consultor de Legalização', en: 'Legalization Consultant', es: 'Consultor de Legalización' },
    summary: {
      pt: 'Atuação consultiva em Legalização Empresarial, atendendo clientes em diferentes etapas de formalização, alteração, regularização e encerramento de empresas.',
      en: 'Consulting work in Business Legalization, serving clients at different stages of company formalization, amendment, regularization and dissolution.',
      es: 'Actuación consultiva en Legalización Empresarial, atendiendo a clientes en distintas etapas de formalización, modificación, regularización y cierre de empresas.',
    },
    duties: {
      pt: ['Análise de faturamento', 'Análise de quadro de funcionários', 'Análise de atividades econômicas', 'Análise de informações tributárias', 'Avaliação de CNAEs, códigos de ISS e ICMS e alíquotas', 'Orientação sobre estruturas jurídicas e societárias', 'Condução de casos complexos', 'Análise de inconsistências', 'Acompanhamento de processos', 'Organização documental', 'Controle de pendências e prazos', 'Utilização de plataformas internas', 'Consolidação e análise de informações em Excel', 'Colaboração com equipes de Legalização e Fiscal'],
      en: ['Revenue analysis', 'Headcount analysis', 'Economic activity analysis', 'Tax information analysis', 'Assessment of CNAEs, ISS and ICMS codes and tax rates', 'Guidance on legal and corporate structures', 'Handling complex cases', 'Inconsistency analysis', 'Process tracking', 'Document organization', 'Control of pending items and deadlines', 'Use of internal platforms', 'Consolidating and analyzing information in Excel', 'Collaboration with Legalization and Tax teams'],
      es: ['Análisis de facturación', 'Análisis de plantilla de empleados', 'Análisis de actividades económicas', 'Análisis de información tributaria', 'Evaluación de CNAEs, códigos de ISS e ICMS y alícuotas', 'Orientación sobre estructuras jurídicas y societarias', 'Conducción de casos complejos', 'Análisis de inconsistencias', 'Seguimiento de procesos', 'Organización documental', 'Control de pendientes y plazos', 'Uso de plataformas internas', 'Consolidación y análisis de información en Excel', 'Colaboración con equipos de Legalización y Fiscal'],
    },
    skills: {
      pt: ['Análise de dados', 'Investigação', 'Organização de informações', 'Comunicação', 'Trabalho em equipe', 'Resolução de problemas', 'Análise de regras de negócio'],
      en: ['Data analysis', 'Investigation', 'Information organization', 'Communication', 'Teamwork', 'Problem solving', 'Business rules analysis'],
      es: ['Análisis de datos', 'Investigación', 'Organización de información', 'Comunicación', 'Trabajo en equipo', 'Resolución de problemas', 'Análisis de reglas de negocio'],
    },
    tools: ['Excel', 'Power BI'],
  },
  {
    id: 'contamac', org: 'Contamac Consultoria Contábil', start: '2017-09', end: '2019-11',
    title: { pt: 'Assistente de Legalização', en: 'Legalization Assistant', es: 'Asistente de Legalización' },
    summary: {
      pt: 'Apoio às rotinas de Legalização Empresarial, com diligências em órgãos públicos, controle de prazos e atendimento a clientes.',
      en: 'Support to Business Legalization routines, with visits to public agencies, deadline control and client service.',
      es: 'Apoyo a las rutinas de Legalización Empresarial, con diligencias en organismos públicos, control de plazos y atención a clientes.',
    },
    duties: {
      pt: ['Diligências externas em órgãos públicos', 'Protocolo, acompanhamento e retirada de documentos', 'Abertura, alteração e regularização de empresas', 'Conferência de documentos', 'Consulta a registros e certidões', 'Organização de documentos societários e cadastrais', 'Acompanhamento de processos administrativos', 'Controle de prazos', 'Atendimento a clientes', 'Organização de controles em Excel'],
      en: ['Field visits to public agencies', 'Filing, tracking and collecting documents', 'Company incorporation, amendment and regularization', 'Document checking', 'Research in records and certificates', 'Organizing corporate and registry documents', 'Tracking administrative proceedings', 'Deadline control', 'Client service', 'Organizing controls in Excel'],
      es: ['Diligencias externas en organismos públicos', 'Presentación, seguimiento y retiro de documentos', 'Apertura, modificación y regularización de empresas', 'Verificación de documentos', 'Consulta a registros y certificados', 'Organización de documentos societarios y registrales', 'Seguimiento de procesos administrativos', 'Control de plazos', 'Atención a clientes', 'Organización de controles en Excel'],
    },
    skills: {
      pt: ['Organização', 'Atenção aos detalhes', 'Comunicação', 'Gestão de processos', 'Documentação', 'Trabalho em equipe'],
      en: ['Organization', 'Attention to detail', 'Communication', 'Process management', 'Documentation', 'Teamwork'],
      es: ['Organización', 'Atención a los detalles', 'Comunicación', 'Gestión de procesos', 'Documentación', 'Trabajo en equipo'],
    },
    tools: ['Excel'],
  },
];

export interface EarlyRole {
  id: string;
  org: string;
  title: L<string>;
  start: string;
  end: string;
}

/** Primeiras experiências (ordem cronológica inversa), em bloco expansível. */
export const EARLY_ROLES: readonly EarlyRole[] = [
  { id: 'ecar', org: 'Ecar Fleet', start: '2017-03', end: '2017-08', title: { pt: 'Auxiliar de Legalização', en: 'Legalization Aide', es: 'Auxiliar de Legalización' } },
  { id: 'agl', org: 'AGL Produtos e Serviços', start: '2016-04', end: '2017-02', title: { pt: 'Assistente de Legalização', en: 'Legalization Assistant', es: 'Asistente de Legalización' } },
  { id: 'espelha', org: 'Espelha Conta', start: '2014-03', end: '2016-01', title: { pt: 'Auxiliar de Legalização', en: 'Legalization Aide', es: 'Auxiliar de Legalización' } },
  { id: 'olamar-fiscal', org: 'Olamar Serviços de Escritório', start: '2013-04', end: '2013-08', title: { pt: 'Auxiliar de Escrita Fiscal', en: 'Tax Bookkeeping Aide', es: 'Auxiliar de Contabilidad Fiscal' } },
  { id: 'olamar-msg', org: 'Olamar Serviços de Escritório', start: '2012-04', end: '2013-04', title: { pt: 'Mensageiro', en: 'Office Messenger', es: 'Mensajero' } },
];

/* ------------------------------------------------------------------ */
/* Formação acadêmica                                                  */
/* ------------------------------------------------------------------ */
export interface AreaTile {
  id: string;
  /** Símbolo tipográfico (se não houver, usa `icon`). */
  glyph?: string;
  icon?: IconName;
  title: L<string>;
  topics: L<string[]>;
}

export const FATEC_AREAS: readonly AreaTile[] = [
  { id: 'dev', glyph: '⌘', title: { pt: 'Desenvolvimento de Software', en: 'Software Development', es: 'Desarrollo de Software' },
    topics: { pt: ['Lógica', 'Algoritmos', 'Estruturas de dados', 'Web', 'Desktop', 'Mobile'], en: ['Logic', 'Algorithms', 'Data structures', 'Web', 'Desktop', 'Mobile'], es: ['Lógica', 'Algoritmos', 'Estructuras de datos', 'Web', 'Desktop', 'Mobile'] } },
  { id: 'eng', glyph: '⚙', title: { pt: 'Engenharia de Software', en: 'Software Engineering', es: 'Ingeniería de Software' },
    topics: { pt: ['Requisitos', 'Modelagem', 'Arquitetura', 'Testes', 'Qualidade', 'Metodologias ágeis'], en: ['Requirements', 'Modeling', 'Architecture', 'Testing', 'Quality', 'Agile methods'], es: ['Requisitos', 'Modelado', 'Arquitectura', 'Pruebas', 'Calidad', 'Metodologías ágiles'] } },
  { id: 'db', glyph: '▤', title: { pt: 'Dados e Banco de Dados', en: 'Data and Databases', es: 'Datos y Bases de Datos' },
    topics: { pt: ['SQL', 'Relacionais e NoSQL', 'MySQL', 'PostgreSQL', 'MongoDB'], en: ['SQL', 'Relational and NoSQL', 'MySQL', 'PostgreSQL', 'MongoDB'], es: ['SQL', 'Relacionales y NoSQL', 'MySQL', 'PostgreSQL', 'MongoDB'] } },
  { id: 'bi', icon: 'chart', title: { pt: 'Dados e Business Intelligence', en: 'Data and Business Intelligence', es: 'Datos y Business Intelligence' },
    topics: { pt: ['Análise de dados', 'Indicadores', 'Visualização', 'Power BI', 'Excel'], en: ['Data analysis', 'Indicators', 'Visualization', 'Power BI', 'Excel'], es: ['Análisis de datos', 'Indicadores', 'Visualización', 'Power BI', 'Excel'] } },
  { id: 'math', glyph: '∑', title: { pt: 'Matemática e Estatística', en: 'Mathematics and Statistics', es: 'Matemática y Estadística' },
    topics: { pt: ['Matemática para Computação', 'Álgebra Linear', 'Probabilidade', 'Estatística Aplicada'], en: ['Math for Computing', 'Linear Algebra', 'Probability', 'Applied Statistics'], es: ['Matemática para Computación', 'Álgebra Lineal', 'Probabilidad', 'Estadística Aplicada'] } },
  { id: 'ai', glyph: '✧', title: { pt: 'Inteligência Artificial', en: 'Artificial Intelligence', es: 'Inteligencia Artificial' },
    topics: { pt: ['Fundamentos de IA', 'Aprendizagem de Máquina', 'Mineração de Dados', 'Processamento de Linguagem Natural'], en: ['AI fundamentals', 'Machine Learning', 'Data Mining', 'Natural Language Processing'], es: ['Fundamentos de IA', 'Aprendizaje Automático', 'Minería de Datos', 'Procesamiento de Lenguaje Natural'] } },
  { id: 'infra', glyph: '☁', title: { pt: 'Infraestrutura e Tecnologia', en: 'Infrastructure and Technology', es: 'Infraestructura y Tecnología' },
    topics: { pt: ['Sistemas operacionais', 'Redes', 'Nuvem', 'Segurança', 'DevOps', 'Internet das Coisas'], en: ['Operating systems', 'Networking', 'Cloud', 'Security', 'DevOps', 'Internet of Things'], es: ['Sistemas operativos', 'Redes', 'Nube', 'Seguridad', 'DevOps', 'Internet de las Cosas'] } },
];

/* ------------------------------------------------------------------ */
/* Certificações e aprendizado complementar                            */
/* ------------------------------------------------------------------ */
export type CertCategory = 'data' | 'ai' | 'programming' | 'career';

export interface Certificate {
  id: string;
  category: CertCategory;
  /** Instituição (nome próprio). */
  org: string;
  /** Nome do curso (nome próprio, não traduzido). */
  title: string;
  /** Plataforma ou parceiro (ex.: DIO / Universia). */
  via?: string;
  date: string;
  hours?: number;
  summary: L<string>;
  topics?: L<string[]>;
  credential?: string;
  link?: { href: string; label: L<string> };
}

export const CERTIFICATES: readonly Certificate[] = [
  {
    id: 'santander-powerbi', category: 'data', org: 'Santander', via: 'DIO / Universia', date: '2026-10', hours: 47,
    title: 'Bootcamp Primeiros Passos em Power BI',
    summary: { pt: 'Bootcamp de Power BI com projeto prático.', en: 'Power BI bootcamp with a hands-on project.', es: 'Bootcamp de Power BI con proyecto práctico.' },
    topics: {
      pt: ['Power BI', 'Power Query', 'DAX', 'SQL', 'MySQL', 'ETL', 'Modelagem Star Schema', 'Dashboards', 'KPIs', 'Relatórios gerenciais', 'Projeto prático', 'IA generativa como apoio às análises', 'Introdução a Machine Learning', 'LLMs', 'Microsoft Azure'],
      en: ['Power BI', 'Power Query', 'DAX', 'SQL', 'MySQL', 'ETL', 'Star Schema modeling', 'Dashboards', 'KPIs', 'Management reports', 'Hands-on project', 'Generative AI to support analysis', 'Intro to Machine Learning', 'LLMs', 'Microsoft Azure'],
      es: ['Power BI', 'Power Query', 'DAX', 'SQL', 'MySQL', 'ETL', 'Modelado Star Schema', 'Dashboards', 'KPIs', 'Informes gerenciales', 'Proyecto práctico', 'IA generativa como apoyo al análisis', 'Introducción a Machine Learning', 'LLMs', 'Microsoft Azure'],
    },
    credential: 'H5OJ3PSR',
    link: { href: 'https://github.com/maxgodoydev/Business-Intelligence-portfolio', label: { pt: 'Portfólio de BI', en: 'BI portfolio', es: 'Portafolio de BI' } },
  },
  {
    id: 'google-foundations', category: 'data', org: 'Google', date: '2026-07', hours: 12,
    title: 'Foundations: Data, Data, Everywhere',
    summary: { pt: 'Ciclo de análise de dados, limpeza, validação e decisões baseadas em dados.', en: 'Data analysis lifecycle, cleaning, validation and data-driven decisions.', es: 'Ciclo de análisis de datos, limpieza, validación y decisiones basadas en datos.' },
    credential: 'H0S85DC36IJM',
  },
  {
    id: 'udemy-sql', category: 'data', org: 'Udemy', date: '2026-06', hours: 6,
    title: 'SQL para Análise de Dados: Do básico ao avançado',
    summary: { pt: 'SQL, consultas, JOINs, agregações e modelagem relacional.', en: 'SQL, queries, JOINs, aggregations and relational modeling.', es: 'SQL, consultas, JOINs, agregaciones y modelado relacional.' },
  },
  {
    id: 'udemy-dados-zero', category: 'data', org: 'Udemy', date: '2026-06', hours: 7.5,
    title: 'Dados do Zero: Excel, SQL, Python e AWS com Projetos Reais',
    summary: { pt: 'Excel, SQL, Python, AWS, tratamento de dados, ETL e dashboards.', en: 'Excel, SQL, Python, AWS, data cleaning, ETL and dashboards.', es: 'Excel, SQL, Python, AWS, tratamiento de datos, ETL y dashboards.' },
  },
  {
    id: 'google-gemini', category: 'ai', org: 'Google', date: '2026-09', hours: 2,
    title: 'Capacita+: Construa com o Gemini',
    summary: { pt: 'Google Gemini, IA generativa, engenharia de prompts e assistentes virtuais.', en: 'Google Gemini, generative AI, prompt engineering and virtual assistants.', es: 'Google Gemini, IA generativa, ingeniería de prompts y asistentes virtuales.' },
  },
  {
    id: 'cisco-python', category: 'programming', org: 'Cisco Networking Academy', date: '2025-04', hours: 30,
    title: 'Python Essentials 1',
    summary: { pt: 'Lógica de programação, algoritmos, estruturas de controle e funções em Python.', en: 'Programming logic, algorithms, control structures and functions in Python.', es: 'Lógica de programación, algoritmos, estructuras de control y funciones en Python.' },
  },
  {
    id: 'efset', category: 'career', org: 'EF SET', date: '2026-09',
    title: 'EF SET English Certificate',
    summary: { pt: 'Inglês intermediário (B1). Pontuação 49/100.', en: 'Intermediate English (B1). Score 49/100.', es: 'Inglés intermedio (B1). Puntuación 49/100.' },
  },
];

export const CERT_CATEGORY_ORDER: readonly CertCategory[] = ['data', 'ai', 'programming', 'career'];

/** Formação complementar anterior (bloco expansível). */
export const PREVIOUS_COURSES: readonly Certificate[] = [
  {
    id: 'senai-excel', category: 'career', org: 'SENAI', date: '2015-09', hours: 40, title: 'Excel Básico',
    summary: {
      pt: 'Planilhas, fórmulas, funções e organização de dados. Base desenvolvida depois em controles profissionais, tabelas dinâmicas e funções de Excel.',
      en: 'Spreadsheets, formulas, functions and data organization. A foundation later developed into professional controls, pivot tables and Excel functions.',
      es: 'Hojas de cálculo, fórmulas, funciones y organización de datos. Base desarrollada después en controles profesionales, tablas dinámicas y funciones de Excel.',
    },
  },
  {
    id: 'senai-admin', category: 'career', org: 'SENAI', date: '2015-12', hours: 160, title: 'Auxiliar Administrativo',
    summary: {
      pt: 'Rotinas administrativas, organização de informações, documentos, atendimento e visão sistêmica.',
      en: 'Administrative routines, information organization, documents, client service and systems thinking.',
      es: 'Rutinas administrativas, organización de información, documentos, atención al cliente y visión sistémica.',
    },
  },
];

/** Palestras da Semana de Tecnologia da FATEC (ordem cronológica inversa). */
export interface TalkEvent {
  id: string;
  /** Data completa AAAA-MM-DD. */
  date: string;
  title: string;
  hours: number;
  summary: L<string>;
}

export const TALKS: readonly TalkEvent[] = [
  { id: 'carreira-ti', date: '2025-11-19', hours: 2, title: 'Projetando uma carreira em TI',
    summary: { pt: 'Planejamento de carreira, mercado de tecnologia e áreas de Dados, Analytics e Automação.', en: 'Career planning, the technology market and the Data, Analytics and Automation fields.', es: 'Planificación de carrera, mercado de tecnología y áreas de Datos, Analytics y Automatización.' } },
  { id: 'futuria', date: '2025-11-18', hours: 2, title: 'FuturIA: Casos de uso: IA nos Negócios',
    summary: { pt: 'Automação inteligente e análise de dados aplicada a negócios.', en: 'Intelligent automation and data analysis applied to business.', es: 'Automatización inteligente y análisis de datos aplicado a negocios.' } },
  { id: 'qualidade', date: '2025-11-17', hours: 2, title: 'Introdução à Qualidade de Software',
    summary: { pt: 'Testes, prevenção de falhas, qualidade e padronização de processos.', en: 'Testing, failure prevention, quality and process standardization.', es: 'Pruebas, prevención de fallos, calidad y estandarización de procesos.' } },
];
