import { useI18n } from '../i18n/context';
import { APPROACH_QUOTE, APPROACH_STEPS, CURIOSITY, TRAITS, WORK_STYLE_INTRO, WORK_STYLE_TITLE } from '../content/traits';
import { Glyph } from './CareerParts';
import { Section } from '../pages/shared';

/** "Como eu trabalho": percurso de raciocínio + competências em cartões curtos. */
export function WorkStyle() {
  const { lang } = useI18n();
  return (
    <Section title={WORK_STYLE_TITLE[lang]}>
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

      <ul className="trait-grid">
        {TRAITS.map((x) => (
          <li key={x.title.pt} className="trait">
            <Glyph className="trait__glyph">{x.glyph}</Glyph>
            <h3 className="trait__title">{x.title[lang]}</h3>
            <p className="trait__text">{x.text[lang]}</p>
          </li>
        ))}
      </ul>

      <aside className="curiosity">
        <Glyph className="curiosity__glyph">{CURIOSITY.glyph}</Glyph>
        <div>
          <h3 className="curiosity__title">{CURIOSITY.title[lang]}</h3>
          <p>{CURIOSITY.text[lang]}</p>
        </div>
      </aside>
    </Section>
  );
}
