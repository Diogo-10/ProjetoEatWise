/* ---------- Detalhe do produto ---------- */
const TIPS_GERAL = ['Guarde em pote fechado e na parte de dentro da geladeira.', 'Use talher limpo a cada vez.', 'Na dúvida sobre cheiro, cor ou textura, não consuma.'];
const TIPS = {
  lat:['Guarde nas prateleiras de dentro, nunca na porta: a temperatura varia demais ali.','Use sempre talher limpo para não contaminar o restante.','Mantenha a tampa ou embalagem bem fechada depois de cada uso.'],
  mol:['Use uma colher limpa a cada vez que servir.','Se mudar de cor, cheiro ou textura antes do prazo, descarte.','Molhos à base de ovo devem voltar à geladeira logo após o uso.'],
  emb:['Mantenha as fatias na embalagem original bem vedada ou em pote fechado.','Fatias com aspecto pegajoso ou cheiro ácido devem ser descartadas.','Não deixe fora da geladeira por mais de 2 horas.'],
  con:['Mantenha o alimento sempre coberto pelo líquido da conserva.','Nunca guarde na lata aberta: transfira para um pote de vidro.','Use garfo limpo para retirar as porções.'],
  doc:['Use colher limpa e seca para não criar fungos.','Guarde na geladeira depois de aberto.','Manchas brancas ou esverdeadas indicam que o produto deve ir para o lixo.']
};
function viewProduto(){
  const raw = PRODUCTS.find(x => x.id === param);
  if (!raw) return `<div class="card empty"><span class="food">🔍</span><h3>Produto não encontrado</h3><button class="btn btn-primary" data-go="despensa">Voltar para a geladeira</button></div>`;
  const p = enrich(raw);
  const alertDay = addDays(p.limite, -p.alerta);
  const ringC = {ok:'var(--green)', warn:'var(--orange)', today:'var(--yellow)', bad:'var(--terra)', done:'var(--olive)'}[p.st.k];
  const alertPassed = TODAY >= alertDay, limitPassed = p.restam < 0;
  return `
  <div class="page-head">
    <div><button class="back-link" data-go="despensa">${ic('left','sm')} Minha geladeira</button></div>
    ${p.estado ? '' : `<div class="actions"><button class="btn btn-ghost btn-sm" id="p-edit">${ic('edit','sm')} Editar</button><button class="btn btn-ghost btn-sm" id="p-del">${ic('trash','sm')} Excluir</button></div>`}
  </div>
  <div class="detail-grid">
    <div class="stack">
      <article class="card">
        <div class="prod-hero">
          ${foodTile(p.k,'lg')}
          <div style="min-width:0;display:grid;gap:6px">
            <span class="pill ${p.st.cls}" style="justify-self:start">${p.st.label}</span>
            <h1 style="font-size:1.7rem">${esc(p.nome)}</h1>
            <p class="muted">${esc(p.marca)}</p>
            <div class="chips"><span class="tag">${p.cat.nome}</span><span class="tag">${ic('thermo','sm')} ${LOCS[p.loc]}</span><span class="tag">${ic((METHODS[p.via] || METHODS.manual).i,'sm')} via ${(METHODS[p.via] || METHODS.manual).n.toLowerCase()}</span>${p.ingrediente ? `<span class="tag">ingrediente: ${esc(EW.normalizacao.rotulo(p.ingrediente))}</span>` : ''}</div>
          </div>
          <div class="ring" style="--p:${p.estado ? 100 : Math.round(p.frac*100)};--c:${ringC}"><div><span>${p.estado ? `<b style="font-size:1.4rem">${ic(p.estado==='consumido'?'check':'trash','lg')}</b><small>${p.estado}</small>` : p.restam < 0 ? `<b class="num" style="color:var(--terra)">${-p.restam}</b><small>dia(s) vencido</small>` : `<b class="num">${p.restam}</b><small>${p.restam===1?'dia restante':'dias restantes'}</small>`}</span></div></div>
        </div>
      </article>

      <article class="card">
        <h2 style="margin-bottom:20px">${p.aberto ? 'Linha do tempo da segunda validade' : 'Linha do tempo da validade'}</h2>
        <div class="timeline">
          <div class="tl done"><span class="ico">${ic('box','sm')}</span><strong>${p.aberto ? 'Aberto' : 'Cadastrado'}</strong><small class="num">${p.aberto ? fmtFull(p.aberto) : p.criadoEm ? fmtFull(new Date(p.criadoEm + 'T00:00:00')) : '—'}</small><small>por ${p.quem}</small></div>
          <div class="tl ${alertPassed ? 'warn' : ''}"><span class="ico">${ic('bell','sm')}</span><strong>Alerta</strong><small class="num">${fmtFull(alertDay)}</small><small>${p.alerta} ${p.alerta===1?'dia':'dias'} antes</small></div>
          <div class="tl ${limitPassed ? 'bad' : ''}"><span class="ico">${ic('cal','sm')}</span><strong>Data-limite</strong><small class="num">${fmtFull(p.limite)}</small><small>${p.origemLimite === 'aberto' ? `${p.prazoAberto} dias após aberto` : p.validadeEstimada ? 'validade estimada' : 'validade da embalagem'}</small></div>
        </div>
      </article>

      ${p.estado ? `<article class="card" style="background:var(--sand);border-color:transparent"><h3>${p.estado === 'consumido' ? 'Consumido a tempo' : 'Descartado'} em ${p.quando}</h3><p class="muted" style="margin-top:6px">${p.estado === 'consumido' ? 'Esse item conta como desperdício evitado no seu relatório de impacto.' : 'Motivo: ' + (p.motivo || 'não informado') + '. Esse item entra no relatório de desperdício do mês.'}</p></article>` : `
      <article class="card">
        <h2 style="margin-bottom:6px">O que você fez com ele?</h2>
        <p class="muted" style="margin-bottom:16px">Atualizar o status ajuda a medir quanto desperdício a sua casa está evitando.</p>
        <div class="actions">
          <button class="btn btn-primary" id="p-consume">${ic('check','sm')} Consumi tudo</button>
          <button class="btn btn-danger-soft" id="p-discard">${ic('trash','sm')} Precisei descartar</button>
          <button class="btn btn-ghost" id="p-remind">${ic('bell','sm')} Lembrar amanhã</button>
        </div>
      </article>`}
    </div>

    <div class="stack">
      <article class="card">
        <h3 style="margin-bottom:14px;display:flex;gap:8px;align-items:center">${ic('db','sm')} Como calculamos</h3>
        <dl class="kv">
          <dt>Categoria</dt><dd>${p.cat.nome}</dd>
          <dt>Produto</dt><dd>${p.c ? `${p.b.item} · ${p.b.marca}` : esc(p.nome)}</dd>
          ${p.validade ? `<dt>Validade ${p.validadeEstimada ? 'estimada' : 'da embalagem'}</dt><dd class="num">${fmtFull(new Date(p.validade + 'T00:00:00'))}</dd>` : ''}
          ${p.aberto ? `<dt>Prazo pós-abertura</dt><dd class="num">${p.prazoAberto} dias</dd>` : ''}
          ${p.aberto && p.validade ? `<dt>Regra</dt><dd>Vale a data que vencer primeiro (${p.origemLimite === 'aberto' ? 'a do prazo depois de aberto' : 'a da embalagem'})</dd>` : ''}
          <dt>Conservação</dt><dd>${p.b.cons}</dd>
          <dt>Fonte</dt><dd>${p.b.url ? `<a href="${p.b.url}" target="_blank" rel="noopener">${p.b.fonte}</a>` : p.b.fonte}</dd>
        </dl>
        ${p.b.orient ? `<blockquote class="label-quote" style="margin-top:14px">${p.b.doRotulo ? 'No rótulo' : 'Orientação'}: “${p.b.orient}”</blockquote>` : ''}
      </article>
      ${raw.foto ? `<article class="card"><h3 style="margin-bottom:12px;display:flex;gap:8px;align-items:center">${ic('camera','sm')} Sua foto do produto</h3><img class="user-photo" src="${raw.foto}" alt="Foto tirada por ${p.quem}"><p class="muted" style="font-size:.85rem;margin-top:8px">Tirada em ${fmtFull(p.aberto || TODAY)} por ${p.quem}</p></article>` : ''}
      <article class="card tip">
        <p class="eyebrow">${ic('leaf','sm')} Dicas para durar até o fim</p>
        <ul class="tips" style="margin-top:12px">${(TIPS[p.b.cat] || TIPS_GERAL).map(t => `<li>${ic('check','sm')}<span>${t}</span></li>`).join('')}</ul>
      </article>
      ${p.restam <= 3 && !p.estado && p.restam >= 0 ? `<article class="card" style="background:var(--yellow-soft);border-color:transparent">
        <p class="eyebrow" style="color:var(--terra)">${ic('spark','sm')} Ideia para hoje</p>
        <p style="margin-top:8px;font-weight:600">${{mol:'Use num sanduíche natural ou numa salada de batata no almoço.', lat:'Vai bem num café da manhã reforçado ou num molho branco rápido.', emb:'Um misto-quente ou uma omelete resolvem ainda hoje.', con:'Entra fácil numa salada, pizza caseira ou torta salgada.', doc:'Combina com iogurte, torradas ou um bolo simples.'}[p.b.cat] || 'Veja em Receitas o que dá para cozinhar com ele ainda hoje.'}</p></article>` : ''}
    </div>
  </div>`;
}
function bindProduto(){
  const raw = PRODUCTS.find(x => x.id === param); if (!raw || raw.estado) return;
  const p = enrich(raw);
  $('#p-consume').onclick = () => confirmConsume(p.id);
  $('#p-remind').onclick = () => toast('Combinado! Vamos lembrar você amanhã às 08:00.', 'bell');
  $('#p-discard').onclick = () => modal(`
    <div class="m-ico i-terra">${ic('trash','lg')}</div>
    <h2>Por que precisou descartar?</h2>
    <p class="muted">Isso nos ajuda a entender o desperdício da sua casa e melhorar os alertas.</p>
    <div class="chips" data-single id="reason">
      <button type="button" class="chip" aria-pressed="true">Passou do prazo</button>
      <button type="button" class="chip" aria-pressed="false">Mudou cor ou cheiro</button>
      <button type="button" class="chip" aria-pressed="false">Não deu tempo de usar</button>
      <button type="button" class="chip" aria-pressed="false">Outro motivo</button>
    </div>
    <div class="modal-actions"><button class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-terra" id="ok-discard">Registrar descarte</button></div>`,
    m => { bindChips(m); $('#ok-discard', m).onclick = () => {
      raw.estado = 'descartado'; raw.quando = fmt(TODAY); raw.motivo = $('#reason [aria-pressed="true"]', m).textContent;
      closeModal(); renderView(); toast('Descarte registrado. Vamos te avisar mais cedo da próxima vez.', 'info'); }; });
  $('#p-edit').onclick = () => modal(`
    <h2>Editar produto</h2>
    <p class="muted">${esc(p.nome)} · ${esc(p.marca)}</p>
    <div class="field"><label for="e-val">Validade da embalagem (opcional)</label><input class="input" type="date" id="e-val" value="${p.validade && !p.validadeEstimada ? p.validade : ''}"></div>
    <label class="check"><input type="checkbox" id="e-aberto" ${p.aberto ? 'checked' : ''}> Já foi aberto</label>
    <div class="field"><label for="e-open">Data de abertura</label><input class="input" type="date" id="e-open" value="${iso(p.aberto || TODAY)}" max="${iso(TODAY)}"></div>
    <div class="field"><label for="e-loc">Local</label><select class="select" id="e-loc">${Object.entries(LOCS).map(([k,n]) => `<option value="${k}" ${k===p.loc?'selected':''}>${n}</option>`).join('')}</select></div>
    <div class="field"><label for="e-alert">Avisar com antecedência de</label><select class="select" id="e-alert">${[1,2,3].map(n => `<option value="${n}" ${n===p.alerta?'selected':''}>${n} ${n===1?'dia':'dias'}</option>`).join('')}</select></div>
    <div class="modal-actions"><button class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-primary" id="ok-edit">Salvar alterações</button></div>`,
    m => $('#ok-edit', m).onclick = () => {
      const d = new Date($('#e-open', m).value + 'T12:00:00');
      const val = $('#e-val', m).value;
      if (val) { raw.validade = val; raw.validadeEstimada = false; }
      raw.aberto = $('#e-aberto', m).checked;
      raw.abertoEm = raw.aberto ? $('#e-open', m).value : null;
      if (raw.aberto && !raw.prazoAberto && !CATALOG.find(c => c.k === raw.k)) raw.prazoAberto = (INGREDIENTES[raw.ingrediente] || {}).aberto || 3;
      raw.loc = $('#e-loc', m).value; raw.alerta = Number($('#e-alert', m).value);
      closeModal(); renderView(); toast('Alterações salvas. Data-limite recalculada.');
    });
  $('#p-del').onclick = () => modal(`
    <div class="m-ico i-terra">${ic('alert','lg')}</div>
    <h2>Excluir este produto?</h2>
    <p class="muted">${esc(p.nome)} será removido da geladeira e os alertas agendados serão cancelados. Essa ação não entra no relatório de desperdício.</p>
    <div class="modal-actions"><button class="btn btn-ghost" data-close>Manter</button><button class="btn btn-terra" id="ok-del">Excluir produto</button></div>`,
    m => $('#ok-del', m).onclick = () => { PRODUCTS = PRODUCTS.filter(x => x.id !== p.id); closeModal(); go('despensa'); setTimeout(() => toast('Produto excluído', 'trash'), 100); });
}

