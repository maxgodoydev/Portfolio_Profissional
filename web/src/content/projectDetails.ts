// Detalhe de cada projeto. Apenas o que foi informado pelo autor; seções ausentes não são exibidas.
import type { Localized } from '../i18n';

export interface ProjectDetail {
  context?: string;
  problem?: string;
  solution?: string;
  features?: readonly string[];
  /** Parágrafos curtos sobre a participação individual. */
  participation?: readonly string[];
  team?: string;
}

export const PROJECT_DETAILS: Record<string, Localized<ProjectDetail> | undefined> = {
  'barbershop-do-gui': {
    pt: {
      context: 'Sistema desenvolvido para uma barbearia real na Zona Sul de São Paulo, pela equipe da Segunda Vitrine.',
      solution: 'Aplicação web em Java 21 com Spring Boot e Spring Security, banco PostgreSQL no Supabase e build com Maven. O sistema reúne o fluxo de agendamentos, a gestão administrativa e indicadores de BI, com acesso separado por perfis.',
      features: ['Perfis de proprietário, recepção e profissional', 'Agendamentos', 'Funcionalidades administrativas', 'Indicadores de BI'],
      participation: [
        'Liderança do projeto e contato direto com o proprietário.',
        'Arquitetura e escolhas técnicas.',
        'Definição das regras de negócio e organização dos processos.',
        'Indicadores de BI e automação do fluxo de agendamentos.',
      ],
      team: 'Segunda Vitrine: Alexandre, Max e Luca',
    },
    en: {
      context: 'A system built for a real barbershop in the South Zone of São Paulo by the Segunda Vitrine team.',
      solution: 'A web application in Java 21 with Spring Boot and Spring Security, a PostgreSQL database on Supabase and Maven for the build. It brings together the appointment flow, administration and BI indicators, with access separated by profile.',
      features: ['Owner, front-desk and professional profiles', 'Appointments', 'Administrative features', 'BI indicators'],
      participation: [
        'Led the project and was the direct contact with the owner.',
        'Architecture and technical choices.',
        'Definition of business rules and organization of processes.',
        'BI indicators and automation of the appointment flow.',
      ],
      team: 'Segunda Vitrine: Alexandre, Max and Luca',
    },
    es: {
      context: 'Sistema desarrollado para una barbería real en la Zona Sur de São Paulo por el equipo de Segunda Vitrine.',
      solution: 'Aplicación web en Java 21 con Spring Boot y Spring Security, base de datos PostgreSQL en Supabase y Maven para la compilación. Reúne el flujo de agendamientos, la gestión administrativa y los indicadores de BI, con acceso separado por perfiles.',
      features: ['Perfiles de propietario, recepción y profesional', 'Agendamientos', 'Funcionalidades administrativas', 'Indicadores de BI'],
      participation: [
        'Liderazgo del proyecto y contacto directo con el propietario.',
        'Arquitectura y decisiones técnicas.',
        'Definición de las reglas de negocio y organización de los procesos.',
        'Indicadores de BI y automatización del flujo de agendamientos.',
      ],
      team: 'Segunda Vitrine: Alexandre, Max y Luca',
    },
  },
  'banking-analytics': {
    pt: {
      context: 'Projeto de análise de transações bancárias que usa dados sintéticos. Não utiliza dados bancários reais, machine learning nem previsão de fraudes.',
      solution: 'Cinco perguntas de negócio respondidas com consultas SQL sobre um banco SQLite, usando CTEs, GROUP BY, LAG, NTILE e funções de janela. O projeto utiliza Pandas, Matplotlib e Pytest, e a execução é reproduzível por usar semente fixa.',
      features: ['Cinco perguntas de negócio respondidas em SQL', 'CTEs, GROUP BY, LAG, NTILE e funções de janela', 'Quatro testes automatizados com Pytest', 'Execução reproduzível com semente fixa'],
    },
    en: {
      context: 'A banking transaction analysis project built on synthetic data. It does not use real banking data, machine learning or fraud prediction.',
      solution: 'Five business questions answered with SQL queries on a SQLite database, using CTEs, GROUP BY, LAG, NTILE and window functions. The project uses Pandas, Matplotlib and Pytest, and runs are reproducible thanks to a fixed seed.',
      features: ['Five business questions answered in SQL', 'CTEs, GROUP BY, LAG, NTILE and window functions', 'Four automated tests with Pytest', 'Reproducible runs with a fixed seed'],
    },
    es: {
      context: 'Proyecto de análisis de transacciones bancarias con datos sintéticos. No utiliza datos bancarios reales, machine learning ni predicción de fraudes.',
      solution: 'Cinco preguntas de negocio resueltas con consultas SQL sobre una base SQLite, usando CTE, GROUP BY, LAG, NTILE y funciones de ventana. El proyecto utiliza Pandas, Matplotlib y Pytest, y la ejecución es reproducible gracias a una semilla fija.',
      features: ['Cinco preguntas de negocio resueltas en SQL', 'CTE, GROUP BY, LAG, NTILE y funciones de ventana', 'Cuatro pruebas automatizadas con Pytest', 'Ejecución reproducible con semilla fija'],
    },
  },
  'power-bi-portfolio': {
    pt: {
      context: 'Reúne projetos acadêmicos e estudos de Business Intelligence.',
      solution: 'Dashboards com indicadores operacionais para apoiar a tomada de decisão, construídos com Power BI, DAX, Power Query e SQL.',
      features: ['Dashboards e indicadores operacionais', 'Modelo individual com 20 tabelas e 19 KPIs', 'Modelo em equipe com 6 tabelas'],
      participation: ['Um dos modelos foi desenvolvido individualmente: 20 tabelas e 19 KPIs.', 'Outro modelo foi desenvolvido em equipe: 6 tabelas.'],
    },
    en: {
      context: 'A collection of academic projects and Business Intelligence studies.',
      solution: 'Dashboards with operational indicators to support decision-making, built with Power BI, DAX, Power Query and SQL.',
      features: ['Dashboards and operational indicators', 'Individual model with 20 tables and 19 KPIs', 'Team model with 6 tables'],
      participation: ['One of the models was built individually: 20 tables and 19 KPIs.', 'Another model was built as a team: 6 tables.'],
    },
    es: {
      context: 'Reúne proyectos académicos y estudios de Business Intelligence.',
      solution: 'Dashboards con indicadores operativos para apoyar la toma de decisiones, construidos con Power BI, DAX, Power Query y SQL.',
      features: ['Dashboards e indicadores operativos', 'Modelo individual con 20 tablas y 19 KPI', 'Modelo en equipo con 6 tablas'],
      participation: ['Uno de los modelos fue desarrollado de forma individual: 20 tablas y 19 KPI.', 'Otro modelo fue desarrollado en equipo: 6 tablas.'],
    },
  },
  'studio-patty-leao': {
    pt: {
      context: 'ERP simplificado para um salão de beleza.',
      solution: 'Aplicação web com Node.js, Express e EJS, com dados em MongoDB Atlas.',
      features: ['Agendamentos', 'Controle de estoque', 'Controle financeiro manual', 'Vitrine de agendamento', 'Indicadores'],
    },
    en: {
      context: 'A simplified ERP for a beauty salon.',
      solution: 'A web application with Node.js, Express and EJS, with data stored in MongoDB Atlas.',
      features: ['Appointments', 'Inventory control', 'Manual financial control', 'Booking storefront', 'Indicators'],
    },
    es: {
      context: 'ERP simplificado para un salón de belleza.',
      solution: 'Aplicación web con Node.js, Express y EJS, con datos en MongoDB Atlas.',
      features: ['Agendamientos', 'Control de inventario', 'Control financiero manual', 'Vitrina de reservas', 'Indicadores'],
    },
  },
  entrelacos: {
    pt: {
      context: 'Catálogo digital responsivo.',
      solution: 'Desenvolvido com HTML, CSS, JavaScript e JSON.',
      features: ['Layout responsivo', 'Filtros dinâmicos', 'Integração com WhatsApp'],
    },
    en: {
      context: 'A responsive digital catalog.',
      solution: 'Built with HTML, CSS, JavaScript and JSON.',
      features: ['Responsive layout', 'Dynamic filters', 'WhatsApp integration'],
    },
    es: {
      context: 'Catálogo digital responsivo.',
      solution: 'Desarrollado con HTML, CSS, JavaScript y JSON.',
      features: ['Diseño responsivo', 'Filtros dinámicos', 'Integración con WhatsApp'],
    },
  },
  'python-studies': {
    pt: {
      context: 'Repositório de estudos para desenvolver habilidades em lógica de programação, análise de dados e estatística. É material de estudo, não experiência profissional.',
      solution: 'Exercícios e análises feitos com Python, NumPy, Pandas e SQL.',
      features: ['Lógica de programação', 'Análise de dados', 'Estatística'],
    },
    en: {
      context: 'A study repository to build skills in programming logic, data analysis and statistics. It is study material, not professional experience.',
      solution: 'Exercises and analyses done with Python, NumPy, Pandas and SQL.',
      features: ['Programming logic', 'Data analysis', 'Statistics'],
    },
    es: {
      context: 'Repositorio de estudios para desarrollar habilidades en lógica de programación, análisis de datos y estadística. Es material de estudio, no experiencia profesional.',
      solution: 'Ejercicios y análisis hechos con Python, NumPy, Pandas y SQL.',
      features: ['Lógica de programación', 'Análisis de datos', 'Estadística'],
    },
  },
  intelibolsas: {
    pt: {
      context: 'Projeto acadêmico do 2º semestre, executado localmente.',
      solution: 'Aplicação web (CRUD) em PHP com banco de dados MySQL para divulgar bolsas de estudo e cursos.',
      features: ['Área do aluno', 'Área da instituição', 'Área de administração', 'Divulgação de bolsas de estudo e cursos'],
    },
    en: {
      context: 'An academic project from the 2nd semester, run locally.',
      solution: 'A web application (CRUD) in PHP with a MySQL database to publish scholarships and courses.',
      features: ['Student area', 'Institution area', 'Administration area', 'Publication of scholarships and courses'],
    },
    es: {
      context: 'Proyecto académico del 2.º semestre, ejecutado localmente.',
      solution: 'Aplicación web (CRUD) en PHP con base de datos MySQL para difundir becas de estudio y cursos.',
      features: ['Área del alumno', 'Área de la institución', 'Área de administración', 'Difusión de becas de estudio y cursos'],
    },
  },
  'segunda-vitrine': {
    pt: {
      context: 'Iniciativa independente criada em novembro de 2026 por estudantes de Desenvolvimento de Software Multiplataforma da FATEC Zona Sul. Não tem vínculo institucional nem representa a FATEC. O nome vem da ideia de ser a "segunda vitrine" de um negócio: a primeira é a loja física, a segunda é a presença digital.',
      solution: 'O propósito é conectar talentos estudantis ao mercado por meio de soluções tecnológicas para empresas e negócios reais. Hoje a iniciativa tem um site que apresenta os projetos, com o contexto, a solução e a contribuição de cada estudante, e uma página no LinkedIn. Segue em desenvolvimento.',
      features: ['Sites e sistemas', 'Aplicativos', 'Soluções de dados', 'Automação de processos'],
      participation: [
        'Idealização da iniciativa e criação do nome, após definir objetivo, problema, público-alvo e partes envolvidas.',
        'Coordenação dos projetos: planejamento, levantamento de necessidades, distribuição de tarefas, prazos e entregas.',
        'Organização da comunicação com Trello, Jira e Discord e apoio à documentação e apresentação dos projetos.',
      ],
    },
    en: {
      context: 'An independent initiative created in November 2026 by Multiplatform Software Development students at FATEC Zona Sul. It has no institutional link with FATEC and does not represent it. The name comes from the idea of being a business\'s "second storefront": the first is the physical shop, the second is the digital presence.',
      solution: 'The purpose is to connect student talent with the job market through technology solutions for companies and real businesses. Today the initiative has a website that presents the projects, with the context, the solution and each student\'s contribution, and a LinkedIn page. It is still in development.',
      features: ['Websites and systems', 'Applications', 'Data solutions', 'Process automation'],
      participation: [
        'Conceived the initiative and created the name, after defining the goal, the problem, the target audience and the parties involved.',
        'Project coordination: planning, requirements gathering, task distribution, deadlines and deliveries.',
        'Organizing communication with Trello, Jira and Discord and supporting project documentation and presentation.',
      ],
    },
    es: {
      context: 'Iniciativa independiente creada en noviembre de 2026 por estudiantes de Desarrollo de Software Multiplataforma de la FATEC Zona Sul. No tiene vínculo institucional ni representa a la FATEC. El nombre viene de la idea de ser la "segunda vitrina" de un negocio: la primera es la tienda física, la segunda es la presencia digital.',
      solution: 'El propósito es conectar el talento estudiantil con el mercado mediante soluciones tecnológicas para empresas y negocios reales. Hoy la iniciativa tiene un sitio que presenta los proyectos, con el contexto, la solución y el aporte de cada estudiante, y una página en LinkedIn. Sigue en desarrollo.',
      features: ['Sitios y sistemas', 'Aplicaciones', 'Soluciones de datos', 'Automatización de procesos'],
      participation: [
        'Ideación de la iniciativa y creación del nombre, tras definir objetivo, problema, público objetivo y partes involucradas.',
        'Coordinación de los proyectos: planificación, levantamiento de necesidades, distribución de tareas, plazos y entregas.',
        'Organización de la comunicación con Trello, Jira y Discord y apoyo a la documentación y presentación de los proyectos.',
      ],
    },
  },
};
