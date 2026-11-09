/* ---------- Minha geladeira (listagem) ---------- */
let despState = {tab:'ativos', status:'all', cat:'all', q:'', sort:'limite'};
function viewDespensa(){
  const s = despState;
  const A = active();
  const H = PRODUCTS.filter(p => p.estado).map(enrich);
  let list = s.tab === 'ativos' ? A : H;
  if (s.tab === 'ativos' && s.status !== 'all') list = list.filter(p => s.status === 'warn' ? (p.restam >= 0 && p.restam <= 3) : p.st.k === s.status);
  if (s.cat !== 'all') list = list.filter(p => p.b.cat === s.cat);
  if (s.q) list = list.filter(p => (p.nome + p.marca + p.b.item).toLowerCase().includes(s.q.toLowerCase()));
  list.sort(s.sort === 'nome' ? (a,b) => a.nome.localeCompare(b.nome) : s.sort === 'recentes' ? (a,b) => a.abertoHa - b.abertoHa : (a,b) => a.restam - b.restam);
  const cnt = k => A.filter(p => k === 'all' ? true : k === 'warn' ? (p.restam >= 0 && p.restam <= 3) : p.st.k === k).length;
  const stBtn = (k, n) => `<button class="chip" data-status="${k}" aria-pressed="${s.status===k}">${n} <span class="num" style="opacity:.7">${cnt(k)}</span></button>`;
  return `
  <div class="page-head">
    <div><h1>Minha geladeira</h1><p>Todos os produtos abertos da Casa Oliveira, com a segunda validade de cada um.</p></div>
    <button class="btn btn-primary" data-go="adicionar">${ic('plus','sm')} Registrar produto</button>
  </div>
  <div class="toolbar">
    <div class="tabs" role="tablist">
      <button role="tab" data-tab="ativos" aria-selected="${s.tab==='ativos'}">Abertos <span class="count num">${A.length}</span></button>
      <button role="tab" data-tab="hist" aria-selected="${s.tab==='hist'}">Histórico <span class="count num">${H.length}</span></button>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;flex:1;justify-content:flex-end">
      <div class="input-icon" style="min-width:0;flex:1;max-width:300px">${ic('search','sm')}<input class="input" id="d-q" placeholder="Buscar produto" value="${esc(s.q)}" style="border-radius:999px"></div>
      <select class="select" id="d-sort" style="width:auto;border-radius:999px" aria-label="Ordenar">
        <option value="limite" ${s.sort==='limite'?'selected':''}>Vence primeiro</option>
        <option value="recentes" ${s.sort==='recentes'?'selected':''}>Abertos recentemente</option>
        <option value="nome" ${s.sort==='nome'?'selected':''}>Nome (A–Z)</option>
      </select>
    </div>
  </div>
  ${s.tab === 'ativos' ? `<div class="chips">${stBtn('all','Todos')}${stBtn('warn','Vencem em até 3 dias')}${stBtn('ok','Em dia')}${stBtn('bad','Vencidos')}</div>` : ''}
  <div class="chips scroll" aria-label="Categorias">
    <button class="chip" data-cat="all" aria-pressed="${s.cat==='all'}">Todas as categorias</button>
    ${Object.entries(CATS).map(([k,c]) => `<button class="chip" data-cat="${k}" aria-pressed="${s.cat===k}">${c.nome}</button>`).join('')}
  </div>
  ${list.length ? `<div class="pgrid">${list.map(pcard).join('')}</div>` :
    `<div class="card empty"><span class="food">🧺</span><h3>Nenhum produto por aqui</h3><p>Ajuste os filtros ou registre um produto que você acabou de abrir.</p><button class="btn btn-soft btn-sm" id="clear-f">Limpar filtros</button></div>`}`;
}
function bindDespensa(){
  $$('[data-tab]').forEach(b => b.onclick = () => { despState.tab = b.dataset.tab; despState.status = 'all'; renderView(); });
  $$('[data-status]').forEach(b => b.onclick = () => { despState.status = b.dataset.status; renderView(); });
  $$('[data-cat]').forEach(b => b.onclick = () => { despState.cat = b.dataset.cat; renderView(); });
  $('#d-sort').onchange = e => { despState.sort = e.target.value; renderView(); };
  const q = $('#d-q');
  q.addEventListener('input', () => { despState.q = q.value; const pos = q.selectionStart; renderView(); const n = $('#d-q'); n.focus(); n.setSelectionRange(pos,pos); });
  $('#clear-f') && ($('#clear-f').onclick = () => { despState = {...despState, status:'all', cat:'all', q:''}; renderView(); });
}

