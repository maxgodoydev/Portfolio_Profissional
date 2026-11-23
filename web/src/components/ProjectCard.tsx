import { Link } from '../router';
import { Highlight } from './Highlight';
import { Icon } from './icons';
import { TagList } from './Tag';

export interface ProjectCardProps {
  title: string;
  summary: string;
  /** Caminho interno do detalhe do projeto (ex.: /pt/projects/slug). */
  href: string;
  tags?: readonly string[];
  /** Categoria/área exibida acima do título (opcional). */
  category?: string;
  /** Texto do convite, já traduzido (ex.: "Ver detalhes"). */
  cta: string;
  /** Rótulo acessível da lista de tecnologias, já traduzido. */
  tagsLabel?: string;
  /** Nível do título para respeitar a hierarquia da página (padrão: h3). */
  headingLevel?: 2 | 3 | 4;
  /** Termos da busca a destacar no título, resumo e tecnologias (já normalizados). */
  tokens?: readonly string[];
}

/** Cartão de projeto. O cartão inteiro é clicável por meio do link do título (::after). */
export function ProjectCard({ title, summary, href, tags = [], category, cta, tagsLabel, headingLevel = 3, tokens = [] }: ProjectCardProps) {
  const Heading = `h${headingLevel}` as 'h2' | 'h3' | 'h4';
  return (
    <article className="project-card">
      {category && <p className="project-card__category">{category}</p>}
      <Heading className="project-card__title">
        <Link to={href} className="project-card__link">
          <Highlight text={title} tokens={tokens} />
        </Link>
      </Heading>
      <p className="project-card__summary">
        <Highlight text={summary} tokens={tokens} />
      </p>
      <TagList items={tags} label={tagsLabel} tokens={tokens} />
      <p className="project-card__cta" aria-hidden="true">
        {cta} <Icon name="arrowRight" size={18} />
      </p>
    </article>
  );
}
