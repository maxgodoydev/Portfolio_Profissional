// Baixa os SVGs OFICIAIS da Microsoft (repositório microsoft/PowerBI-Icons, arquivado em out/2024)
// e gera web/src/components/brandImages.ts com eles embutidos (data URI). Rode UMA vez, com internet:
//   node scripts/gen-ms-icons.mjs
// Para testar offline: MS_ICONS_DIR=./pasta-com-os-svgs node scripts/gen-ms-icons.mjs
// Licença dos arquivos: CC BY 4.0 (atribuição obrigatória: ver docs/historico/ETAPA-8-VISUAL-5.md).
// A licença NÃO concede direitos sobre nomes/logos/marcas da Microsoft: confirme que o uso (identificar a
// tecnologia que você usa) é aceitável para você antes de publicar.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const BASE = 'https://raw.githubusercontent.com/microsoft/PowerBI-Icons/main/SVG/';
const MAP = { 'Power BI': 'Power-BI.svg', 'Power Query': 'Power-Query-Colored.svg', Excel: 'Excel-Workbook.svg' };
const dir = process.env.MS_ICONS_DIR;

const out = {};
for (const [name, file] of Object.entries(MAP)) {
  let svg;
  if (dir) {
    const localPath = path.join(dir, file);
    const excelFallback = path.join(dir, 'microsoft-excel-logo.svg');
    svg = readFileSync(existsSync(localPath) ? localPath : (name === 'Excel' && existsSync(excelFallback) ? excelFallback : localPath), 'utf8');
  }
  else {
    const res = await fetch(BASE + file);
    if (!res.ok) throw new Error(`${file}: HTTP ${res.status}`);
    svg = await res.text();
  }
  // SVGs exportados por ferramentas gráficas podem trazer DOCTYPE/entidades e metadados
  // desnecessários. Removemos esses blocos antes de embutir o arquivo no bundle.
  svg = svg.replace(/^\s*<\?xml[^>]*\?>\s*/i, '');
  svg = svg.replace(/<!DOCTYPE[\s\S]*?\]>\s*/i, '').replace(/<!DOCTYPE[^>]*>\s*/i, '');
  svg = svg.replace(/<metadata\b[^>]*>[\s\S]*?<\/metadata>\s*/i, '');
  svg = svg.replace(/\s+xmlns:(?:x|i|graph)="&ns_[^"]+;"/g, '');
  svg = svg.replace(/\s+xml:space="[^"]+"/g, '');
  if (!/<svg[\s>]/.test(svg)) throw new Error(`${file}: não parece um SVG`);
  if (/<script\b|<foreignObject\b|\bon[a-z]+\s*=|(?:xlink:)?href\s*=\s*["'](?:https?:|javascript:|data:)/i.test(svg)) throw new Error(`${file}: contém conteúdo ativo ou referência externa — abortado`);
  out[name] = 'data:image/svg+xml;base64,' + Buffer.from(svg, 'utf8').toString('base64');
  console.log('ok', name, `(${svg.length} bytes)`);
}
const body = Object.entries(out).map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)},`).join('\n');
writeFileSync(new URL('../web/src/components/brandImages.ts', import.meta.url), `// GERADO por scripts/gen-ms-icons.mjs — não edite à mão.
// Power BI e Power Query: coleção microsoft/PowerBI-Icons (CC BY 4.0).
// Excel: SVG fornecido pelo usuário; origem/licença específica não verificada.
// Os nomes e as marcas pertencem aos respectivos titulares.
export const BRAND_IMAGES: Record<string, string> = {
${body}
};
`);
console.log('brandImages.ts gerado:', Object.keys(out).join(', '));
