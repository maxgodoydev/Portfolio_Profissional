import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/themes.generated.css'; // gerado pelo build a partir de theme/themes.ts
import './styles/global.css';
import './styles/components.css';
import './styles/pages.css';
import './styles/visual.css';
import './styles/search.css';
import './styles/cards.css';
import './styles/showcase.css';
import './styles/neon.css';
import './styles/projects-ui.css';
import './styles/admin.css';
import { App } from './App';
import { I18nProvider } from './i18n/context';
import { ThemeProvider } from './theme/context';

const container = document.getElementById('root');
if (!container) throw new Error('Elemento #root não encontrado.');

createRoot(container).render(
  <StrictMode>
    <ThemeProvider>
      <I18nProvider>
        <App />
      </I18nProvider>
    </ThemeProvider>
  </StrictMode>,
);
