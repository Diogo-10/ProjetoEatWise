/* ---------- Adicionar ingredientes: texto, foto dos alimentos e produto embalado ---------- */
let addMode = 'texto';
let txtState = {texto: '', itens: null};
// ingredientes informados por texto/imagem para a recomendação (sem precisar entrar no inventário)
let INFORMADOS = EW.armazenamento.ler('informados', []);

const UNIDADES_CONF = ['', 'un', 'g', 'kg', 'ml', 'L', 'pacote', 'lata', 'caixa', 'pote', 'vidro', 'dente', 'maço', 'fatia', 'xícara', 'colher', 'cabeça', 'bandeja'];
const EXEMPLOS_TEXTO = ['2 ovos, tomate, arroz e queijo', 'meio quilo de frango, batata, cenoura e cebola', 'banana, aveia, leite e mel'];

function viewAdd(){
  const modo = (k, n, i) => `<button role="tab" data-mode="${k}" aria-selected="${addMode === k}">${ic(i, 'sm')} ${n}</button>`;
  const corpo = addMode === 'texto' ? viewAddTexto() : addMode === 'imagem' ? viewAddImagem() : viewAddEmbalagem();
  return `
  <div class="page-head"><div><button class="back-link" data-go="dashboard">${ic('left','sm')} Início</button>
    <h1 style="margin-top:8px">Adicionar ingredientes</h1>
    <p>Conte o que você tem em casa escrevendo, mostre numa foto ou registre um produto embalado que acabou de abrir.</p></div></div>
  <div class="tabs" role="tablist" aria-label="Como adicionar" style="justify-self:start">
    ${modo('texto', 'Escrever', 'type')}${modo('imagem', 'Foto dos alimentos', 'camera')}${modo('embalagem', 'Produto embalado', 'box')}
  </div>
  ${corpo}`;
}

function bindAdd(){
  $$('[data-mode]').forEach(b => b.onclick = () => { addMode = b.dataset.mode; renderView(); });
  if (addMode === 'texto') bindAddTexto();
  else if (addMode === 'imagem') bindAddImagem();
  else bindAddEmbalagem();
}

/* ---------- Escrever ---------- */
function viewAddTexto(){
  return `
  <article class="card" style="display:grid;gap:14px">
    <div class="field"><label for="tx-in" style="font-size:1rem">O que você tem em casa?</label>
      <textarea class="input" id="tx-in" rows="3" placeholder="Ex.: 2 ovos, 3 tomates, arroz, meio quilo de frango e queijo">${esc(txtState.texto)}</textarea>
      <small class="muted">Separe por vírgula ou “e”. Pode escrever quantidades como “meio quilo”, “uma dúzia” ou “2 latas”.</small></div>
    <div class="chips" aria-label="Exemplos"><span class="muted" style="font-size:.85rem;font-weight:700;align-self:center">Exemplos:</span>
      ${EXEMPLOS_TEXTO.map((e, i) => `<button class="chip" type="button" data-ex="${i}">${esc(e)}</button>`).join('')}</div>
    <div class="actions"><button class="btn btn-primary" id="tx-go">${ic('spark','sm')} Reconhecer ingredientes</button></div>
  </article>
  ${txtState.itens ? viewConfirmacao(txtState.itens) : ''}`;
}
function bindAddTexto(){
  const campo = $('#tx-in');
  campo.addEventListener('input', () => txtState.texto = campo.value);
  $$('[data-ex]').forEach(c => c.onclick = () => { campo.value = txtState.texto = EXEMPLOS_TEXTO[c.dataset.ex]; campo.focus(); });
  $('#tx-go').onclick = () => {
    const itens = EW.texto.interpretar(campo.value);
    if (!itens.length) { toast('Escreva pelo menos um ingrediente, por exemplo “tomate e arroz”.', 'info'); campo.focus(); return; }
    txtState.itens = itens;
    renderView();
    $('#confirm') && $('#confirm').scrollIntoView({behavior: 'smooth', block: 'start'});
  };
  if (txtState.itens) bindConfirmacao(txtState.itens, 'texto', () => { txtState = {texto: '', itens: null}; });
}

/* ---------- Confirmação (usada por texto e por imagem) ---------- */
function dicaIngrediente(item){
  if (!item.ingrediente) return '<span style="color:var(--terra)">escreva o nome</span>';
  const base = INGREDIENTES[item.ingrediente];
  return `conta como <strong>${esc(EW.normalizacao.rotulo(item.ingrediente))}</strong>` +
    (base ? (base.basico ? ' · item básico de despensa' : '') : ' · alimento novo (vale para receitas que o usam)');
}
function viewConfirmacao(itens, titulo = 'Confira os ingredientes'){
  return `
  <article class="card" id="confirm" style="display:grid;gap:14px">
    <div><h2>${titulo}</h2><p class="muted" style="margin-top:4px">Reconhecemos ${itens.length} ${itens.length === 1 ? 'item' : 'itens'}. Corrija o nome ou a quantidade e remova o que não estiver certo.</p></div>
    <ul class="confirm-list">
      ${itens.map((it, i) => `<li class="crow">
        ${foodTile('ing:' + it.ingrediente)}
        <div class="cname"><input class="input" id="c-nome-${i}" data-i="${i}" data-f="nome" value="${esc(it.nome)}" aria-label="Nome do ingrediente ${i + 1}">
          <small class="muted" id="c-dica-${i}">${dicaIngrediente(it)}${it.confianca ? ` · ${it.confianca}% de confiança` : ''}</small></div>
        <input class="input cqty" id="c-q-${i}" data-i="${i}" data-f="quantidade" type="number" min="0" step="any" inputmode="decimal" value="${it.quantidade ?? ''}" placeholder="Qtd." aria-label="Quantidade">
        <select class="select cun" id="c-u-${i}" data-i="${i}" data-f="unidade" aria-label="Unidade">${UNIDADES_CONF.map(u => `<option value="${u}" ${u === it.unidade ? 'selected' : ''}>${u || '—'}</option>`).join('')}</select>
        <button class="icon-btn" type="button" data-rm="${i}" aria-label="Remover ${esc(it.nome)}">${ic('x','sm')}</button>
      </li>`).join('')}
    </ul>
    <button class="link-btn" type="button" id="c-add" style="justify-self:start">${ic('plus','sm')} Adicionar outro ingrediente</button>
    <div class="actions">
      <button class="btn btn-primary" id="c-receitas">${ic('book','sm')} Ver receitas com estes ingredientes</button>
      <button class="btn btn-ghost" id="c-inv">${ic('box','sm')} Adicionar ao inventário</button>
    </div>
  </article>`;
}
function bindConfirmacao(itens, origem, aoConcluir){
  $$('#confirm [data-f]').forEach(el => el.addEventListener('input', () => {
    const it = itens[el.dataset.i];
    if (el.dataset.f === 'nome') { it.nome = el.value; it.ingrediente = EW.normalizacao.normalizar(el.value); $('#c-dica-' + el.dataset.i).innerHTML = dicaIngrediente(it); }
    else if (el.dataset.f === 'quantidade') it.quantidade = el.value === '' ? null : Number(el.value);
    else it.unidade = el.value;
  }));
  $$('[data-rm]').forEach(b => b.onclick = () => { itens.splice(Number(b.dataset.rm), 1); renderView(); });
  $('#c-add').onclick = () => { itens.push({nome: '', ingrediente: '', quantidade: null, unidade: ''}); renderView(); $('#c-nome-' + (itens.length - 1)).focus(); };
  const validos = () => itens.filter(i => i.ingrediente);
  $('#c-receitas').onclick = () => {
    const v = validos(); if (!v.length) { toast('Nenhum ingrediente na lista', 'info'); return; }
    v.forEach(i => { if (!INFORMADOS.includes(i.ingrediente)) INFORMADOS.push(i.ingrediente); });
    aoConcluir && aoConcluir();
    go('receitas');
  };
  $('#c-inv').onclick = () => {
    const v = validos(); if (!v.length) { toast('Nenhum ingrediente na lista', 'info'); return; }
    v.forEach(i => EW.inventario.novoItem({nome: i.nome || EW.normalizacao.rotulo(i.ingrediente), ingrediente: i.ingrediente, quantidade: i.quantidade, unidade: i.unidade, via: origem}));
    aoConcluir && aoConcluir();
    despState.tab = 'ativos'; despState.sort = 'recentes';
    go('despensa');
    setTimeout(() => toast(`${v.length} ${v.length === 1 ? 'item adicionado' : 'itens adicionados'} ao inventário. Confira as validades estimadas.`), 120);
  };
}

/* ---------- Foto dos alimentos (implementada na etapa de imagem) ---------- */
function viewAddImagem(){
  return `<article class="card empty"><span class="food">📷</span><h3>Em breve</h3><p>Aqui você vai poder fotografar os alimentos para o app reconhecer os ingredientes.</p></article>`;
}
function bindAddImagem(){}
