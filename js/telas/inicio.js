/* ---------- Dashboard ---------- */
function viewDashboard(){
  const A = active().sort((a,b) => a.restam - b.restam);
  const soon = A.filter(p => p.restam >= 0 && p.restam <= 3);
  const bad = A.filter(p => p.restam < 0);
  const recent = [...A].sort((a,b) => a.abertoHa - b.abertoHa).slice(0,4);
  const byLoc = Object.entries(LOCS).map(([k,n]) => [n, A.filter(p => p.loc === k).length]).filter(x => x[1]);
  const wd = WEEK[TODAY.getDay()];
  return `
  <section class="welcome">
    <div style="display:grid;gap:10px">
      <p class="eyebrow">${wd}, ${TODAY.getDate()} de ${MONTHS[TODAY.getMonth()]}</p>
      <h1>Bom dia, ${USER.primeiro}!</h1>
      <p class="muted" style="max-width:56ch">Você tem <strong style="color:var(--terra)">${soon.length} produtos</strong> que vencem nos próximos 3 dias${bad.length ? ` e <strong style="color:var(--terra)">${bad.length} vencido</strong> esperando decisão` : ''}. Planeje as refeições de hoje com eles.</p>
      <div class="actions" style="margin-top:6px"><button class="btn btn-primary" data-go="adicionar">${ic('plus','sm')} Registrar produto aberto</button><button class="btn btn-ghost" data-go="alertas">Ver alertas</button></div>
    </div>
    ${ILL_JAR}
  </section>

  <section class="stats" aria-label="Resumo">
    <button class="stat" data-go="despensa"><span class="top">Produtos abertos <span class="ico i-green">${ic('box','sm')}</span></span><span class="val num">${A.length}</span><small>na geladeira e na despensa</small></button>
    <button class="stat" data-filter="warn"><span class="top">Vencem em até 3 dias <span class="ico i-orange">${ic('clock','sm')}</span></span><span class="val num">${soon.length}</span><small>consuma primeiro</small></button>
    <button class="stat" data-filter="bad"><span class="top">Vencidos <span class="ico i-terra">${ic('alert','sm')}</span></span><span class="val num">${bad.length}</span><small>aguardando descarte</small></button>
    <button class="stat" data-go="impacto"><span class="top">Desperdício evitado <span class="ico i-olive">${ic('leaf','sm')}</span></span><span class="val num">33%</span><small>meta do piloto: 30%</small></button>
  </section>

  <div class="dash-grid">
    <div class="stack">
      <article class="card">
        <div class="card-head"><div><h2>Consumir primeiro</h2><p class="muted" style="font-size:.9rem">Ordenado pela data-limite pós-abertura</p></div><button class="link-btn" data-go="despensa">Ver tudo</button></div>
        <div class="list" id="soon-list">${A.slice(0,6).map(p => row(p, true)).join('')}</div>
      </article>
      <article class="card">
        <div class="card-head"><h2>Últimos registros</h2><span class="muted" style="font-size:.85rem">Foto, texto ou áudio</span></div>
        <div class="list">${recent.map(p => `<button class="row" data-go="produto-${p.id}">
          <span class="method-ico" title="Registrado por ${METHODS[p.via].n}">${ic(METHODS[p.via].i,'sm')}</span>
          <span class="info"><strong>${esc(p.nome)}</strong><small>${p.quem} registrou por ${METHODS[p.via].n.toLowerCase()} · ${p.abertoHa===0?'hoje':p.abertoHa===1?'ontem':'há '+p.abertoHa+' dias'}</small></span>
          <span class="end">${ic('right','sm')}</span></button>`).join('')}</div>
      </article>
    </div>
    <div class="stack">
      <article class="card">
        <div class="card-head"><h2>Onde estão</h2>${ic('thermo')}</div>
        <div class="loc-list">${byLoc.map(([n,c]) => `<div class="loc"><span class="tag">${n}</span><div class="bar"><i style="width:${Math.round(c/A.length*100)}%;background:var(--olive)"></i></div><strong class="num">${c}</strong></div>`).join('')}</div>
      </article>
      <article class="card tip">
        <p class="eyebrow">${ic('spark','sm')} Dica de conservação</p>
        <h3 style="margin:8px 0 6px">Molho de tomate não fica na embalagem aberta</h3>
        <p class="muted" style="font-size:.92rem">Passe o que sobrou para um pote de vidro com tampa e guarde na parte de dentro da geladeira. Assim o prazo de 3 dias vale de verdade.</p>
        <button class="link-btn" data-go="prazos" style="margin-top:10px">Consultar base de prazos</button>
      </article>
      <article class="card">
        <div class="card-head"><h2>Este mês</h2><button class="link-btn" data-go="impacto">Detalhes</button></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
          <div><p class="muted" style="font-size:.85rem">Consumidos a tempo</p><p class="num" style="font-family:var(--font-display);font-size:1.7rem;font-weight:800;color:var(--green)">18</p></div>
          <div><p class="muted" style="font-size:.85rem">Descartados</p><p class="num" style="font-family:var(--font-display);font-size:1.7rem;font-weight:800;color:var(--terra)">2</p></div>
          <div><p class="muted" style="font-size:.85rem">Economia estimada</p><p class="num" style="font-family:var(--font-display);font-size:1.3rem;font-weight:800">R$ 61,40</p></div>
          <div><p class="muted" style="font-size:.85rem">Comida salva</p><p class="num" style="font-family:var(--font-display);font-size:1.3rem;font-weight:800">3,2 kg</p></div>
        </div>
      </article>
    </div>
  </div>`;
}
function bindDashboard(){
  $$('[data-filter]').forEach(b => b.onclick = () => { despState.status = b.dataset.filter; despState.tab = 'ativos'; go('despensa'); });
  bindConsume();
}
function bindConsume(){
  $$('[data-consume]').forEach(b => b.onclick = e => { e.stopPropagation(); confirmConsume(Number(b.dataset.consume)); });
}
function confirmConsume(id, after){
  const p = enrich(PRODUCTS.find(x => x.id === id));
  modal(`<div class="m-ico i-green">${ic('check','lg')}</div>
    <h2>Marcar como consumido?</h2>
    <p class="muted"><strong style="color:var(--ink)">${esc(p.nome)}</strong> sai da sua geladeira e entra no histórico como consumido a tempo.</p>
    <div class="modal-actions"><button class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-primary" id="ok-consume">Sim, consumi</button></div>`,
    m => $('#ok-consume', m).onclick = () => {
      const raw = PRODUCTS.find(x => x.id === id); raw.estado = 'consumido'; raw.quando = fmt(TODAY);
      closeModal(); toast(`${p.nome} marcado como consumido. Menos desperdício!`, 'leaf');
      after ? after() : renderView();
    });
}

