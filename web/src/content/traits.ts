// Como eu trabalho: competências comportamentais, síntese de perfil e curiosidade tecnológica.
import type { Localized } from '../i18n';

type L<T> = Localized<T>;

export interface Trait {
  glyph: string;
  title: L<string>;
  text: L<string>;
}

export const WORK_STYLE_TITLE: L<string> = { pt: 'Como eu trabalho', en: 'How I work', es: 'Cómo trabajo' };
export const WORK_STYLE_INTRO: L<string> = {
  pt: 'Competências que aparecem no dia a dia dos projetos, em poucas palavras.',
  en: 'Skills that show up in day-to-day project work, in a few words.',
  es: 'Competencias que aparecen en el día a día de los proyectos, en pocas palabras.',
};

export const TRAITS: readonly Trait[] = [
  { glyph: '◉', title: { pt: 'Colaboração', en: 'Collaboration', es: 'Colaboración' }, text: { pt: 'Empatia, comunicação e construção de soluções em grupo.', en: 'Empathy, communication and building solutions as a group.', es: 'Empatía, comunicación y construcción de soluciones en grupo.' } },
  { glyph: '⚑', title: { pt: 'Iniciativa', en: 'Initiative', es: 'Iniciativa' }, text: { pt: 'Identifico oportunidades e transformo ideias em projetos.', en: 'I spot opportunities and turn ideas into projects.', es: 'Identifico oportunidades y transformo ideas en proyectos.' } },
  { glyph: '⌘', title: { pt: 'Flexibilidade cognitiva', en: 'Cognitive flexibility', es: 'Flexibilidad cognitiva' }, text: { pt: 'Reavalio decisões, adapto estratégias e aprendo com erros.', en: 'I reassess decisions, adapt strategies and learn from mistakes.', es: 'Reevalúo decisiones, adapto estrategias y aprendo de los errores.' } },
  { glyph: '✧', title: { pt: 'Criatividade', en: 'Creativity', es: 'Creatividad' }, text: { pt: 'Busco diferentes caminhos para solucionar problemas.', en: 'I look for different paths to solve problems.', es: 'Busco distintos caminos para resolver problemas.' } },
  { glyph: '◷', title: { pt: 'Gestão do tempo', en: 'Time management', es: 'Gestión del tiempo' }, text: { pt: 'Organizo prioridades, prazos e recursos para alcançar objetivos.', en: 'I organize priorities, deadlines and resources to reach goals.', es: 'Organizo prioridades, plazos y recursos para alcanzar objetivos.' } },
  { glyph: '↗', title: { pt: 'Autoconhecimento', en: 'Self-awareness', es: 'Autoconocimiento' }, text: { pt: 'Reconheço meus pontos de evolução e busco desenvolvimento contínuo.', en: 'I recognize where I can grow and pursue continuous development.', es: 'Reconozco mis puntos de evolución y busco desarrollo continuo.' } },
  { glyph: '◈', title: { pt: 'Liderança colaborativa', en: 'Collaborative leadership', es: 'Liderazgo colaborativo' }, text: { pt: 'Tomo iniciativa, organizo atividades e contribuo para o desenvolvimento de projetos e equipes.', en: 'I take initiative, organize activities and contribute to the growth of projects and teams.', es: 'Tomo la iniciativa, organizo actividades y contribuyo al desarrollo de proyectos y equipos.' } },
  { glyph: '▤', title: { pt: 'Comunicação', en: 'Communication', es: 'Comunicación' }, text: { pt: 'Procuro transmitir ideias com clareza, ouvir diferentes perspectivas e alinhar objetivos.', en: 'I aim to convey ideas clearly, listen to different perspectives and align goals.', es: 'Busco transmitir ideas con claridad, escuchar distintas perspectivas y alinear objetivos.' } },
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
