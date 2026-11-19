// Páginas públicas. A área administrativa (rota 'admin') é renderizada por App.tsx com estrutura própria.
import type { ReactNode } from 'react';
import { useLocation } from '../router';
import { ComponentsDemo } from './ComponentsDemo';
import { AboutPage } from './About';
import { ContactPage } from './Contact';
import { HomePage } from './Home';
import { JourneyPage } from './Journey';
import { NotFoundPage } from './NotFound';
import { PrivacyPage } from './Privacy';
import { ProjectDetailPage } from './ProjectDetail';
import { ProjectsPage } from './Projects';
import { ResumePage } from './Resume';
import { TechnologiesPage } from './Technologies';

type Loc = ReturnType<typeof useLocation>;

function pageFor(location: Loc): ReactNode {
  switch (location.route) {
    case 'home':
      return <HomePage />;
    case 'about':
      return <AboutPage />;
    case 'projects':
      return <ProjectsPage />;
    case 'project':
      return <ProjectDetailPage slug={location.slug ?? ''} />;
    case 'technologies':
      return <TechnologiesPage />;
    case 'journey':
      return <JourneyPage />;
    case 'contact':
      return <ContactPage />;
    case 'resume':
      return <ResumePage />;
    case 'privacy':
      return <PrivacyPage />;
    default:
      return <NotFoundPage />;
  }
}

export function renderPage(location: Loc): ReactNode {
  // Demonstração de componentes: só existe fora de produção (código removido do bundle final).
  if (process.env.NODE_ENV !== 'production' && location.query.get('demo') === 'components') return <ComponentsDemo />;
  // key força a remontagem ao trocar de página, reiniciando estado local.
  return <div key={`${location.route}:${location.slug ?? ''}`}>{pageFor(location)}</div>;
}
