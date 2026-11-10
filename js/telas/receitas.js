/* ---------- Receitas: lista recomendada e detalhe ---------- */
let recState = {aba: 'recomendadas', refeicao: 'all', saudavel: false, rapida: false, agora: false, q: ''};
const AVISO_NUTRI = `<p class="aviso-nutri">${ic('info','sm')} As sugestões são informativas e não substituem a orientação de um nutricionista.</p>`;
const REFEICOES = ['Café da manhã', 'Almoço e jantar', 'Lanche', 'Sobremesa'];

// "Arte" da receita: ícones dos principais ingredientes
function arteReceita(receita, cls = ''){
  const principais = receita.ingredientes.filter(i => i.essencial && INGREDIENTES[i.ingrediente] && !INGREDIENTES[i.ingrediente].basico).slice(0, 3);
  return `<div class="rart ${cls}" aria-hidden="true">${principais.map(i => `<span>${INGREDIENTES[i.ingrediente].emoji}</span>`).join('')}</div>`;
}

function carregandoReceitas(){
  if (RECEITAS_ERRO) return `<div class="card empty"><span class="food">📖</span><h3>Não foi possível carregar as receitas</h3>
    <p>Abra o EatWise pelo endereço do site ou pelo pacote para baixar (arquivo único). Abrindo os arquivos soltos direto do computador, o navegador bloqueia a leitura do arquivo de receitas.</p></div>`;
  carregarReceitas().then(() => { if (route === 'receitas' || route === 'receita' || route === 'dashboard') renderView(); });
  return `<div class="card empty"><div class="spinner" aria-hidden="true"></div><p>Carregando receitas…</p></div>`;
}

function cardReceita(x){
  const r = x.receita;
  const total = x.tenho.length + x.falta.length;
  return `<button class="rcard" data-go="receita-${r.id}">
    ${arteReceita(r)}
    <div class="rbody">
      <div class="rtop"><strong>${esc(r.nome)}</strong><span class="score" title="Pontuação da recomendação">${x.pontuacao} pts</span></div>
      ${x.motivos[0] ? `<p class="rmotivo">${ic(x.vencendo.length ? 'clock' : 'spark','sm')} ${esc(x.motivos[0])}</p>` : ''}
      <div class="rmeta"><span>${ic('clock','sm')} ${r.tempo} min</span><span>${r.calorias} kcal/porção</span><span>${x.tenho.length}/${total} ingredientes</span>${r.saudavel ? `<span class="tag" style="background:var(--green-soft);color:var(--green)">${ic('leaf','sm')} saudável</span>` : ''}</div>
      ${x.essenciaisFaltando.length ? `<small class="rfalta">Falta: ${x.essenciaisFaltando.map(i => esc(EW.normalizacao.rotulo(i.ingrediente).toLowerCase())).join(', ')}</small>` : `<small class="rok">${ic('check','sm')} Você tem todos os essenciais</small>`}
    </div>
  </button>`;
}

function viewReceitas(){
  if (!RECEITAS.length) return `<div class="page-head"><div><h1>Receitas</h1></div></div>` + carregandoReceitas();
  const s = recState;
  const todas = recomendacoes();
  const disp = ingredientesDisponiveis();
  const vencendo = disp.filter(d => Number.isFinite(d.restam) && d.restam <= 3).sort((a, b) => a.restam - b.restam);
  let lista = s.aba === 'recomendadas' ? todas.filter(x => x.tenho.length > 0) : todas.slice().sort((a, b) => a.receita.nome.localeCompare(b.receita.nome));
  if (s.refeicao !== 'all') lista = lista.filter(x => x.receita.refeicao === s.refeicao);
  if (s.saudavel) lista = lista.filter(x => x.receita.saudavel);
  if (s.rapida) lista = lista.filter(x => x.receita.tempo <= 20);
  if (s.agora) lista = lista.filter(x => !x.essenciaisFaltando.length);
  if (s.q) { const q = EW.normalizacao.limpar(s.q); lista = lista.filter(x => EW.normalizacao.limpar(x.receita.nome + ' ' + x.receita.ingredientes.map(i => i.ingrediente).join(' ')).includes(q)); }
  const excluidas = RECEITAS.length - todas.length;
  const toggle = (k, n) => `<button class="chip" data-tg="${k}" aria-pressed="${s[k]}">${n}</button>`;
  return `
  <div class="page-head">
    <div><h1>O que cozinhar hoje?</h1><p>Receitas ordenadas pelo que você já tem em casa, dando prioridade ao que vence primeiro.</p></div>
    <button class="btn btn-ghost" data-go="adicionar">${ic('plus','sm')} Informar ingredientes</button>
  </div>
  <article class="card" style="display:grid;gap:10px">
    <p><strong>${disp.length} ingredientes disponíveis</strong>${vencendo.length ? ` · <span style="color:var(--terra);font-weight:700">${vencendo.length} vencendo em até 3 dias:</span> ${vencendo.slice(0, 5).map(v => esc(v.nome)).join(', ')}` : ''}</p>
    ${INFORMADOS.length ? `<div class="chips" aria-label="Ingredientes informados"><span class="muted" style="font-size:.85rem;font-weight:700;align-self:center">Também considerando:</span>${INFORMADOS.map(k => `<button class="chip" data-inf="${esc(k)}" aria-label="Retirar ${esc(EW.normalizacao.rotulo(k))}">${esc(EW.normalizacao.rotulo(k))} ${ic('x','sm')}</button>`).join('')}<button class="link-btn" id="inf-limpar">limpar</button></div>` : ''}
    ${PERFIL.restricoes.length || PERFIL.naoGosto.length ? `<p class="muted" style="font-size:.88rem">Seguindo seu perfil: ${PERFIL.restricoes.map(r => EW.recomendacao.RESTRICOES[r].nome.toLowerCase()).concat(PERFIL.naoGosto.length ? ['sem ' + PERFIL.naoGosto.map(k => EW.normalizacao.rotulo(k).toLowerCase()).join(', ')] : []).join(' · ')}${excluidas ? ` (${excluidas} receitas ocultas)` : ''}. <button class="link-btn" data-go="perfil">Alterar</button></p>` : ''}
  </article>
  <div class="toolbar">
    <div class="tabs" role="tablist">
      <button role="tab" data-raba="recomendadas" aria-selected="${s.aba === 'recomendadas'}">Recomendadas</button>
      <button role="tab" data-raba="todas" aria-selected="${s.aba === 'todas'}">Todas <span class="count num">${todas.length}</span></button>
    </div>
    <div class="input-icon" style="flex:1;max-width:300px;min-width:0">${ic('search','sm')}<input class="input" id="r-q" placeholder="Buscar receita ou ingrediente" value="${esc(s.q)}" style="border-radius:999px"></div>
  </div>
  <div class="chips scroll" aria-label="Filtros">
    <button class="chip" data-ref="all" aria-pressed="${s.refeicao === 'all'}">Todas as refeições</button>
    ${REFEICOES.map(r => `<button class="chip" data-ref="${r}" aria-pressed="${s.refeicao === r}">${r}</button>`).join('')}
    ${toggle('agora', 'Posso fazer agora')}${toggle('saudavel', 'Só saudáveis')}${toggle('rapida', 'Até 20 min')}
  </div>
  ${lista.length ? `<div class="rgrid">${lista.map(cardReceita).join('')}</div>` :
    `<div class="card empty"><span class="food">🍳</span><h3>Nenhuma receita com esses filtros</h3><p>Tente tirar um filtro ou informe mais ingredientes que você tem em casa.</p></div>`}
  ${AVISO_NUTRI}`;
}

function bindReceitas(){
  if (!RECEITAS.length) return;
  $$('[data-raba]').forEach(b => b.onclick = () => { recState.aba = b.dataset.raba; renderView(); });
  $$('[data-ref]').forEach(b => b.onclick = () => { recState.refeicao = b.dataset.ref; renderView(); });
  $$('[data-tg]').forEach(b => b.onclick = () => { recState[b.dataset.tg] = !recState[b.dataset.tg]; renderView(); });
  $$('[data-inf]').forEach(b => b.onclick = () => { INFORMADOS = INFORMADOS.filter(k => k !== b.dataset.inf); renderView(); });
  $('#inf-limpar') && ($('#inf-limpar').onclick = () => { INFORMADOS = []; renderView(); });
  const q = $('#r-q');
  q.addEventListener('input', () => { recState.q = q.value; const pos = q.selectionStart; renderView(); const n = $('#r-q'); n.focus(); n.setSelectionRange(pos, pos); });
}

/* ---------- Detalhe da receita ---------- */
function viewReceita(){
  if (!RECEITAS.length) return carregandoReceitas();
  const receita = RECEITAS.find(r => r.id === param);
  if (!receita) return `<div class="card empty"><span class="food">🔍</span><h3>Receita não encontrada</h3><button class="btn btn-primary" data-go="receitas">Ver receitas</button></div>`;
  const disp = ingredientesDisponiveis();
  let x = EW.recomendacao.avaliar(receita, disp, PERFIL);
  const bloqueada = !x;
  if (bloqueada) x = EW.recomendacao.avaliar(receita, disp, {});
  const st = i => {
    if (x.removidos.find(r => r.ingrediente === i.ingrediente)) return {cls: 'off', txt: `retirado (${x.removidos.find(r => r.ingrediente === i.ingrediente).motivo})`};
    if (x.basicos.find(r => r.ingrediente === i.ingrediente)) return {cls: 'basico', txt: 'básico de despensa'};
    const t = x.tenho.find(r => r.ingrediente === i.ingrediente);
    if (t) return {cls: 'tem', txt: 'tenho' + (Number.isFinite(t.restam) && t.restam <= 3 ? ` · ${t.restam <= 0 ? 'vence hoje' : t.restam === 1 ? 'vence amanhã' : `vence em ${t.restam} dias`}` : '')};
    return {cls: i.essencial ? 'falta' : 'falta-op', txt: i.essencial ? 'falta' : 'opcional · não tenho'};
  };
  return `
  <div class="page-head"><div><button class="back-link" data-go="receitas">${ic('left','sm')} Receitas</button></div></div>
  ${bloqueada ? `<div class="card" style="background:var(--terra-soft);border-color:transparent"><strong>Esta receita não combina com o seu perfil.</strong> Ela tem ingrediente essencial que você marcou como restrição ou que não gosta.</div>` : ''}
  <div class="detail-grid">
    <div class="stack">
      <article class="card" style="display:grid;gap:14px">
        <div class="rhead">${arteReceita(receita, 'lg')}
          <div style="min-width:0;display:grid;gap:6px">
            <p class="eyebrow">${receita.refeicao}</p>
            <h1 style="font-size:1.7rem">${esc(receita.nome)}</h1>
            <div class="rmeta"><span>${ic('clock','sm')} ${receita.tempo} min</span><span>${receita.porcoes} ${receita.porcoes === 1 ? 'porção' : 'porções'}</span><span>${receita.dificuldade}</span><span>≈ ${receita.calorias} kcal por porção</span></div>
            <div class="chips">${receita.saudavel ? `<span class="tag" style="background:var(--green-soft);color:var(--green)">${ic('leaf','sm')} saudável</span>` : ''}${receita.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
          </div>
        </div>
        ${!bloqueada && x.motivos.length ? `<div class="why"><p class="eyebrow">${ic('spark','sm')} Por que recomendamos</p><ul>${x.motivos.map(m => `<li>${esc(m)}</li>`).join('')}</ul></div>` : ''}
      </article>
      <article class="card">
        <h2 style="margin-bottom:12px">Modo de preparo</h2>
        <ol class="preparo">${receita.preparo.map(p => `<li>${esc(p)}</li>`).join('')}</ol>
      </article>
    </div>
    <div class="stack">
      <article class="card">
        <div class="card-head" style="margin-bottom:10px"><h2>Ingredientes</h2><span class="muted" style="font-size:.85rem">${x.tenho.length} de ${x.tenho.length + x.falta.length} em casa</span></div>
        <ul class="ilist">${receita.ingredientes.map(i => { const s = st(i); return `<li class="${s.cls}">
          <span class="ist" aria-hidden="true">${s.cls === 'tem' ? ic('check','sm') : s.cls === 'falta' ? ic('x','sm') : '•'}</span>
          <span><strong>${esc(EW.normalizacao.rotulo(i.ingrediente))}</strong> <span class="muted">${esc(i.quantidade || '')}</span>${i.essencial ? '' : ' <span class="muted">(opcional)</span>'}<br><small>${s.txt}</small></span></li>`; }).join('')}</ul>
      </article>
      ${bloqueada ? '' : `<article class="card" style="display:grid;gap:10px">
        <h3>Fez a receita?</h3>
        <p class="muted" style="font-size:.92rem">Damos baixa nos ingredientes usados no seu inventário. Você pode ajustar o que sobrou.</p>
        <button class="btn btn-primary btn-block" id="fiz">${ic('check','sm')} Fiz esta receita</button>
      </article>`}
      ${AVISO_NUTRI}
    </div>
  </div>`;
}

function bindReceita(){
  const receita = RECEITAS.find(r => r.id === param);
  if (!receita || !$('#fiz')) return;
  $('#fiz').onclick = () => modalFizReceita(receita);
}

/* ---------- "Fiz esta receita": baixa no inventário ---------- */
function modalFizReceita(receita){
  const x = EW.recomendacao.avaliar(receita, ingredientesDisponiveis(), PERFIL) || EW.recomendacao.avaliar(receita, ingredientesDisponiveis(), {});
  // para cada ingrediente que tenho, o item do inventário que vence primeiro
  const itens = x.tenho.map(t => active().filter(p => p.ingrediente === t.ingrediente && p.restam >= 0).sort((a, b) => a.restam - b.restam)[0]).filter(Boolean);
  if (!itens.length) {
    HISTORICO.push({receita: receita.id, nome: receita.nome, data: iso(TODAY), itens: []});
    salvarEstado(); toast('Receita registrada! Os ingredientes informados não estavam no inventário.', 'leaf'); return;
  }
  // padrão sugerido: "usei tudo" se vence em até 3 dias ou se é 1 unidade ou menos; senão "sobrou"
  const padrao = itens.map(p => (p.restam <= 3 || (p.quantidade !== null && p.quantidade !== undefined && p.quantidade <= 1 && (p.unidade || 'un') === 'un')) ? 'tudo' : 'sobrou');
  modal(`
    <h2>Fiz esta receita</h2>
    <p class="muted">Para cada ingrediente, diga se usou tudo ou se ainda sobrou.</p>
    <ul class="baixa">${itens.map((p, i) => `<li>
      <div style="display:flex;gap:10px;align-items:center">${foodTile(p.k)}<div style="min-width:0"><strong>${esc(p.nome)}</strong><br><small class="muted">${p.restam <= 3 ? `<span style="color:var(--terra);font-weight:700">${restamTxt(p.restam)}</span>` : restamTxt(p.restam)}${p.quantidade ? ` · ${p.quantidade} ${p.unidade}` : ''}</small></div></div>
      <div class="chips" data-single data-bx="${i}">
        <button type="button" class="chip" data-v="tudo" aria-pressed="${padrao[i] === 'tudo'}">Usei tudo</button>
        <button type="button" class="chip" data-v="sobrou" aria-pressed="${padrao[i] === 'sobrou'}">Sobrou</button>
        <button type="button" class="chip" data-v="nao" aria-pressed="false">Não usei</button>
      </div>
      <div class="field" data-sobra="${i}" ${padrao[i] === 'sobrou' ? '' : 'hidden'}><label for="bx-q-${i}">Quanto sobrou${p.unidade ? ` (${p.unidade})` : ''}?</label><input class="input" id="bx-q-${i}" type="number" min="0" step="any" inputmode="decimal" value="${p.quantidade ? Math.round(p.quantidade / 2 * 10) / 10 : ''}" placeholder="opcional"></div>
    </li>`).join('')}</ul>
    <div class="modal-actions"><button class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-primary" id="bx-ok">${ic('check','sm')} Confirmar baixa</button></div>`,
  m => {
    bindChips(m);
    const escolha = padrao.slice();
    $$('[data-bx]', m).forEach(g => g.addEventListener('pick', e => {
      const i = Number(g.dataset.bx); escolha[i] = $('[aria-pressed="true"]', g).dataset.v;
      $(`[data-sobra="${i}"]`, m).hidden = escolha[i] !== 'sobrou';
    }));
    $('#bx-ok', m).onclick = () => {
      let usados = 0, antes = 0;
      const registro = [];
      itens.forEach((p, i) => {
        const raw = PRODUCTS.find(r => r.id === p.id);
        if (escolha[i] === 'tudo') {
          raw.estado = 'consumido'; raw.quando = fmt(TODAY); raw.usadoEm = receita.id;
          usados++; if (p.restam >= 0) antes++;
          registro.push({id: p.id, nome: p.nome, consumido: true, antesDeVencer: p.restam >= 0});
        } else if (escolha[i] === 'sobrou') {
          const q = $('#bx-q-' + i, m).value;
          if (q !== '') raw.quantidade = Number(q);
          registro.push({id: p.id, nome: p.nome, consumido: false, sobrou: q === '' ? null : Number(q)});
        }
      });
      HISTORICO.push({receita: receita.id, nome: receita.nome, data: iso(TODAY), itens: registro});
      closeModal();
      go('receitas');
      setTimeout(() => toast(usados ? `Bom apetite! ${antes} ${antes === 1 ? 'item usado' : 'itens usados'} antes de vencer.` : 'Receita registrada. O inventário foi atualizado.', 'leaf'), 120);
    };
  });
}
