import { useId, useRef, useState, type FormEvent } from 'react';
import { ApiError, postContact } from '../services/api';
import { LINKS, formatWhatsapp } from '../content/profile';
import { useI18n } from '../i18n/context';
import { ExternalLink, PageHeader, Section } from './shared';

type Status = 'idle' | 'sending' | 'sent' | 'error';
interface Errors {
  name?: string;
  email?: string;
  message?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ContactPage() {
  const { lang, t } = useI18n();
  const f = t.contact.form;
  const uid = useId();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>('idle');
  const [feedback, setFeedback] = useState('');
  // Trava síncrona: dois cliques/Enter seguidos chegam antes de o estado re-renderizar.
  const inFlight = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);

  const validate = (): Errors => {
    const e: Errors = {};
    const n = name.trim().length;
    if (n < 2 || n > 100) e.name = f.nameInvalid;
    if (!EMAIL_RE.test(email.trim())) e.email = f.emailInvalid;
    const m = message.trim().length;
    if (m < 10 || m > 4000) e.message = f.messageInvalid;
    return e;
  };

  const onSubmit = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    if (inFlight.current) return;
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setStatus('error');
      setFeedback(f.fixFields);
      focusFirstInvalid(found);
      return;
    }
    inFlight.current = true;
    setStatus('sending');
    setFeedback('');
    try {
      // A mensagem de sucesso só aparece depois que a API confirma (200 + sent:true).
      const result = await postContact({ name: name.trim(), email: email.trim(), message: message.trim(), lang, website });
      if (!result || result.sent !== true) throw new ApiError({ status: 502, code: 'invalid_response', message: 'Resposta inesperada do servidor.' });
      setStatus('sent');
      setFeedback(f.success);
      setErrors({});
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      setStatus('error');
      if (err instanceof ApiError) {
        if (err.status === 422 && err.details) {
          // A API devolve os campos inválidos; os textos exibidos são os do idioma da página.
          const server: Errors = {};
          if (err.details.name) server.name = f.nameInvalid;
          if (err.details.email) server.email = f.emailInvalid;
          if (err.details.message) server.message = f.messageInvalid;
          setErrors(server);
          setFeedback(f.fixFields);
          focusFirstInvalid(server);
        } else if (err.status === 0) setFeedback(f.errorNetwork);
        else if (err.status === 429) setFeedback(f.errorRate);
        else if (err.code === 'contact_unavailable') setFeedback(f.errorUnavailable);
        else setFeedback(f.errorGeneric);
      } else {
        setFeedback(f.errorGeneric);
      }
    } finally {
      inFlight.current = false;
    }
  };

  /** Leva o foco ao primeiro campo com erro (ordem visual do formulário). */
  const focusFirstInvalid = (found: Errors) => {
    const first = (['name', 'email', 'message'] as const).find((k) => found[k]);
    if (first) formRef.current?.querySelector<HTMLElement>(`#${CSS.escape(`${uid}-${first}`)}`)?.focus();
  };

  const field = (key: keyof Errors) => ({
    'aria-invalid': errors[key] ? true : undefined,
    'aria-describedby': errors[key] ? `${uid}-${key}-err` : undefined,
  });

  return (
    <div className="page contact">
      <PageHeader title={t.contact.title} lead={t.contact.intro} />
      <div className="contact__grid">
        <form ref={formRef} className="form" onSubmit={onSubmit} noValidate aria-busy={status === 'sending'}>
          <div className="field">
            <label htmlFor={`${uid}-name`}>{f.name}</label>
            <input id={`${uid}-name`} type="text" autoComplete="name" maxLength={100} required value={name} onChange={(e) => setName(e.target.value)} {...field('name')} />
            {errors.name && <p className="field__error" id={`${uid}-name-err`}>{errors.name}</p>}
          </div>
          <div className="field">
            <label htmlFor={`${uid}-email`}>{f.email}</label>
            <input id={`${uid}-email`} type="email" autoComplete="email" inputMode="email" autoCapitalize="off" spellCheck={false} maxLength={254} required value={email} onChange={(e) => setEmail(e.target.value)} {...field('email')} />
            {errors.email && <p className="field__error" id={`${uid}-email-err`}>{errors.email}</p>}
          </div>
          <div className="field">
            <label htmlFor={`${uid}-message`}>{f.message}</label>
            <textarea id={`${uid}-message`} rows={6} maxLength={4000} required value={message} onChange={(e) => setMessage(e.target.value)} {...field('message')} />
            {errors.message && <p className="field__error" id={`${uid}-message-err`}>{errors.message}</p>}
          </div>
          {/* Honeypot: invisível para pessoas e leitores de tela; robôs costumam preencher. */}
          <div className="hp" aria-hidden="true">
            <label htmlFor={`${uid}-website`}>{f.honeypot}</label>
            <input id={`${uid}-website`} type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
          </div>
          <p className="form__privacy">{f.privacy}</p>
          <button type="submit" className="button" aria-disabled={status === 'sending'} onClick={(e) => { if (status === 'sending') e.preventDefault(); }}>
            {status === 'sending' ? f.sending : f.send}
          </button>
          {/* Duas regiões sempre presentes: leitores de tela só anunciam mudanças em regiões que já existem.
              Envio e sucesso são educados (status); erros interrompem (alert). */}
          <p className={`form__status form__status--${status === 'error' ? 'idle' : status}`} role="status" aria-live="polite">
            {status === 'sending' ? f.sending : status === 'sent' ? feedback : ''}
          </p>
          <p className="form__status form__status--error" role="alert">
            {status === 'error' ? feedback : ''}
          </p>
        </form>

        <Section title={t.contact.channels}>
          <ul className="channel-list">
            <li>
              <ExternalLink href={LINKS.github}>{t.common.github}</ExternalLink>
            </li>
            {LINKS.linkedin && (
              <li>
                <ExternalLink href={LINKS.linkedin}>{t.common.linkedin}</ExternalLink>
              </li>
            )}
            {LINKS.whatsapp && (
              <li>
                <ExternalLink href={`https://wa.me/${LINKS.whatsapp}`}>
                  {t.common.whatsapp}: {formatWhatsapp(LINKS.whatsapp)}
                </ExternalLink>
              </li>
            )}
            {LINKS.email && (
              <li>
                <a className="ext-link" href={`mailto:${LINKS.email}`}>
                  {t.common.email}: {LINKS.email}
                </a>
              </li>
            )}
          </ul>
        </Section>
      </div>
    </div>
  );
}
