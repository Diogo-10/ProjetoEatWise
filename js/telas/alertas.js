/* ---------- Alertas ---------- */
let alertTab = 'todos';
function viewAlertas(){
  const list = alertTab === 'nao' ? ALERTS.filter(a => !a.lido) : ALERTS;
  const groups = ['Hoje','Esta semana','Anteriores'];
  return `
  <div class="page-head">
    <div><h1>Alertas</h1><p>Avisos enviados antes de cada data-limite, no horário que você escolheu.</p></div>
    <div class="actions"><button class="btn btn-ghost btn-sm" id="a-read">${ic('check','sm')} Marcar todos como lidos</button><button class="btn btn-ghost btn-sm" data-go="perfil-2">${ic('sliders','sm')} Preferências</button></div>
  </div>
  <div class="tabs" role="tablist" style="justify-self:start">
    <button role="tab" data-atab="todos" aria-selected="${alertTab==='todos'}">Todos <span class="count num">${ALERTS.length}</span></button>
    <button role="tab" data-atab="nao" aria-selected="${alertTab==='nao'}">Não lidos <span class="count num">${unread()}</span></button>
  </div>
  ${list.length ? groups.map(g => { const items = list.filter(a => a.grupo === g); return items.length ? `
    <section class="alert-group"><p class="eyebrow">${g}</p>
      ${items.map(a => `<button class="alert-item ${a.lido?'':'unread'}" data-alert="${a.id}">
        <span class="ico ${alertCls(a.tipo)}">${ic(alertIco(a.tipo))}</span>
        <span style="min-width:0"><strong style="display:block">${esc(a.titulo)}</strong><p>${esc(a.texto)}</p></span>
        <span style="display:grid;justify-items:end;gap:6px"><time>${a.quando}</time>${a.lido?'':'<span class="udot" aria-label="não lido"></span>'}</span>
      </button>`).join('')}
    </section>` : ''; }).join('') :
  `<div class="card empty"><span class="food">🔔</span><h3>Tudo em dia por aqui</h3><p>Você leu todos os alertas. Novos avisos aparecem quando um produto se aproximar da data-limite.</p></div>`}`;
}
function bindAlertas(){
  $$('[data-atab]').forEach(b => b.onclick = () => { alertTab = b.dataset.atab; renderView(); });
  $('#a-read').onclick = () => { ALERTS.forEach(a => a.lido = true); renderView(); toast('Todos os alertas foram marcados como lidos'); };
  $$('[data-alert]').forEach(b => b.onclick = () => {
    const a = ALERTS.find(x => x.id === b.dataset.alert); a.lido = true; ALERTAS_LIDOS.add(a.id);
    if (a.pid && PRODUCTS.find(x => x.id === a.pid)) go('produto-' + a.pid); else { renderView(); toast('Alerta marcado como lido'); }
  });
}

