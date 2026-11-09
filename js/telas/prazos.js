/* ---------- Base de prazos ---------- */
let prazoCat = 'all', prazoQ = '';
function viewPrazos(){
  let list = BASE.filter(b => (prazoCat === 'all' || b.cat === prazoCat) && b.item.toLowerCase().includes(prazoQ.toLowerCase()));
  return `
  <div class="page-head">
    <div><h1>Base de prazos</h1><p>Quanto tempo cada tipo de produto dura depois de aberto. É essa tabela que o EatWise consulta para calcular os alertas.</p></div>
    <button class="btn btn-ghost" id="suggest-btn">${ic('plus','sm')} Sugerir produto</button>
  </div>
  <div class="toolbar">
    <div class="chips scroll">
      <button class="chip" data-pcat="all" aria-pressed="${prazoCat==='all'}">Todas</button>
      ${Object.entries(CATS).map(([k,c]) => `<button class="chip" data-pcat="${k}" aria-pressed="${prazoCat===k}">${c.nome}</button>`).join('')}
    </div>
    <div class="input-icon" style="flex:1;max-width:280px;min-width:0">${ic('search','sm')}<input class="input" id="pz-q" placeholder="Buscar na base" value="${esc(prazoQ)}" style="border-radius:999px"></div>
  </div>
  <div class="table-wrap">
    <table>
      <thead><tr><th>Produto</th><th>Categoria</th><th>Prazo após aberto</th><th>Como conservar</th><th>Fonte</th></tr></thead>
      <tbody>${list.map(b => `<tr>
        <td><div class="cell">${foodTile(b.k)}<span><strong>${b.item}</strong><br><small class="muted">${b.marca}</small></span></div></td>
        <td><span class="tag">${CATS[b.cat].nome}</span></td>
        <td><span class="days-badge num" style="color:${b.dias<=3?'var(--terra)':b.dias<=7?'var(--orange)':'var(--green)'}">${b.dias} ${b.dias===1?'dia':'dias'}</span></td>
        <td class="muted">${b.cons}</td><td style="font-size:.84rem"><a href="${b.url}" target="_blank" rel="noopener">${b.fonte}</a>${b.doRotulo ? ' <span class="pill st-ok" style="margin-left:4px">rótulo</span>' : ''}</td></tr>`).join('') || `<tr><td colspan="5" class="muted" style="text-align:center;padding:30px">Nenhum item encontrado na base.</td></tr>`}</tbody>
    </table>
  </div>
  <article class="card tip" style="display:flex;gap:14px;align-items:flex-start">
    <span style="color:var(--olive)">${ic('info')}</span>
    <p class="muted" style="font-size:.9rem">Quando o rótulo informa o prazo depois de aberto, usamos o do rótulo (marcado como <strong>rótulo</strong>). Nos demais, usamos a orientação publicada mais conservadora que encontramos, com a fonte ao lado. Os prazos valem para produtos guardados na geladeira e sempre devem ceder ao que estiver escrito na embalagem. Fotos das embalagens: Open Food Facts, licença CC BY-SA.</p>
  </article>`;
}
function bindPrazos(){
  $$('[data-pcat]').forEach(b => b.onclick = () => { prazoCat = b.dataset.pcat; renderView(); });
  const q = $('#pz-q');
  q.addEventListener('input', () => { prazoQ = q.value; const pos = q.selectionStart; renderView(); const n = $('#pz-q'); n.focus(); n.setSelectionRange(pos,pos); });
  $('#suggest-btn').onclick = () => modal(`
    <h2>Sugerir produto para a base</h2>
    <p class="muted">Não encontrou o que procurava? Nossa equipe revisa cada sugestão com base nas referências técnicas.</p>
    <div class="field"><label for="sg-n">Produto</label><input class="input" id="sg-n" placeholder="Ex.: pesto de manjericão"></div>
    <div class="field"><label for="sg-c">Categoria</label><select class="select" id="sg-c">${Object.values(CATS).map(c => `<option>${c.nome}</option>`).join('')}</select></div>
    <div class="field"><label for="sg-d">Prazo indicado no rótulo (se houver)</label><input class="input" id="sg-d" placeholder="Ex.: consumir em até 5 dias após aberto"></div>
    <div class="modal-actions"><button class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-primary" id="sg-ok">Enviar sugestão</button></div>`,
    m => $('#sg-ok', m).onclick = () => { closeModal(); toast('Sugestão enviada! Avisaremos quando entrar na base.'); });
}

