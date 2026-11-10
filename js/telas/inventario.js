/* ---------- Minha geladeira (listagem) ---------- */
let despState = {tab:'ativos', status:'all', cat:'all', q:'', sort:'limite'};
function viewDespensa(){
  const s = despState;
  const A = active();
  const H = PRODUCTS.filter(p => p.estado).map(enrich);
  let list = s.tab === 'ativos' ? A : H;
  if (s.tab === 'ativos' && s.status !== 'all') list = list.filter(p => s.status === 'warn' ? (p.restam >= 0 && p.restam <= 3) : p.st.k === s.status);
  if (s.cat !== 'all') list = list.filter(p => p.b.cat === s.cat);
  if (s.q) { const q = EW.normalizacao.limpar(s.q); list = list.filter(p => EW.normalizacao.limpar(p.nome + ' ' + p.marca + ' ' + p.b.item + ' ' + (p.ingrediente || '')).includes(q)); }
  list.sort(s.sort === 'nome' ? (a,b) => a.nome.localeCompare(b.nome) : s.sort === 'recentes' ? (a,b) => b.id - a.id : (a,b) => a.restam - b.restam);
  const cnt = k => A.filter(p => k === 'all' ? true : k === 'warn' ? (p.restam >= 0 && p.restam <= 3) : p.st.k === k).length;
  const stBtn = (k, n) => `<button class="chip" data-status="${k}" aria-pressed="${s.status===k}">${n} <span class="num" style="opacity:.7">${cnt(k)}</span></button>`;
  return `
  <div class="page-head">
    <div><h1>Inventário</h1><p>Tudo o que a Casa Oliveira tem em casa, com a data-limite de cada item. Cada item vira um ingrediente para as receitas.</p></div>
    <div class="actions"><button class="btn btn-ghost" id="add-item">${ic('plus','sm')} Adicionar item</button><button class="btn btn-primary" data-go="adicionar">${ic('camera','sm')} Registrar produto</button></div>
  </div>
  <div class="toolbar">
    <div class="tabs" role="tablist">
      <button role="tab" data-tab="ativos" aria-selected="${s.tab==='ativos'}">Em casa <span class="count num">${A.length}</span></button>
      <button role="tab" data-tab="hist" aria-selected="${s.tab==='hist'}">Histórico <span class="count num">${H.length}</span></button>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;flex:1;justify-content:flex-end">
      <div class="input-icon" style="min-width:0;flex:1;max-width:300px">${ic('search','sm')}<input class="input" id="d-q" placeholder="Buscar produto" value="${esc(s.q)}" style="border-radius:999px"></div>
      <select class="select" id="d-sort" style="width:auto;border-radius:999px" aria-label="Ordenar">
        <option value="limite" ${s.sort==='limite'?'selected':''}>Vence primeiro</option>
        <option value="recentes" ${s.sort==='recentes'?'selected':''}>Cadastrados recentemente</option>
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
  $('#add-item').onclick = () => modalNovoItem();
  $('#clear-f') && ($('#clear-f').onclick = () => { despState = {...despState, status:'all', cat:'all', q:''}; renderView(); });
}


/* ---------- Adicionar item livre (com validade da embalagem e/ou prazo depois de aberto) ---------- */
const UNIDADES = ['un', 'g', 'kg', 'ml', 'L', 'pacote', 'pote', 'lata', 'caixa', 'maço'];
function modalNovoItem(pre = {}, aoSalvar){
  modal(`
    <h2>Adicionar item</h2>
    <p class="muted">Ele entra no inventário e passa a contar como ingrediente disponível nas receitas.</p>
    <form id="ni-form" class="form-grid" novalidate>
      <div class="field full"><label for="ni-nome">Nome do alimento</label><input class="input" id="ni-nome" required placeholder="Ex.: tomate, peito de frango, arroz" value="${esc(pre.nome || '')}"></div>
      <p class="muted full" id="ni-ing" style="font-size:.88rem;margin-top:-6px"></p>
      <div class="field"><label for="ni-qtd">Quantidade (opcional)</label><input class="input" id="ni-qtd" type="number" min="0" step="any" inputmode="decimal" value="${pre.quantidade || ''}"></div>
      <div class="field"><label for="ni-un">Unidade</label><select class="select" id="ni-un">${UNIDADES.map(u => `<option ${u === (pre.unidade || 'un') ? 'selected' : ''}>${u}</option>`).join('')}</select></div>
      <div class="field full"><label for="ni-val">Validade da embalagem</label><input class="input" id="ni-val" type="date" value="${pre.validade || ''}">
        <small class="muted">Se deixar em branco, usamos um prazo típico para esse alimento.</small></div>
      <label class="check full"><input type="checkbox" id="ni-aberto" ${pre.aberto ? 'checked' : ''}> Já foi aberto ou cortado</label>
      <div class="field" data-aberto><label for="ni-open">Aberto em</label><input class="input" id="ni-open" type="date" value="${iso(TODAY)}" max="${iso(TODAY)}"></div>
      <div class="field" data-aberto><label for="ni-prazo">Dura depois de aberto (dias)</label><input class="input" id="ni-prazo" type="number" min="1" inputmode="numeric"></div>
      <div class="field full"><label for="ni-loc">Onde fica guardado?</label><select class="select" id="ni-loc"><option value="">Escolher automaticamente</option>${Object.entries(LOCS).map(([k, n]) => `<option value="${k}">${n}</option>`).join('')}</select></div>
    </form>
    <div class="modal-actions"><button class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-primary" id="ni-ok">${ic('check','sm')} Adicionar ao inventário</button></div>`,
  m => {
    const atualizar = () => {
      const chave = EW.normalizacao.normalizar($('#ni-nome', m).value);
      const ing = INGREDIENTES[chave];
      $('#ni-ing', m).innerHTML = chave ? `Nas receitas conta como: <strong>${esc(EW.normalizacao.rotulo(chave))}</strong>${ing ? '' : ' (alimento novo, sem prazo típico)'}` : '';
      const aberto = $('#ni-aberto', m).checked;
      $$('[data-aberto]', m).forEach(el => el.hidden = !aberto);
      if (aberto && !$('#ni-prazo', m).dataset.editado) $('#ni-prazo', m).value = (ing && ing.aberto) || 3;
    };
    $('#ni-prazo', m).addEventListener('input', e => e.target.dataset.editado = '1');
    ['input', 'change'].forEach(ev => { $('#ni-nome', m).addEventListener(ev, atualizar); $('#ni-aberto', m).addEventListener(ev, atualizar); });
    atualizar();
    $('#ni-ok', m).onclick = () => {
      const nome = $('#ni-nome', m).value.trim();
      if (!nome) { $('#ni-nome', m).focus(); toast('Escreva o nome do alimento', 'info'); return; }
      const item = EW.inventario.novoItem({
        nome, quantidade: Number($('#ni-qtd', m).value) || null, unidade: $('#ni-un', m).value,
        validade: $('#ni-val', m).value || null, aberto: $('#ni-aberto', m).checked,
        abertoEm: $('#ni-open', m).value, prazoAberto: $('#ni-prazo', m).value, loc: $('#ni-loc', m).value || null,
        via: pre.via || 'manual'
      });
      closeModal();
      if (aoSalvar) aoSalvar(item); else { renderView(); toast(`${item.nome} adicionado ao inventário`); }
    };
  });
}
