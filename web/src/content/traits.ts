// Como eu trabalho: competências comportamentais, síntese de perfil e curiosidade tecnológica.
import type { Localized } from '../i18n';

type L<T> = Localized<T>;

export interface Skill {
  glyph: string;
  title: L<string>;
  /** Como a competência aparece na prática (uma frase). */
  text: L<string>;
  /** Contexto real em que ela foi exercitada (só fatos já presentes no portfólio). */
  proof: L<string>;
}

export interface Pillar {
  id: string;
  icon: 'users' | 'route' | 'wrench' | 'cap';
  title: L<string>;
  subtitle: L<string>;
  skills: readonly Skill[];
}

export const WORK_STYLE_TITLE: L<string> = { pt: 'Como eu trabalho', en: 'How I work', es: 'Cómo trabajo' };
export const WORK_STYLE_INTRO: L<string> = {
  pt: 'O que levo para um estágio em Tecnologia, Dados e Desenvolvimento, e onde cada competência já apareceu na prática.',
  en: 'What I bring to an internship in Technology, Data and Development, and where each skill has already shown up in practice.',
  es: 'Lo que aporto a una pasantía en Tecnología, Datos y Desarrollo, y dónde apareció cada competencia en la práctica.',
};
export const PROOF_LABEL: L<string> = { pt: 'Na prática', en: 'In practice', es: 'En la práctica' };

export const PILLARS: readonly Pillar[] = [
  {
    id: 'people', icon: 'users',
    title: { pt: 'Com pessoas', en: 'With people', es: 'Con personas' },
    subtitle: { pt: 'Escutar, alinhar, construir junto', en: 'Listen, align, build together', es: 'Escuchar, alinear, construir juntos' },
    skills: [
      { glyph: '♡', title: { pt: 'Empatia', en: 'Empathy', es: 'Empatía' },
        text: { pt: 'Escuto quem usa e quem é afetado antes de propor uma solução.', en: 'I listen to the people who use and are affected by a solution before proposing one.', es: 'Escucho a quienes usan y se ven afectados por una solución antes de proponerla.' },
        proof: { pt: 'Contato direto com o proprietário da barbearia', en: 'Direct contact with the barbershop owner', es: 'Contacto directo con el propietario de la barbería' } },
      { glyph: '◉', title: { pt: 'Colaboração', en: 'Collaboration', es: 'Colaboración' },
        text: { pt: 'Divido tarefas, alinho decisões e construo a solução em conjunto.', en: 'I split tasks, align decisions and build the solution together.', es: 'Divido tareas, alineo decisiones y construyo la solución en conjunto.' },
        proof: { pt: 'Projeto em equipe: BarberShop do Gui', en: 'Team project: BarberShop do Gui', es: 'Proyecto en equipo: BarberShop do Gui' } },
      { glyph: '▤', title: { pt: 'Comunicação', en: 'Communication', es: 'Comunicación' },
        text: { pt: 'Traduzo a necessidade em tarefas claras e mantenho o grupo alinhado.', en: 'I turn a need into clear tasks and keep the group aligned.', es: 'Traduzco la necesidad en tareas claras y mantengo al grupo alineado.' },
        proof: { pt: 'Organização da comunicação na Segunda Vitrine', en: 'Communication setup at Segunda Vitrine', es: 'Organización de la comunicación en Segunda Vitrine' } },
    ],
  },
  {
    id: 'motion', icon: 'route',
    title: { pt: 'Em movimento', en: 'In motion', es: 'En movimiento' },
    subtitle: { pt: 'Começar, liderar, buscar alternativas', en: 'Start, lead, look for alternatives', es: 'Empezar, liderar, buscar alternativas' },
    skills: [
      { glyph: '⚑', title: { pt: 'Iniciativa', en: 'Initiative', es: 'Iniciativa' },
        text: { pt: 'Vejo uma oportunidade e a transformo em projeto.', en: 'I see an opportunity and turn it into a project.', es: 'Veo una oportunidad y la convierto en proyecto.' },
        proof: { pt: 'Cofundação da Segunda Vitrine', en: 'Co-founding Segunda Vitrine', es: 'Cofundación de Segunda Vitrine' } },
      { glyph: '◈', title: { pt: 'Liderança colaborativa', en: 'Collaborative leadership', es: 'Liderazgo colaborativo' },
        text: { pt: 'Organizo atividades, prazos e entregas junto com a equipe, sem impor.', en: 'I organize activities, deadlines and deliverables with the team, without imposing.', es: 'Organizo actividades, plazos y entregas junto con el equipo, sin imponer.' },
        proof: { pt: 'Líder principal no BarberShop do Gui', en: 'Main lead on BarberShop do Gui', es: 'Líder principal en BarberShop do Gui' } },
      { glyph: '✧', title: { pt: 'Criatividade', en: 'Creativity', es: 'Creatividad' },
        text: { pt: 'Procuro outro caminho quando o primeiro não resolve.', en: 'I look for another path when the first one does not work.', es: 'Busco otro camino cuando el primero no resuelve.' },
        proof: { pt: 'Automação do agendamento no BarberShop do Gui', en: 'Scheduling automation on BarberShop do Gui', es: 'Automatización de la agenda en BarberShop do Gui' } },
    ],
  },
  {
    id: 'execution', icon: 'wrench',
    title: { pt: 'Na execução', en: 'In execution', es: 'En la ejecución' },
    subtitle: { pt: 'Planejar, priorizar, resolver', en: 'Plan, prioritize, solve', es: 'Planificar, priorizar, resolver' },
    skills: [
      { glyph: '▦', title: { pt: 'Organização', en: 'Organization', es: 'Organización' },
        text: { pt: 'Documentos, certidões e pendências sempre sob controle.', en: 'Documents, certificates and pending items always under control.', es: 'Documentos, certificados y pendientes siempre bajo control.' },
        proof: { pt: 'Quase 9 anos em Legalização Empresarial', en: 'Almost 9 years in Business Legalization', es: 'Casi 9 años en Legalización Empresarial' } },
      { glyph: '◷', title: { pt: 'Gestão do tempo', en: 'Time management', es: 'Gestión del tiempo' },
        text: { pt: 'Priorizo, acompanho prazos e entrego no combinado.', en: 'I prioritize, track deadlines and deliver as agreed.', es: 'Priorizo, sigo los plazos y entrego lo acordado.' },
        proof: { pt: 'Prazos e entregas acompanhados em Trello e Jira', en: 'Deadlines and deliverables tracked in Trello and Jira', es: 'Plazos y entregas seguidos en Trello y Jira' } },
      { glyph: '⚙', title: { pt: 'Resolução de problemas', en: 'Problem solving', es: 'Resolución de problemas' },
        text: { pt: 'Investigo a causa antes de agir e proponho o caminho adequado.', en: 'I investigate the cause before acting and propose the right path.', es: 'Investigo la causa antes de actuar y propongo el camino adecuado.' },
        proof: { pt: 'Casos complexos na Contmor e na Conube', en: 'Complex cases at Contmor and Conube', es: 'Casos complejos en Contmor y Conube' } },
    ],
  },
  {
    id: 'growth', icon: 'cap',
    title: { pt: 'Em evolução', en: 'Growing', es: 'En evolución' },
    subtitle: { pt: 'Adaptar, aprender, reconhecer limites', en: 'Adapt, learn, recognize limits', es: 'Adaptar, aprender, reconocer límites' },
    skills: [
      { glyph: '⌘', title: { pt: 'Flexibilidade cognitiva', en: 'Cognitive flexibility', es: 'Flexibilidad cognitiva' },
        text: { pt: 'Reavalio decisões, adapto a estratégia e aprendo com os erros.', en: 'I reassess decisions, adapt the strategy and learn from mistakes.', es: 'Reevalúo decisiones, adapto la estrategia y aprendo de los errores.' },
        proof: { pt: 'Mudança planejada da Legalização para Tecnologia e Dados', en: 'Planned move from Legalization to Technology and Data', es: 'Cambio planificado de Legalización a Tecnología y Datos' } },
      { glyph: '↗', title: { pt: 'Aprendizado contínuo', en: 'Continuous learning', es: 'Aprendizaje continuo' },
        text: { pt: 'Aprendo na prática e consolido com projetos.', en: 'I learn by doing and consolidate it with projects.', es: 'Aprendo en la práctica y lo consolido con proyectos.' },
        proof: { pt: 'Cursos de Python, SQL e Power BI; este portfólio em React, TypeScript e Go', en: 'Python, SQL and Power BI courses; this portfolio in React, TypeScript and Go', es: 'Cursos de Python, SQL y Power BI; este portafolio en React, TypeScript y Go' } },
      { glyph: '✎', title: { pt: 'Autoconhecimento', en: 'Self-awareness', es: 'Autoconocimiento' },
        text: { pt: 'Sei onde estou evoluindo e escolho o que estudar a partir disso.', en: 'I know where I am still growing and choose what to study from there.', es: 'Sé en qué estoy evolucionando y elijo qué estudiar a partir de eso.' },
        proof: { pt: 'Tecnologias do portfólio com status real: em uso, estudada ou em desenvolvimento', en: 'Portfolio technologies shown with real status: used, studied or in progress', es: 'Tecnologías del portafolio con estado real: en uso, estudiada o en desarrollo' } },
    ],
  },
];

/** Síntese do perfil: o raciocínio em etapas, mostrado como um percurso visual. */
export const APPROACH_QUOTE: L<string> = {
  pt: 'Antes de construir uma solução, procuro entender o problema, quem é impactado, qual objetivo queremos alcançar e quais recursos e prazos temos disponíveis. A partir disso, planejo, colaboro, tomo iniciativa e ajusto a rota sempre que necessário.',
  en: 'Before building a solution, I try to understand the problem, who is affected, what goal we want to reach and which resources and deadlines we have. From there, I plan, collaborate, take initiative and adjust course whenever needed.',
  es: 'Antes de construir una solución, procuro entender el problema, quién se ve afectado, qué objetivo queremos alcanzar y con qué recursos y plazos contamos. A partir de ahí, planifico, colaboro, tomo la iniciativa y ajusto el rumbo siempre que sea necesario.',
};

export const APPROACH_STEPS: readonly { glyph: string; label: L<string> }[] = [
  { glyph: '◎', label: { pt: 'Entender o problema', en: 'Understand the problem', es: 'Entender el problema' } },
  { glyph: '▦', label: { pt: 'Planejar', en: 'Plan', es: 'Planificar' } },
  { glyph: '◉', label: { pt: 'Colaborar', en: 'Collaborate', es: 'Colaborar' } },
  { glyph: '⚑', label: { pt: 'Agir', en: 'Act', es: 'Actuar' } },
  { glyph: '↻', label: { pt: 'Ajustar a rota', en: 'Adjust course', es: 'Ajustar el rumbo' } },
];

export const CURIOSITY: { glyph: string; title: L<string>; text: L<string> } = {
  glyph: '⌘',
  title: { pt: 'Curiosidade tecnológica', en: 'Tech curiosity', es: 'Curiosidad tecnológica' },
  text: {
    pt: 'Meu interesse por tecnologia vai além do software: gosto de entender como as coisas funcionam, explorar ferramentas e aprender na prática. Até minha própria máquina foi montada por mim.',
    en: 'My interest in technology goes beyond software: I like to understand how things work, explore tools and learn by doing. Even my own computer was built by me.',
    es: 'Mi interés por la tecnología va más allá del software: me gusta entender cómo funcionan las cosas, explorar herramientas y aprender en la práctica. Hasta mi propia máquina la armé yo.',
  },
};
