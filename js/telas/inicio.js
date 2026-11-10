/* ---------- Dashboard ---------- */
/* Indicador de desperdício evitado: itens usados antes de vencer x descartados */
function desperdicioEvitado(){
  const usados = PRODUCTS.filter(p => p.estado === 'consumido').length;
  const descartados = PRODUCTS.filter(p => p.estado === 'descartado').length;
  return {usados, descartados, receitas: HISTORICO.length, taxa: usados + descartados ? Math.round(usados / (usados + descartados) * 100) : 0};
}

function viewDashboard(){
  const A = active().sort((a,b) => a.restam - b.restam);
  const soon = A.filter(p => EW.validade.vencendo(p.restam));
  const bad = A.filter(p => p.restam < 0);
  const atencao = A.filter(p => p.restam <= 3);
  const ev = desperdicioEvitado();
  const wd = WEEK[TODAY.getDay()];
  const hora = new Date().getHours();
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';
  let sugestoes = '';
  if (!RECEITAS.length) sugestoes = carregandoReceitas();
  else {
    const recs = recomendacoes();
    const comVencendo = recs.filter(x => x.vencendo.length);
    const top = (comVencendo.length ? comVencendo : recs).slice(0, 3);
    sugestoes = top.length ? `<div class="rgrid" style="grid-template-columns:1fr">${top.map(cardReceita).join('')}</div>` : '<p class="muted">Adicione ingredientes para receber sugestões.</p>';
  }
  return `
  <section class="welcome">
    <div style="display:grid;gap:10px">
      <p class="eyebrow">${wd}, ${TODAY.getDate()} de ${MONTHS[TODAY.getMonth()]}</p>
      <h1>${saudacao}, ${USER.primeiro}!</h1>
      <p class="muted" style="max-width:56ch">${soon.length ? `Você tem <strong style="color:var(--terra)">${soon.length} ${soon.length === 1 ? 'item que vence' : 'itens que vencem'}</strong> nos próximos 3 dias.` : 'Nada vencendo nos próximos dias.'}${bad.length ? ` E <strong style="color:var(--terra)">${bad.length} vencido${bad.length > 1 ? 's' : ''}</strong> esperando decisão.` : ''} Veja abaixo o que dá para cozinhar com eles.</p>
      <div class="actions" style="margin-top:6px">
        <button class="btn btn-primary" data-addmode="texto">${ic('type','sm')} Escrever o que tenho</button>
        <button class="btn btn-ghost" data-addmode="imagem">${ic('camera','sm')} Foto dos alimentos</button>
      </div>
    </div>
    ${ILL_JAR}
  </section>

  <section class="stats" aria-label="Resumo">
    <button class="stat" data-go="despensa"><span class="top">Itens em casa <span class="ico i-green">${ic('box','sm')}</span></span><span class="val num">${A.length}</span><small>no inventário</small></button>
    <button class="stat" data-filter="warn"><span class="top">Vencem em até 3 dias <span class="ico i-orange">${ic('clock','sm')}</span></span><span class="val num">${soon.length}</span><small>use primeiro</small></button>
    <button class="stat" data-filter="bad"><span class="top">Vencidos <span class="ico i-terra">${ic('alert','sm')}</span></span><span class="val num">${bad.length}</span><small>aguardando decisão</small></button>
    <button class="stat" data-go="impacto"><span class="top">Desperdício evitado <span class="ico i-olive">${ic('leaf','sm')}</span></span><span class="val num">${ev.usados}</span><small>${ev.usados === 1 ? 'item usado' : 'itens usados'} antes de vencer</small></button>
  </section>

  <div class="dash-grid">
    <div class="stack">
      <article class="card">
        <div class="card-head"><div><h2>Sugestões do dia</h2><p class="muted" style="font-size:.9rem">Receitas que aproveitam o que vence primeiro</p></div><button class="link-btn" data-go="receitas">Ver todas</button></div>
        ${sugestoes}
        ${AVISO_NUTRI}
      </article>
      <article class="card">
        <div class="card-head"><div><h2>Vencendo em breve</h2><p class="muted" style="font-size:.9rem">Itens vencidos ou que vencem em até 3 dias</p></div><button class="link-btn" data-go="despensa">Inventário</button></div>
        <div class="list" id="soon-list">${atencao.length ? atencao.slice(0, 8).map(p => row(p, true)).join('') : '<p class="muted">Nenhum item vencendo. Muito bem!</p>'}</div>
      </article>
    </div>
    <div class="stack">
      <article class="card">
        <h2 style="margin-bottom:12px">Adicionar ingredientes</h2>
        <div class="atalhos">
          <button class="atalho" data-addmode="texto"><span class="ico i-green">${ic('type')}</span><span><strong>Escrever</strong><small>“2 ovos, tomate e arroz”</small></span></button>
          <button class="atalho" data-addmode="imagem"><span class="ico i-orange">${ic('camera')}</span><span><strong>Foto dos alimentos</strong><small>O app reconhece frutas e legumes</small></span></button>
          <button class="atalho" data-addmode="embalagem"><span class="ico i-yellow">${ic('box')}</span><span><strong>Produto embalado</strong><small>Rótulo, código de barras ou áudio</small></span></button>
        </div>
      </article>
      <article class="card">
        <div class="card-head"><h2>Desperdício evitado</h2><button class="link-btn" data-go="impacto">Detalhes</button></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
          <div><p class="muted" style="font-size:.85rem">Usados antes de vencer</p><p class="num" style="font-family:var(--font-display);font-size:1.7rem;font-weight:800;color:var(--green)">${ev.usados}</p></div>
          <div><p class="muted" style="font-size:.85rem">Descartados</p><p class="num" style="font-family:var(--font-display);font-size:1.7rem;font-weight:800;color:var(--terra)">${ev.descartados}</p></div>
          <div><p class="muted" style="font-size:.85rem">Receitas feitas</p><p class="num" style="font-family:var(--font-display);font-size:1.3rem;font-weight:800">${ev.receitas}</p></div>
          <div><p class="muted" style="font-size:.85rem">Aproveitamento</p><p class="num" style="font-family:var(--font-display);font-size:1.3rem;font-weight:800">${ev.taxa}%</p></div>
        </div>
      </article>
      <article class="card tip">
        <p class="eyebrow">${ic('spark','sm')} Dica de conservação</p>
        <h3 style="margin:8px 0 6px">Molho de tomate não fica na embalagem aberta</h3>
        <p class="muted" style="font-size:.92rem">Passe o que sobrou para um pote de vidro com tampa e guarde na parte de dentro da geladeira.</p>
        <button class="link-btn" data-go="prazos" style="margin-top:10px">Consultar base de prazos</button>
      </article>
    </div>
  </div>`;
}
function bindDashboard(){
  $$('[data-addmode]').forEach(b => b.onclick = () => { addMode = b.dataset.addmode; go('adicionar'); });
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

