import { useId } from 'react';
import { useI18n } from '../i18n/context';
import { APPROACH_QUOTE, APPROACH_STEPS, CURIOSITY, PILLARS, PROOF_LABEL, WORK_STYLE_INTRO, WORK_STYLE_TITLE } from '../content/traits';
import { Glyph } from './CareerParts';
import { Icon } from './icons';

/** "Como eu trabalho": raciocínio em etapas + 12 competências em 4 temas, cada uma com o contexto real. */
export function WorkStyle() {
  const { lang } = useI18n();
  const headingId = useId();
  return (
    <section className="section workstyle" aria-labelledby={headingId} data-reveal>
      <div className="section__head">
        <h2 id={headingId}>
          <Glyph className="career__emoji">✦</Glyph> {WORK_STYLE_TITLE[lang]}
        </h2>
      </div>
      <p className="career__intro">{WORK_STYLE_INTRO[lang]}</p>

      <figure className="approach">
        <ol className="approach__steps">
          {APPROACH_STEPS.map((s) => (
            <li key={s.label.pt} className="approach__step">
              <Glyph className="approach__glyph">{s.glyph}</Glyph>
              <span>{s.label[lang]}</span>
            </li>
          ))}
        </ol>
        <blockquote className="approach__quote">
          <p>{APPROACH_QUOTE[lang]}</p>
        </blockquote>
      </figure>

      <div className="pillars">
        {PILLARS.map((p) => (
          <article key={p.id} className="pillar" data-pillar={p.id}>
            <header className="pillar__head">
              <span className="pillar__icon" aria-hidden="true">
                <Icon name={p.icon} size={22} />
              </span>
              <div>
                <h3 className="pillar__title">{p.title[lang]}</h3>
                <p className="pillar__subtitle">{p.subtitle[lang]}</p>
              </div>
            </header>
            <ul className="skills">
              {p.skills.map((k) => (
                <li key={k.title.pt} className="skill">
                  <Glyph className="skill__glyph">{k.glyph}</Glyph>
                  <div className="skill__body">
                    <h4 className="skill__title">{k.title[lang]}</h4>
                    <p className="skill__text">{k.text[lang]}</p>
                    <p className="skill__proof">
                      <span className="skill__proof-label">{PROOF_LABEL[lang]}</span> {k.proof[lang]}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <aside className="curiosity">
        <Glyph className="curiosity__glyph">{CURIOSITY.glyph}</Glyph>
        <div>
          <h3 className="curiosity__title">{CURIOSITY.title[lang]}</h3>
          <p>{CURIOSITY.text[lang]}</p>
        </div>
      </aside>
    </section>
  );
}
