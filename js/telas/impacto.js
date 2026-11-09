/* ---------- Meu impacto ---------- */
function viewImpacto(){
  const months = ['Mai','Jun','Jul','Ago','Set','Out'];
  const cons = [9,11,13,15,17,18], desc = [9,8,6,5,3,2];
  const W = 560, H = 230, L = 34, B = 30, T = 14, max = 20;
  const y = v => T + (H - T - B) * (1 - v/max);
  const bw = 22, gw = (W - L) / months.length;
  const grid = [0,5,10,15,20].map(v => `<line x1="${L}" x2="${W}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)" stroke-width="1"/><text x="${L-8}" y="${y(v)+4}" text-anchor="end">${v}</text>`).join('');
  const bars = months.map((m,i) => {
    const cx = L + gw*i + gw/2;
    return `<rect x="${cx-bw-2}" y="${y(cons[i])}" width="${bw}" height="${y(0)-y(cons[i])}" rx="5" fill="var(--green)"/>
      <rect x="${cx+2}" y="${y(desc[i])}" width="${bw}" height="${y(0)-y(desc[i])}" rx="5" fill="var(--terra)"/>
      <text x="${cx}" y="${H-8}" text-anchor="middle">${m}</text>`;
  }).join('');
  const catDesc = [['Frios e embutidos',5],['Laticínios',4],['Conservas',2],['Molhos e condimentos',1],['Doces e geleias',1]];
  return `
  <div class="page-head">
    <div><h1>Meu impacto</h1><p>O que a Casa Oliveira consumiu a tempo e o que acabou no lixo desde que começou a usar o EatWise.</p></div>
    <div class="tabs" role="tablist" id="period"><button aria-selected="false" data-per="30">30 dias</button><button aria-selected="true" data-per="180">6 meses</button></div>
  </div>
  <section class="stats">
    <div class="stat"><span class="top">Consumidos a tempo <span class="ico i-green">${ic('check','sm')}</span></span><span class="val num">83</span><small>itens desde maio</small></div>
    <div class="stat"><span class="top">Descartados <span class="ico i-terra">${ic('trash','sm')}</span></span><span class="val num">33</span><small>queda de 78% desde maio</small></div>
    <div class="stat"><span class="top">Economia estimada <span class="ico i-yellow">${ic('wallet','sm')}</span></span><span class="val num" style="font-size:1.7rem">R$ 286,40</span><small>em produtos que não foram pro lixo</small></div>
    <div class="stat"><span class="top">Comida salva <span class="ico i-olive">${ic('scale','sm')}</span></span><span class="val num">14,6 kg</span><small>de alimentos aproveitados</small></div>
  </section>
  <div class="dash-grid">
    <article class="card chart">
      <div class="card-head" style="margin-bottom:4px"><div><h2>Consumidos × descartados por mês</h2><p class="muted" style="font-size:.9rem">Quantidade de produtos abertos</p></div></div>
      <div class="legend"><span><i style="background:var(--green)"></i>Consumidos a tempo</span><span><i style="background:var(--terra)"></i>Descartados</span></div>
      <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Gráfico de barras: descartes caem de 9 em maio para 2 em outubro, enquanto consumidos sobem de 9 para 18">${grid}${bars}</svg>
    </article>
    <div class="stack">
      <article class="card">
        <p class="eyebrow">Grupo piloto EatWise</p>
        <h3 style="margin:6px 0">Redução média de desperdício</h3>
        <p class="muted" style="font-size:.9rem">20 participantes testando o app desde agosto. Meta do projeto: reduzir pelo menos 30%.</p>
        <div class="goal" aria-label="33% de redução, meta 30%"><i style="width:33%"></i><span class="mark" style="left:30%"></span></div>
        <div style="display:flex;justify-content:space-between;margin-top:10px;font-size:.85rem;font-weight:700"><span style="color:var(--green)">33% alcançado</span><span style="color:var(--terra)">meta 30%</span></div>
      </article>
      <article class="card">
        <h3 style="margin-bottom:14px">Onde ainda há desperdício</h3>
        <div style="display:grid;gap:12px">${catDesc.map(([n,v]) => `<div class="hbar"><span>${n}</span><div class="bar bad"><i style="width:${v/5*100}%"></i></div><strong class="num" style="text-align:right">${v}</strong></div>`).join('')}</div>
        <p class="muted" style="font-size:.85rem;margin-top:14px">Frios fatiados duram só 3 dias abertos. Experimente ativar o alerta de 2 dias antes para essa categoria.</p>
      </article>
    </div>
  </div>`;
}

function bindImpacto(){
  $$('[data-per]').forEach(b => b.onclick = () => { $$('[data-per]').forEach(x => x.setAttribute('aria-selected', x === b)); toast(b.dataset.per === '30' ? 'Mostrando os últimos 30 dias' : 'Mostrando os últimos 6 meses', 'chart'); });
}

