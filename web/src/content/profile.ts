// Dados de contato público, exatamente como informados por Max Godoy.
// Telefone: autorizado por ele para exibição como WhatsApp (somente dígitos, com DDI 55).
// Não há endereço publicado. Currículos em PDF: veja web/public/resume/.
export const LINKS: { github: string; linkedin: string | null; email: string | null; whatsapp: string | null } = {
  github: 'https://github.com/maxgodoydev',
  linkedin: 'https://www.linkedin.com/in/max-godoy/',
  email: 'maxgodoy.dev@gmail.com',
  whatsapp: '5511958081846',
};

/** Formata 5511958081846 como (11) 95808-1846 para exibição. */
export function formatWhatsapp(digits: string): string {
  const m = /^55(\d{2})(\d{5})(\d{4})$/.exec(digits);
  return m ? `(${m[1]}) ${m[2]}-${m[3]}` : digits;
}
