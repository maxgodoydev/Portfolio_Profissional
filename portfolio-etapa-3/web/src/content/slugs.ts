// Slugs dos projetos usados pelo build para gerar /{lang}/projects/{slug} e o sitemap.
// Derivados de content/projects.ts (fonte única).
import { PROJECTS } from './projects';

export const PROJECT_SLUGS: readonly string[] = PROJECTS.map((p) => p.slug);
