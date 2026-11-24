import type { ReactNode } from 'react';
import { BrandIcon } from './BrandIcon';
import { Icon } from './icons';
import { LINKS, formatWhatsapp } from '../content/profile';
import { useI18n } from '../i18n/context';

interface Channel {
  id: string;
  brand: string;
  label: string;
  /** Texto de apoio derivado dos contatos configurados (nada é inventado). */
  detail: string;
  href: string;
  external: boolean;
}

/** Último trecho do caminho de uma URL de perfil (ex.: .../max-godoy/ → max-godoy). */
function handleOf(url: string): string {
  try {
    return new URL(url).pathname.split('/').filter(Boolean).pop() ?? url;
  } catch {
    return url;
  }
}

/** Links de contato com os logos originais. Cada linha inteira é um único link. */
export function ChannelLinks({ children }: { children?: ReactNode }) {
  const { t } = useI18n();
  const channels: Channel[] = [
    { id: 'github', brand: 'GitHub', label: t.common.github, detail: handleOf(LINKS.github), href: LINKS.github, external: true },
  ];
  if (LINKS.linkedin) channels.push({ id: 'linkedin', brand: 'LinkedIn', label: t.common.linkedin, detail: handleOf(LINKS.linkedin), href: LINKS.linkedin, external: true });
  if (LINKS.email) channels.push({ id: 'email', brand: 'Gmail', label: t.common.email, detail: LINKS.email, href: `mailto:${LINKS.email}`, external: false });
  if (LINKS.whatsapp) channels.push({ id: 'whatsapp', brand: 'WhatsApp', label: t.common.whatsapp, detail: formatWhatsapp(LINKS.whatsapp), href: `https://wa.me/${LINKS.whatsapp}`, external: true });

  return (
    <ul className="channel-list">
      {channels.map((c) => (
        <li key={c.id}>
          <a className="channel" data-channel={c.id} href={c.href} {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
            <span className="channel__logo">
              <BrandIcon name={c.brand} size={24} />
            </span>
            <span className="channel__text">
              <span className="channel__label">{c.label}</span>
              <span className="channel__detail">{c.detail}</span>
            </span>
            <Icon name={c.external ? 'external' : 'arrowRight'} size={18} className="channel__arrow" />
            {c.external && <span className="visually-hidden"> {t.common.newTab}</span>}
          </a>
        </li>
      ))}
      {children}
    </ul>
  );
}
