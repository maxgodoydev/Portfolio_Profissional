// Projetos do portfólio: fatos neutros de idioma + resumos (cards) nos três idiomas.
// O detalhe de cada projeto (contexto, solução, participação) fica em projectDetails.ts.
import type { Localized } from '../i18n';

export type ProjectCategory = 'development' | 'data' | 'bi' | 'automation' | 'academic';
/** Grupo de exibição na página Projetos. */
export type ProjectGroup = 'business' | 'academic' | 'practice';
export const PROJECT_GROUPS: readonly ProjectGroup[] = ['business', 'academic', 'practice'];
export type ProjectKind = 'client' | 'academic' | 'study' | 'initiative';

export interface Project {
  slug: string;
  group: ProjectGroup;
  categories: readonly ProjectCategory[];
  /** Tipo conforme informado pelo autor; ausente quando não confirmado. */
  kind?: ProjectKind;
  featured?: boolean;
  /** Situação, quando o projeto ainda está em andamento. */
  status?: 'inProgress';
  /** Somente tecnologias confirmadas para o projeto. */
  tags: readonly string[];
  repo: string;
  demo?: string;
  site?: string;
  /** Foto opcional exibida na página do projeto (arquivo em web/public/projects). */
  image?: { src: string; width: number; height: number; alt: Localized<string>; caption: Localized<string> };
  /** Capa do cartão na lista de Projetos: captura de tela/banner do próprio projeto (web/public/projects/covers, 960×436). Sem capa, o cartão mostra um quadro neutro. */
  cover?: { src: string; width: number; height: number; alt: Localized<string> };
  /** Criação (AAAA-MM quando o mês é conhecido; somente AAAA quando apenas o ano foi confirmado). */
  created?: string;
  title: string;
  summary: Localized<string>;
}

export const PROJECTS: readonly Project[] = [
  {
    slug: 'barbershop-do-gui',
    created: '2025-02',
    group: 'business',
    categories: ['development', 'automation', 'bi'],
    kind: 'client',
    featured: true,
    tags: ['Java 21', 'Spring Boot', 'Spring Security', 'PostgreSQL', 'Supabase', 'Maven'],
    repo: 'https://github.com/maxgodoydev/BarberShop-Do-Gui',
    demo: 'https://barbershop-do-gui.onrender.com/servicos.html',
    cover: {
      src: '/projects/covers/barbershop-do-gui.webp',
      width: 960,
      height: 436,
      alt: {
        pt: 'Captura da página inicial do site da BarberShop do Gui, com a fachada da barbearia.',
        en: 'Screenshot of the BarberShop do Gui home page, showing the shop front.',
        es: 'Captura de la página de inicio del sitio de BarberShop do Gui, con la fachada de la barbería.',
      },
    },
    title: 'BarberShop do Gui',
    summary: {
      pt: 'Sistema para uma barbearia real da Zona Sul de São Paulo: agendamentos, perfis de proprietário, recepção e profissional, funções administrativas e indicadores de BI.',
      en: 'System for a real barbershop in the South Zone of São Paulo: appointments, owner, front-desk and professional profiles, admin features and BI indicators.',
      es: 'Sistema para una barbería real de la Zona Sur de São Paulo: agendamientos, perfiles de propietario, recepción y profesional, funciones administrativas e indicadores de BI.',
    },
  },
  {
    slug: 'banking-analytics',
    created: '2026',
    group: 'practice',
    categories: ['data'],
    featured: true,
    tags: ['Python', 'SQL', 'SQLite', 'Pandas', 'Matplotlib', 'Pytest'],
    repo: 'https://github.com/maxgodoydev/Banking-analytics',
    cover: {
      src: '/projects/covers/banking-analytics.webp',
      width: 960,
      height: 436,
      alt: {
        pt: 'Capa do projeto Banking Analytics com painéis de análise financeira, gráficos, banco de dados e tecnologias Python, SQL e SQLite.',
        en: 'Banking Analytics project cover with financial analysis dashboards, charts, a database, and Python, SQL and SQLite technologies.',
        es: 'Portada del proyecto Banking Analytics con paneles de análisis financiero, gráficos, base de datos y tecnologías Python, SQL y SQLite.',
      },
    },
    title: 'Banking Analytics',
    summary: {
      pt: 'Análise de transações bancárias sintéticas com Python, SQL e SQLite: cinco perguntas de negócio respondidas com CTEs, funções de janela e testes automatizados.',
      en: 'Analysis of synthetic banking transactions with Python, SQL and SQLite: five business questions answered with CTEs, window functions and automated tests.',
      es: 'Análisis de transacciones bancarias sintéticas con Python, SQL y SQLite: cinco preguntas de negocio resueltas con CTE, funciones de ventana y pruebas automatizadas.',
    },
  },
  {
    slug: 'power-bi-portfolio',
    created: '2026',
    group: 'academic',
    categories: ['bi', 'academic'],
    kind: 'academic',
    featured: true,
    tags: ['Power BI', 'DAX', 'Power Query', 'SQL'],
    repo: 'https://github.com/maxgodoydev/Business-Intelligence-portfolio',
    cover: {
      src: '/projects/covers/power-bi-portfolio.webp',
      width: 960,
      height: 436,
      alt: {
        pt: 'Banner do Portfólio de Business Intelligence e Análise de Dados, com gráficos e os logos de Power BI, SQL, Python e Excel.',
        en: 'Banner of the Business Intelligence and Data Analysis portfolio, with charts and the Power BI, SQL, Python and Excel logos.',
        es: 'Banner del Portafolio de Business Intelligence y Análisis de Datos, con gráficos y los logos de Power BI, SQL, Python y Excel.',
      },
    },
    title: 'Portfólio de Power BI',
    summary: {
      pt: 'Projetos acadêmicos e estudos de Business Intelligence: dashboards, indicadores operacionais e apoio à tomada de decisão.',
      en: 'Academic projects and Business Intelligence studies: dashboards, operational indicators and decision support.',
      es: 'Proyectos académicos y estudios de Business Intelligence: dashboards, indicadores operativos y apoyo a la toma de decisiones.',
    },
  },
  {
    slug: 'studio-patty-leao',
    created: '2026-03',
    group: 'business',
    categories: ['development', 'automation'],
    tags: ['Node.js', 'Express', 'EJS', 'MongoDB Atlas'],
    repo: 'https://github.com/maxgodoydev/Studio_Patty_Leao',
    demo: 'https://studio-patty-leao.onrender.com',
    cover: {
      src: '/projects/covers/studio-patty-leao.webp',
      width: 960,
      height: 436,
      alt: {
        pt: 'Captura da página inicial do site do Studio Patty Leão, com o menu e a chamada para agendar.',
        en: 'Screenshot of the Studio Patty Leão home page, with the menu and the booking call to action.',
        es: 'Captura de la página de inicio del sitio de Studio Patty Leão, con el menú y la llamada para agendar.',
      },
    },
    title: 'Studio Patty Leão',
    summary: {
      pt: 'ERP simplificado para salão de beleza: agendamentos, estoque, controle financeiro manual, vitrine de agendamento e indicadores.',
      en: 'Simplified ERP for a beauty salon: appointments, inventory, manual financial control, a booking storefront and indicators.',
      es: 'ERP simplificado para un salón de belleza: agendamientos, inventario, control financiero manual, vitrina de reservas e indicadores.',
    },
  },
  {
    slug: 'entrelacos',
    created: '2026',
    group: 'business',
    categories: ['development'],
    tags: ['HTML', 'CSS', 'JavaScript', 'JSON'],
    repo: 'https://github.com/maxgodoydev/Entrelacos',
    demo: 'https://entrelacos-vitrine.vercel.app',
    cover: {
      src: '/projects/covers/entrelacos.webp',
      width: 960,
      height: 436,
      alt: {
        pt: 'Captura da vitrine EntreLaços, com três kits de presente e seus preços.',
        en: 'Screenshot of the EntreLaços storefront, with three gift kits and their prices.',
        es: 'Captura de la vitrina EntreLaços, con tres kits de regalo y sus precios.',
      },
    },
    title: 'EntreLaços',
    summary: {
      pt: 'Catálogo digital responsivo com filtros dinâmicos e integração com WhatsApp.',
      en: 'Responsive digital catalog with dynamic filters and WhatsApp integration.',
      es: 'Catálogo digital responsivo con filtros dinámicos e integración con WhatsApp.',
    },
  },
  {
    slug: 'python-studies',
    created: '2026',
    group: 'practice',
    categories: ['data'],
    kind: 'study',
    tags: ['Python', 'NumPy', 'Pandas', 'SQL'],
    repo: 'https://github.com/maxgodoydev/python-lab',
    cover: {
      src: '/projects/covers/python-studies.webp',
      width: 960,
      height: 436,
      alt: {
        pt: 'Banner do repositório Python Lab: Caderno de estudos em Python.',
        en: 'Banner of the Python Lab repository: a Python study notebook.',
        es: 'Banner del repositorio Python Lab: cuaderno de estudios en Python.',
      },
    },
    title: 'Estudos em Python',
    summary: {
      pt: 'Estudos de lógica de programação, análise de dados e estatística com Python, NumPy, Pandas e SQL.',
      en: 'Studies in programming logic, data analysis and statistics with Python, NumPy, Pandas and SQL.',
      es: 'Estudios de lógica de programación, análisis de datos y estadística con Python, NumPy, Pandas y SQL.',
    },
  },
  {
    slug: 'intelibolsas',
    created: '2025-09',
    group: 'academic',
    categories: ['development', 'academic'],
    kind: 'academic',
    tags: ['PHP', 'MySQL'],
    repo: 'https://github.com/maxgodoydev/InteliBolsas',
    cover: {
      src: '/projects/covers/intelibolsas.webp',
      width: 960,
      height: 436,
      alt: {
        pt: 'Captura da página inicial do InteliBolsas, com a busca de bolsas e cursos e o mascote.',
        en: 'Screenshot of the InteliBolsas home page, with the scholarship and course search and the mascot.',
        es: 'Captura de la página de inicio de InteliBolsas, con la búsqueda de becas y cursos y la mascota.',
      },
    },
    title: 'InteliBolsas',
    summary: {
      pt: 'Aplicação web (CRUD) para divulgação de bolsas de estudo e cursos, com áreas para aluno, instituição e administração.',
      en: 'Web application (CRUD) to publish scholarships and courses, with areas for students, institutions and administration.',
      es: 'Aplicación web (CRUD) para difundir becas de estudio y cursos, con áreas para alumno, institución y administración.',
    },
  },
  {
    slug: 'tica-artesanato',
    created: '2026',
    group: 'academic',
    categories: ['development', 'academic'],
    kind: 'academic',
    status: 'inProgress',
    tags: ['Java 21', 'Spring Boot', 'Angular', 'Ionic', 'PostgreSQL', 'Python'],
    repo: 'https://github.com/Emmed22/Tica-Artesanato',
    title: 'Tica Artesanato',
    summary: {
      pt: 'Vitrine digital e gestão de encomendas para uma artesã de crochê sob encomenda, com jornada guiada, envio do pedido ao WhatsApp e controle de status.',
      en: 'Digital storefront and order management for a made-to-order crochet artisan, with a guided journey, order submission to WhatsApp and status tracking.',
      es: 'Vitrina digital y gestión de encargos para una artesana de crochet por encargo, con recorrido guiado, envío del pedido a WhatsApp y control de estados.',
    },
  },
  {
    slug: 'pm-bem-casados',
    created: '2026',
    group: 'academic',
    categories: ['development', 'academic'],
    kind: 'academic',
    status: 'inProgress',
    tags: ['Java', 'Spring Boot', 'Angular', 'Ionic', 'PostgreSQL', 'Python'],
    repo: 'https://github.com/Luck16Ash/PM-Bem-Casados',
    title: 'PM Bem-Casados',
    summary: {
      pt: 'Vitrine digital e gestão de encomendas, produção e estoque para uma confeitaria artesanal, com envio da solicitação ao WhatsApp.',
      en: 'Digital storefront and management of orders, production and inventory for an artisanal confectionery, with requests sent to WhatsApp.',
      es: 'Vitrina digital y gestión de encargos, producción e inventario para una confitería artesanal, con envío de la solicitud a WhatsApp.',
    },
  },
  {
    slug: 'segunda-vitrine',
    group: 'business',
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
    cover: {
      src: '/projects/covers/segunda-vitrine.webp',
      width: 960,
      height: 436,
      alt: {
        pt: 'Logo da Segunda Vitrine na página Sobre a iniciativa do site.',
        en: 'Segunda Vitrine logo on the About page of its website.',
        es: 'Logo de Segunda Vitrine en la página Sobre la iniciativa de su sitio.',
      },
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
