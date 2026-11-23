// Linha do tempo. Somente os itens informados pelo autor; datas como AAAA ou AAAA-MM.
import type { Localized } from '../i18n';

export type JourneyKind = 'work' | 'education' | 'course' | 'milestone' | 'project';

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
    id: 'contamar', kind: 'work', start: '2017-09', end: '2019-11', org: 'Contamar',
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
  },
  {
    id: 'fatec-tech-week', kind: 'milestone', start: '2025-11', org: 'FATEC',
    title: { pt: 'Participação na Semana de Tecnologia da FATEC', en: 'Took part in the FATEC Technology Week', es: 'Participación en la Semana de Tecnología de la FATEC' },
  },
  {
    id: 'sql-course', kind: 'course', start: '2026-06',
    title: { pt: 'SQL para Análise de Dados e Dados do Zero', en: 'SQL for Data Analysis and Data from Scratch', es: 'SQL para Análisis de Datos y Datos desde Cero' },
  },
  {
    id: 'google-foundations', kind: 'course', start: '2026-07',
    title: { pt: 'Google Foundations: Data, Data Everywhere', en: 'Google Foundations: Data, Data Everywhere', es: 'Google Foundations: Data, Data Everywhere' },
  },
  {
    id: 'powerbi-dio', kind: 'course', start: '2026-10', org: 'Universia / DIO',
    title: { pt: 'Formação em Power BI (47 horas)', en: 'Power BI training (47 hours)', es: 'Formación en Power BI (47 horas)' },
  },
  {
    id: 'segunda-vitrine', kind: 'project', start: '2026-11', ongoing: true, org: 'Segunda Vitrine',
    title: { pt: 'Cofundador e Coordenador de Projetos', en: 'Co-founder and Project Coordinator', es: 'Cofundador y Coordinador de Proyectos' },
    text: {
      pt: 'Iniciativa independente de estudantes que conecta talentos estudantis a empresas e negócios reais por meio de soluções tecnológicas. Idealização, criação do nome e coordenação dos projetos.',
      en: 'Independent student initiative that connects student talent with companies and real businesses through technology solutions. Concept, name creation and project coordination.',
      es: 'Iniciativa independiente de estudiantes que conecta el talento estudiantil con empresas y negocios reales mediante soluciones tecnológicas. Ideación, creación del nombre y coordinación de los proyectos.',
    },
  },
  {
    id: 'dsm-end', kind: 'education', start: '2028-12', planned: true, org: 'FATEC Zona Sul',
    title: { pt: 'Previsão de conclusão da graduação', en: 'Expected degree completion', es: 'Finalización prevista de la carrera' },
  },
];
