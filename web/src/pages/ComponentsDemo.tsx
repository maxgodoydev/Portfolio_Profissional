// DEMONSTRAÇÃO TEMPORÁRIA (somente desenvolvimento): acessível em /pt/?demo=components.
// É removida do bundle de produção (process.env.NODE_ENV) e usa textos obviamente fictícios.
import { ICON_NAMES, Icon } from '../components/icons';
import { ProjectCard } from '../components/ProjectCard';
import { Tag, TagList } from '../components/Tag';
import { Timeline } from '../components/Timeline';

export function ComponentsDemo() {
  return (
    <section>
      <p className="demo-banner">Demonstração de componentes — conteúdo fictício, apenas em desenvolvimento.</p>
      <h1>Componentes</h1>

      <h2>Tags</h2>
      <p>
        <Tag>Padrão</Tag> <Tag tone="accent">Destaque</Tag> <Tag tone="outline">Contorno</Tag>
      </p>
      <TagList items={['Exemplo A', 'Exemplo B', 'Exemplo C']} label="Lista de exemplo" />

      <h2>ProjectCard</h2>
      <ul className="card-grid">
        <li>
          <ProjectCard title="Projeto de exemplo" summary="Texto fictício apenas para conferir espaçamento, contraste e foco do cartão." href="/pt/projects/exemplo" tags={['Tag 1', 'Tag 2']} category="Categoria" cta="Ver detalhes" headingLevel={3} />
        </li>
        <li>
          <ProjectCard title="Outro projeto de exemplo com título mais longo para testar quebra" summary="Segundo cartão fictício." href="/pt/projects/outro" cta="Ver detalhes" />
        </li>
      </ul>

      <h2>Timeline</h2>
      <Timeline
        label="Linha do tempo de exemplo"
        items={[
          { id: 'a', period: '2000 — 2001', title: 'Marco fictício A', subtitle: 'Organização fictícia', description: <p>Descrição fictícia.</p> },
          { id: 'b', period: '2002 — atual', title: 'Marco fictício B', badge: 'Em andamento', current: true, description: <p>Outra descrição fictícia.</p> },
          { id: 'c', period: '2030', title: 'Marco fictício C', badge: 'Previsto' },
        ]}
      />

      <h2>Ícones</h2>
      <ul className="demo-icons">
        {ICON_NAMES.map((n) => (
          <li key={n}>
            <Icon name={n} size={28} />
            {n}
          </li>
        ))}
      </ul>
    </section>
  );
}
