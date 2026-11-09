/* ======================================================================
   EatWise · protótipo navegável (grupo Seven)
   Tudo aqui é simulado no navegador: sem backend, sem IA real.
   ====================================================================== */

const TODAY = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })(); // hoje, à meia-noite
const DAY = 86400000;

/* ---------- Ícones (traço simples) ---------- */
const P = {
  home:'<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  box:'<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
  bell:'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  book:'<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>',
  chart:'<path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 0 0-16 0"/>',
  sliders:'<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
  logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
  search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  camera:'<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
  type:'<path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/>',
  mic:'<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><path d="M12 19v3"/>',
  check:'<path d="M20 6 9 17l-5-5"/>',
  x:'<path d="M18 6 6 18M6 6l12 12"/>',
  left:'<path d="m15 18-6-6 6-6"/>',
  right:'<path d="m9 18 6-6-6-6"/>',
  down:'<path d="m6 9 6 6 6-6"/>',
  cal:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  trash:'<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  leaf:'<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
  alert:'<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4M12 17h.01"/>',
  menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
  spark:'<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>',
  info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/>',
  thermo:'<path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/>',
  users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  star:'<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>',
  upload:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',
  arrow:'<path d="M5 12h14M12 5l7 7-7 7"/>',
  wallet:'<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
  db:'<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/>',
  mail:'<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
  lock:'<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  scale:'<path d="M12 3v18M5 7h14M5 7l-3 7a4 4 0 0 0 6 0zM19 7l-3 7a4 4 0 0 0 6 0z"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon:'<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  flip:'<path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/>'
};
const LOGO = '<svg class="jar" viewBox="0 0 64 64" aria-hidden="true"><rect x="15" y="26" width="34" height="32" rx="9" fill="#E7B844"/><rect x="21" y="36" width="22" height="11" rx="3.5" fill="#fff"/><g transform="rotate(-22 16 22)"><rect x="13" y="16" width="34" height="7" rx="3.5" fill="#C0603E"/></g><path d="M38 25 C38 18 42 13 49 12 C49 19 45 24 38 25 Z" fill="#4E7A38"/></svg>';
const ic = (n, cls='') => `<svg class="svg ${cls}" viewBox="0 0 24 24" aria-hidden="true">${P[n]||''}</svg>`;

/* ---------- Ilustrações ---------- */
const ILL_FRIDGE = `
<svg class="ill" viewBox="0 0 400 380" role="img" aria-label="Ilustração de uma geladeira aberta com potes etiquetados">
  <ellipse cx="200" cy="356" rx="150" ry="14" fill="var(--sand-2)"/>
  <rect x="88" y="26" width="224" height="322" rx="26" fill="var(--surface)" stroke="var(--line)" stroke-width="3"/>
  <rect x="104" y="44" width="192" height="286" rx="16" fill="var(--bg)"/>
  <line x1="104" y1="140" x2="296" y2="140" stroke="var(--line)" stroke-width="4"/>
  <line x1="104" y1="236" x2="296" y2="236" stroke="var(--line)" stroke-width="4"/>
  <!-- prateleira 1: maionese + requeijão -->
  <rect x="122" y="70" width="56" height="68" rx="10" fill="var(--yellow-soft)" stroke="var(--yellow)" stroke-width="3"/>
  <rect x="118" y="60" width="64" height="16" rx="6" fill="var(--terra)"/>
  <rect x="132" y="94" width="36" height="22" rx="5" fill="var(--surface)"/>
  <rect x="196" y="96" width="62" height="42" rx="10" fill="var(--surface)" stroke="var(--green)" stroke-width="3"/>
  <rect x="192" y="88" width="70" height="12" rx="5" fill="var(--green)"/>
  <circle cx="227" cy="118" r="8" fill="var(--yellow)"/>
  <!-- prateleira 2: molho de tomate + leite -->
  <rect x="124" y="170" width="44" height="64" rx="8" fill="var(--terra-soft)" stroke="var(--terra)" stroke-width="3"/>
  <rect x="130" y="160" width="32" height="12" rx="4" fill="var(--terra)"/>
  <circle cx="146" cy="202" r="10" fill="var(--terra)"/>
  <path d="M190 172 h40 l10 16 v46 h-60 v-46z" fill="var(--surface)" stroke="var(--olive)" stroke-width="3" stroke-linejoin="round"/>
  <rect x="190" y="200" width="50" height="14" fill="var(--olive-soft)"/>
  <rect x="254" y="190" width="30" height="44" rx="8" fill="var(--green-soft)" stroke="var(--green)" stroke-width="3"/>
  <!-- prateleira 3: frutas -->
  <circle cx="142" cy="296" r="22" fill="var(--terra)"/>
  <path d="M142 274 q6 -10 14 -10" stroke="var(--green)" stroke-width="4" fill="none" stroke-linecap="round"/>
  <circle cx="190" cy="300" r="18" fill="var(--orange)"/>
  <ellipse cx="248" cy="302" rx="34" ry="16" fill="var(--yellow)"/>
  <!-- etiqueta de validade -->
  <g transform="translate(250 50) rotate(8)">
    <rect width="132" height="62" rx="12" fill="var(--ink)"/>
    <text x="14" y="25" font-family="Nunito Sans, sans-serif" font-size="12" font-weight="700" fill="var(--bg)">ABERTO EM 09/09</text>
    <text x="14" y="46" font-family="Bricolage Grotesque, sans-serif" font-size="17" font-weight="800" fill="var(--yellow)">até 09/10</text>
  </g>
  <path d="M235 92 q14 -20 22 -28" stroke="var(--ink)" stroke-width="2.5" fill="none" stroke-dasharray="4 4"/>
</svg>`;

const ILL_JAR = `
<svg class="ill" viewBox="0 0 200 170" aria-hidden="true">
  <ellipse cx="100" cy="158" rx="80" ry="8" fill="var(--sand-2)"/>
  <rect x="58" y="44" width="84" height="110" rx="18" fill="var(--yellow-soft)" stroke="var(--yellow)" stroke-width="4"/>
  <rect x="52" y="28" width="96" height="24" rx="8" fill="var(--terra)"/>
  <rect x="72" y="80" width="56" height="34" rx="8" fill="var(--surface)"/>
  <path d="M86 97 l8 8 l16 -16" stroke="var(--green)" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="160" cy="54" r="22" fill="var(--green)"/>
  <path d="M160 42 v12 l8 5" stroke="var(--on-accent)" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="M30 110 q-6 -26 20 -34 q2 26 -20 34z" fill="var(--olive)"/>
</svg>`;

