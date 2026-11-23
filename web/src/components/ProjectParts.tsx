// Peças compartilhadas entre o pop-up do projeto e a página completa do projeto.
import type { ReactNode } from 'react';
import type { Project } from '../content/projects';
import { featureIcon, type ProjectDetail } from '../content/projectDetails';
import { useI18n } from '../i18n/context';
import { Link } from '../router';
import { buildPath } from '../routes';
import { BrandIcon } from './BrandIcon';
import { Icon } from './icons';

/** Link pequeno com símbolo (GitHub, site, demonstração, página completa). */
export function IconLink({ href, to, icon, children, label }: { href?: string; to?: string; icon: ReactNode; children: ReactNode; label?: string }) {
  const { t } = useI18n();
  const inner = (
    <>
      <span className="icon-link__symbol" aria-hidden="true">
        {icon}
      </span>
      <span>{children}</span>
      {label && <span className="visually-hidden">: {label}</span>}
    </>
  );
  if (to) {
    return (
      <Link className="icon-link" to={to}>
        {inner}
      </Link>
    );
  }
  return (
    <a className="icon-link" href={href} target="_blank" rel="noopener noreferrer">
      {inner}
      <Icon name="external" size={13} className="icon-link__ext" />
      <span className="visually-hidden"> {t.common.newTab}</span>
    </a>
  );
}

/** Linha de links em formato pequeno, com símbolos: demonstração, site, GitHub e (opcional) página completa. */
export function ProjectLinks({ project, withPage = false }: { project: Project; withPage?: boolean }) {
  const { lang, t } = useI18n();
  return (
    <ul className="icon-links" aria-label={t.projects.quickLinks}>
      {project.demo && (
        <li>
          <IconLink href={project.demo} icon={<Icon name="play" size={15} />} label={project.title}>
            {t.projects.linkDemo}
          </IconLink>
        </li>
      )}
      {project.site && (
        <li>
          <IconLink href={project.site} icon={<Icon name="globe" size={15} />} label={project.title}>
            {t.projects.linkSite}
          </IconLink>
        </li>
      )}
      <li>
        <IconLink href={project.repo} icon={<BrandIcon name="GitHub" size={15} />} label={project.title}>
          {t.projects.linkRepo}
        </IconLink>
      </li>
      {withPage && (
        <li>
          <IconLink to={buildPath(lang, 'project', project.slug)} icon={<Icon name="file" size={15} />} label={project.title}>
            {t.projects.openPage}
          </IconLink>
        </li>
      )}
    </ul>
  );
}

/** Lista de funcionalidades com emoji (decorativo) antes de cada item. */
export function FeatureList({ slug, items, className = '' }: { slug: string; items: readonly string[]; className?: string }) {
  return (
    <ul className={`emoji-list ${className}`.trim()}>
      {items.map((f, i) => (
        <li key={f}>
          <span className="emoji-list__mark" aria-hidden="true">
            {featureIcon(slug, i)}
          </span>
          <span>{f}</span>
        </li>
      ))}
    </ul>
  );
}

/** Foto da equipe como hiperlink (abre a imagem inteira), com os nomes dos integrantes. */
export function TeamPhotoLink({ project, detail }: { project: Project; detail?: ProjectDetail }) {
  const { lang, t } = useI18n();
  if (!project.image) return null;
  return (
    <a className="team-link" href={project.image.src} target="_blank" rel="noopener noreferrer">
      <img src={project.image.src} width={96} height={Math.round((96 * project.image.height) / project.image.width)} alt={project.image.alt[lang]} loading="lazy" decoding="async" />
      <span className="team-link__text">
        <strong>
          {t.project.teamPhoto} <Icon name="external" size={14} />
        </strong>
        {detail?.team && (
          <small>
            {t.project.teamMembers}: {detail.team}
          </small>
        )}
      </span>
      <span className="visually-hidden"> {t.common.newTab}</span>
    </a>
  );
}
