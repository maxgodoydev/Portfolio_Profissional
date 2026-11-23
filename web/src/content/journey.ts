// Linha do tempo. Somente os itens informados pelo autor; datas como AAAA ou AAAA-MM.
import type { Localized } from '../i18n';
import type { IconName } from '../components/icons';

export type JourneyKind = 'work' | 'education' | 'course' | 'milestone' | 'project' | 'event';

export interface JourneyEntry {
  id: string;
  kind: JourneyKind;
  start: string;
  end?: string;
  /** Em andamento (usa "atual" no período e o selo "Em andamento"). */
  ongoing?: boolean;
  /** Data futura (usa o selo "Previsto"). */
  planned?: boolean;
  title: Localized<string>;
  /** Organização/instituição (nome próprio, sem tradução). */
  org?: string;
  text?: Localized<string>;
  /** Tecnologias confirmadas para este item (nomes dos ícones de marca). */
  techs?: readonly string[];
}

export const JOURNEY: readonly JourneyEntry[] = [
  {
    id: 'start-2014', kind: 'work', start: '2014',
    title: { pt: 'Início na Legalização Empresarial', en: 'Start in Business Legalization', es: 'Inicio en Legalización Empresarial' },
    text: {
      pt: 'Começo da trajetória profissional, com atuação em constituição, alteração, encerramento e regularização de empresas.',
      en: 'Start of the professional career, working on company incorporation, amendment, dissolution and regularization.',
      es: 'Inicio de la trayectoria profesional, con actuación en constitución, modificación, cierre y regularización de empresas.',
    },
  },
  {
    id: 'contamar', kind: 'work', start: '2017-09', end: '2019-11', org: 'Contamac Consultoria Contábil',
    title: { pt: 'Assistente de Legalização', en: 'Legalization Assistant', es: 'Asistente de Legalización' },
  },
  {
    id: 'conube', kind: 'work', start: '2022-05', end: '2023-02', org: 'Conube',
    title: { pt: 'Consultor de Legalização', en: 'Legalization Consultant', es: 'Consultor de Legalización' },
  },
  {
    id: 'contmor', kind: 'work', start: '2023-08', end: '2024-07', org: 'Contmor',
    title: { pt: 'Analista Paralegal', en: 'Paralegal Analyst', es: 'Analista Paralegal' },
  },
  {
    id: 'transition', kind: 'milestone', start: '2024-07',
    title: { pt: 'Início da transição de carreira para tecnologia', en: 'Start of the career transition into technology', es: 'Inicio de la transición de carrera hacia la tecnología' },
  },
  {
    id: 'fatec-approval', kind: 'milestone', start: '2025-01', org: 'FATEC',
    title: { pt: 'Aprovação na FATEC, em primeira chamada', en: 'Admitted to FATEC in the first call', es: 'Aprobación en FATEC, en primera convocatoria' },
  },
  {
    id: 'dsm', kind: 'education', start: '2025-02', ongoing: true, org: 'FATEC Zona Sul',
    title: { pt: 'Início da graduação em Desenvolvimento de Software Multiplataforma', en: 'Started the degree in Multiplatform Software Development', es: 'Inicio de la carrera en Desarrollo de Software Multiplataforma' },
  },
  {
    id: 'cisco-python', kind: 'course', start: '2025-04',
    title: { pt: 'Cisco Python Essentials 1', en: 'Cisco Python Essentials 1', es: 'Cisco Python Essentials 1' },
    techs: ['Python'],
  },
  {
    id: 'fatec-tech-week', kind: 'event', start: '2025-11', org: 'FATEC',
    title: { pt: 'Participação na Semana de Tecnologia da FATEC', en: 'Took part in the FATEC Technology Week', es: 'Participación en la Semana de Tecnología de la FATEC' },
  },
  {
    id: 'sql-course', kind: 'course', start: '2026-06',
    title: { pt: 'SQL para Análise de Dados e Dados do Zero', en: 'SQL for Data Analysis and Data from Scratch', es: 'SQL para Análisis de Datos y Datos desde Cero' },
    techs: ['SQL'],
  },
  {
    id: 'google-foundations', kind: 'course', start: '2026-07',
    title: { pt: 'Google Foundations: Data, Data Everywhere', en: 'Google Foundations: Data, Data Everywhere', es: 'Google Foundations: Data, Data Everywhere' },
  },
  {
    id: 'powerbi-dio', kind: 'course', start: '2026-10', org: 'Universia / DIO',
    title: { pt: 'Formação em Power BI (47 horas)', en: 'Power BI training (47 hours)', es: 'Formación en Power BI (47 horas)' },
    techs: ['Power BI'],
  },
  {
    id: 'segunda-vitrine', kind: 'work', start: '2026-11', ongoing: true, org: 'Segunda Vitrine',
    title: { pt: 'Cofundador e Coordenador de Projetos', en: 'Co-founder and Project Coordinator', es: 'Cofundador y Coordinador de Proyectos' },
    text: {
      pt: 'Iniciativa independente de estudantes que conecta talentos estudantis a empresas e negócios reais por meio de soluções tecnológicas. Idealização, criação do nome e coordenação dos projetos.',
      en: 'Independent student initiative that connects student talent with companies and real businesses through technology solutions. Concept, name creation and project coordination.',
      es: 'Iniciativa independiente de estudiantes que conecta el talento estudiantil con empresas y negocios reales mediante soluciones tecnológicas. Ideación, creación del nombre y coordinación de los proyectos.',
    },
    techs: ['Java', 'Spring Boot', 'PostgreSQL', 'GitHub', 'Vercel'],
  },
  {
    id: 'dsm-end', kind: 'education', start: '2028-12', planned: true, org: 'FATEC Zona Sul',
    title: { pt: 'Previsão de conclusão da graduação', en: 'Expected degree completion', es: 'Finalización prevista de la carrera' },
  },
];

/** Bloco pequeno do resumo final: símbolo + habilidade ou tema. */
export interface SummaryBlock {
  icon: IconName;
  label: Localized<string>;
}

/** Resumo da trajetória (somente o que já consta nas outras páginas e nos itens acima). */
export const JOURNEY_SUMMARY: { work: readonly SummaryBlock[]; courses: readonly SummaryBlock[]; education: readonly SummaryBlock[] } = {
  work: [
    { icon: 'folder', label: { pt: 'Constituição, alteração e encerramento de empresas', en: 'Company incorporation, amendment and dissolution', es: 'Constitución, modificación y cierre de empresas' } },
    { icon: 'check', label: { pt: 'Validação de informações e regularização de cadastros', en: 'Information validation and registry regularization', es: 'Validación de información y regularización de registros' } },
    { icon: 'route', label: { pt: 'Acompanhamento de processos e prazos', en: 'Process and deadline tracking', es: 'Seguimiento de procesos y plazos' } },
    { icon: 'users', label: { pt: 'Liderança e coordenação de projetos (Segunda Vitrine)', en: 'Leadership and project coordination (Segunda Vitrine)', es: 'Liderazgo y coordinación de proyectos (Segunda Vitrine)' } },
    { icon: 'target', label: { pt: 'Levantamento de necessidades e distribuição de tarefas', en: 'Requirements gathering and task distribution', es: 'Levantamiento de necesidades y distribución de tareas' } },
    { icon: 'file', label: { pt: 'Documentação e apresentação de projetos', en: 'Project documentation and presentation', es: 'Documentación y presentación de proyectos' } },
  ],
  courses: [
    { icon: 'code', label: { pt: 'Python (Cisco Python Essentials 1)', en: 'Python (Cisco Python Essentials 1)', es: 'Python (Cisco Python Essentials 1)' } },
    { icon: 'layers', label: { pt: 'SQL para análise de dados', en: 'SQL for data analysis', es: 'SQL para análisis de datos' } },
    { icon: 'chart', label: { pt: 'Fundamentos de dados (Google Foundations)', en: 'Data foundations (Google Foundations)', es: 'Fundamentos de datos (Google Foundations)' } },
    { icon: 'chart', label: { pt: 'Power BI (formação de 47 horas)', en: 'Power BI (47-hour training)', es: 'Power BI (formación de 47 horas)' } },
    { icon: 'users', label: { pt: 'Semana de Tecnologia da FATEC', en: 'FATEC Technology Week', es: 'Semana de Tecnología de la FATEC' } },
  ],
  education: [
    { icon: 'code', label: { pt: 'Desenvolvimento de software multiplataforma', en: 'Multiplatform software development', es: 'Desarrollo de software multiplataforma' } },
    { icon: 'chart', label: { pt: 'Dados & Analytics', en: 'Data & Analytics', es: 'Datos y Analytics' } },
    { icon: 'layers', label: { pt: 'Business Intelligence', en: 'Business Intelligence', es: 'Business Intelligence' } },
    { icon: 'wrench', label: { pt: 'Automação de processos', en: 'Process automation', es: 'Automatización de procesos' } },
  ],
};

/** Formação em andamento (resumo): nome e período. */
export const EDUCATION_SUMMARY = {
  name: { pt: 'Tecnólogo em Desenvolvimento de Software Multiplataforma', en: 'Technologist degree in Multiplatform Software Development', es: 'Tecnólogo en Desarrollo de Software Multiplataforma' } as Localized<string>,
  place: 'FATEC Zona Sul',
  start: '2025-02',
  end: '2028-12',
};
