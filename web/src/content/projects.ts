// Projetos do portfólio: fatos neutros de idioma + resumos (cards) nos três idiomas.
// O detalhe de cada projeto (contexto, solução, participação) fica em projectDetails.ts.
import type { Localized } from '../i18n';

export type ProjectCategory = 'development' | 'data' | 'bi' | 'automation' | 'academic';
export type ProjectKind = 'client' | 'academic' | 'study' | 'initiative';

export interface Project {
  slug: string;
  categories: readonly ProjectCategory[];
  /** Tipo conforme informado pelo autor; ausente quando não confirmado. */
  kind?: ProjectKind;
  featured?: boolean;
  /** Somente tecnologias confirmadas para o projeto. */
  tags: readonly string[];
  repo: string;
  demo?: string;
  site?: string;
  /** Foto opcional exibida na página do projeto (arquivo em web/public/projects). */
  image?: { src: string; width: number; height: number; alt: Localized<string>; caption: Localized<string> };
  /** Criação (AAAA-MM), quando confirmada. */
  created?: string;
  title: string;
  summary: Localized<string>;
}

export const PROJECTS: readonly Project[] = [
  {
    slug: 'barbershop-do-gui',
    categories: ['development', 'automation', 'bi'],
    kind: 'client',
    featured: true,
    tags: ['Java 21', 'Spring Boot', 'Spring Security', 'PostgreSQL', 'Supabase', 'Maven'],
    repo: 'https://github.com/maxgodoydev/BarberShop-Do-Gui',
    demo: 'https://barbershop-do-gui.onrender.com/servicos.html',
    title: 'BarberShop do Gui',
    summary: {
      pt: 'Sistema para uma barbearia real da Zona Sul de São Paulo: agendamentos, perfis de proprietário, recepção e profissional, funções administrativas e indicadores de BI.',
      en: 'System for a real barbershop in the South Zone of São Paulo: appointments, owner, front-desk and professional profiles, admin features and BI indicators.',
      es: 'Sistema para una barbería real de la Zona Sur de São Paulo: agendamientos, perfiles de propietario, recepción y profesional, funciones administrativas e indicadores de BI.',
    },
  },
  {
    slug: 'banking-analytics',
    categories: ['data'],
    featured: true,
    tags: ['Python', 'SQL', 'SQLite', 'Pandas', 'Matplotlib', 'Pytest'],
    repo: 'https://github.com/maxgodoydev/Banking-analytics',
    title: 'Banking Analytics',
    summary: {
      pt: 'Análise de transações bancárias sintéticas com Python, SQL e SQLite: cinco perguntas de negócio respondidas com CTEs, funções de janela e testes automatizados.',
      en: 'Analysis of synthetic banking transactions with Python, SQL and SQLite: five business questions answered with CTEs, window functions and automated tests.',
      es: 'Análisis de transacciones bancarias sintéticas con Python, SQL y SQLite: cinco preguntas de negocio resueltas con CTE, funciones de ventana y pruebas automatizadas.',
    },
  },
  {
    slug: 'power-bi-portfolio',
    categories: ['bi', 'academic'],
    kind: 'academic',
    featured: true,
    tags: ['Power BI', 'DAX', 'Power Query', 'SQL'],
    repo: 'https://github.com/maxgodoydev/Business-Intelligence-portfolio',
    title: 'Portfólio de Power BI',
    summary: {
      pt: 'Projetos acadêmicos e estudos de Business Intelligence: dashboards, indicadores operacionais e apoio à tomada de decisão.',
      en: 'Academic projects and Business Intelligence studies: dashboards, operational indicators and decision support.',
      es: 'Proyectos académicos y estudios de Business Intelligence: dashboards, indicadores operativos y apoyo a la toma de decisiones.',
    },
  },
  {
    slug: 'studio-patty-leao',
    categories: ['development', 'automation'],
    tags: ['Node.js', 'Express', 'EJS', 'MongoDB Atlas'],
    repo: 'https://github.com/maxgodoydev/Studio_Patty_Leao',
    demo: 'https://studio-patty-leao.onrender.com',
    title: 'Studio Patty Leão',
    summary: {
      pt: 'ERP simplificado para salão de beleza: agendamentos, estoque, controle financeiro manual, vitrine de agendamento e indicadores.',
      en: 'Simplified ERP for a beauty salon: appointments, inventory, manual financial control, a booking storefront and indicators.',
      es: 'ERP simplificado para un salón de belleza: agendamientos, inventario, control financiero manual, vitrina de reservas e indicadores.',
    },
  },
  {
    slug: 'entrelacos',
    categories: ['development'],
    tags: ['HTML', 'CSS', 'JavaScript', 'JSON'],
    repo: 'https://github.com/maxgodoydev/Entrelacos',
    demo: 'https://entrelacos-vitrine.vercel.app',
    title: 'EntreLaços',
    summary: {
      pt: 'Catálogo digital responsivo com filtros dinâmicos e integração com WhatsApp.',
      en: 'Responsive digital catalog with dynamic filters and WhatsApp integration.',
      es: 'Catálogo digital responsivo con filtros dinámicos e integración con WhatsApp.',
    },
  },
  {
    slug: 'python-studies',
    categories: ['data'],
    kind: 'study',
    tags: ['Python', 'NumPy', 'Pandas', 'SQL'],
    repo: 'https://github.com/maxgodoydev/python-lab',
    title: 'Estudos em Python',
    summary: {
      pt: 'Estudos de lógica de programação, análise de dados e estatística com Python, NumPy, Pandas e SQL.',
      en: 'Studies in programming logic, data analysis and statistics with Python, NumPy, Pandas and SQL.',
      es: 'Estudios de lógica de programación, análisis de datos y estadística con Python, NumPy, Pandas y SQL.',
    },
  },
  {
    slug: 'intelibolsas',
    categories: ['development', 'academic'],
    kind: 'academic',
    tags: ['PHP', 'MySQL'],
    repo: 'https://github.com/maxgodoydev/InteliBolsas',
    title: 'InteliBolsas',
    summary: {
      pt: 'Aplicação web (CRUD) para divulgação de bolsas de estudo e cursos, com áreas para aluno, instituição e administração.',
      en: 'Web application (CRUD) to publish scholarships and courses, with areas for students, institutions and administration.',
      es: 'Aplicación web (CRUD) para difundir becas de estudio y cursos, con áreas para alumno, institución y administración.',
    },
  },
  {
    slug: 'segunda-vitrine',
    categories: ['development'],
    kind: 'initiative',
    tags: [],
    repo: 'https://github.com/Luck16Ash/Segunda-Vitrine',
    site: 'https://segunda-vitrine.vercel.app',
    created: '2026-11',
    image: {
      src: '/projects/segunda-vitrine-equipe.jpg',
      width: 1200,
      height: 886,
      alt: {
        pt: 'Selfie de cinco integrantes da Segunda Vitrine, sorrindo, em um laboratório de informática.',
        en: 'Selfie of five Segunda Vitrine members smiling in a computer lab.',
        es: 'Selfie de cinco integrantes de Segunda Vitrine sonriendo en un laboratorio de informática.',
      },
      caption: { pt: 'Integrantes da Segunda Vitrine.', en: 'Members of Segunda Vitrine.', es: 'Integrantes de Segunda Vitrine.' },
    },
    title: 'Segunda Vitrine',
    summary: {
      pt: 'Iniciativa independente de estudantes de DSM que conecta talentos estudantis a empresas e negócios reais por meio de soluções tecnológicas, dando visibilidade à contribuição de cada estudante.',
      en: 'Independent initiative by DSM students that connects student talent with companies and real businesses through technology solutions, giving visibility to each student\'s contribution.',
      es: 'Iniciativa independiente de estudiantes de DSM que conecta el talento estudiantil con empresas y negocios reales mediante soluciones tecnológicas, dando visibilidad al aporte de cada estudiante.',
    },
  },
];

export function findProject(slug: string | undefined): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}
