// Tecnologias com classificação honesta (uso real). Nomes não são traduzidos.
// project  = aparece em projeto publicado neste portfólio (campo `projects` indica onde)
// studied  = estudada, sem projeto publicado
// building = em desenvolvimento neste portfólio
export type TechStatus = 'project' | 'studied' | 'building';
export type TechCategory = 'data' | 'languages' | 'web' | 'databases' | 'tools';

export interface Tech {
  name: string;
  category: TechCategory;
  status: TechStatus;
  projects?: readonly string[];
}

export const TECH_CATEGORIES: readonly TechCategory[] = ['data', 'languages', 'web', 'databases', 'tools'];

export const TECHNOLOGIES: readonly Tech[] = [
  // Dados e BI
  { name: 'Power BI', category: 'data', status: 'project', projects: ['power-bi-portfolio'] },
  { name: 'DAX', category: 'data', status: 'project', projects: ['power-bi-portfolio'] },
  { name: 'Power Query', category: 'data', status: 'project', projects: ['power-bi-portfolio'] },
  { name: 'Excel', category: 'data', status: 'studied' },
  { name: 'SQL', category: 'data', status: 'project', projects: ['banking-analytics', 'power-bi-portfolio', 'python-studies'] },
  // Programação
  { name: 'Python', category: 'languages', status: 'project', projects: ['banking-analytics', 'python-studies'] },
  { name: 'JavaScript', category: 'languages', status: 'project', projects: ['entrelacos', 'studio-patty-leao'] },
  { name: 'Java', category: 'languages', status: 'project', projects: ['barbershop-do-gui'] },
  { name: 'PHP', category: 'languages', status: 'project', projects: ['intelibolsas'] },
  { name: 'C', category: 'languages', status: 'studied' },
  { name: 'C++', category: 'languages', status: 'studied' },
  // Desenvolvimento web
  { name: 'HTML', category: 'web', status: 'project', projects: ['entrelacos'] },
  { name: 'CSS', category: 'web', status: 'project', projects: ['entrelacos'] },
  { name: 'Node.js', category: 'web', status: 'project', projects: ['studio-patty-leao'] },
  { name: 'Express', category: 'web', status: 'project', projects: ['studio-patty-leao'] },
  { name: 'Spring Boot', category: 'web', status: 'project', projects: ['barbershop-do-gui'] },
  { name: 'React', category: 'web', status: 'studied' },
  // Bancos de dados
  { name: 'MySQL', category: 'databases', status: 'project', projects: ['intelibolsas'] },
  { name: 'MongoDB', category: 'databases', status: 'project', projects: ['studio-patty-leao'] },
  { name: 'PostgreSQL', category: 'databases', status: 'project', projects: ['barbershop-do-gui'] },
  { name: 'SQLite', category: 'databases', status: 'project', projects: ['banking-analytics'] },
  // Ferramentas
  { name: 'Git', category: 'tools', status: 'project' },
  { name: 'GitHub', category: 'tools', status: 'project' },
  { name: 'Vercel', category: 'tools', status: 'project', projects: ['entrelacos', 'segunda-vitrine'] },
  { name: 'Render', category: 'tools', status: 'project', projects: ['barbershop-do-gui', 'studio-patty-leao'] },
  // Em desenvolvimento neste portfólio
  { name: 'TypeScript', category: 'languages', status: 'building' },
  { name: 'Go', category: 'languages', status: 'building' },
];
