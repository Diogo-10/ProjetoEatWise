/* ======================================================================
   APP (área logada)
   ====================================================================== */
const NAV = [
  {r:'dashboard', n:'Início', i:'home'},
  {r:'adicionar', n:'Registrar produto', i:'plus'},
  {r:'despensa', n:'Minha geladeira', i:'box'},
  {r:'alertas', n:'Alertas', i:'bell', badge:true},
  {r:'prazos', n:'Base de prazos', i:'book'},
  {r:'impacto', n:'Meu impacto', i:'chart'}
];
const unread = () => ALERTS.filter(a => !a.lido).length;

function shell(){
  return `<div class="app">
    <aside class="sidebar" aria-label="Menu principal">
      <button class="logo" data-go="dashboard"><span class="logo-mark">${LOGO}</span><span>Eat<b>Wise</b></span></button>
      <nav class="nav" id="side-nav"></nav>
      <div class="side-cta">
        <strong>Seja Premium</strong>
        <p>Cadastro por áudio, alertas por categoria e casa compartilhada.</p>
        <button class="btn btn-terra btn-sm" data-go="perfil-4">${ic('star','sm')} Ver plano</button>
      </div>
    </aside>
    <div class="scrim" id="scrim"></div>
    <div class="main">
      <header class="topbar">
        <button class="icon-btn menu-toggle" id="menu-toggle" aria-label="Abrir menu">${ic('menu')}</button>
        <div class="search input-icon">${ic('search','sm')}<input class="input" id="global-search" placeholder="Buscar na geladeira: requeijão, molho..." aria-label="Buscar produtos"></div>
        <div class="top-right">
              <button class="btn btn-primary btn-sm" data-go="adicionar" id="top-add">${ic('plus','sm')} <span>Registrar</span></button>
          <div class="dd-wrap">
            <button class="icon-btn" id="notif-btn" aria-label="Notificações" aria-expanded="false">${ic('bell')}<span class="dot" id="notif-dot"></span></button>
            <div class="dropdown notif-dd" id="notif-dd" hidden></div>
          </div>
          <div class="dd-wrap">
            <button class="user-btn" id="user-btn" aria-expanded="false" aria-label="Menu da conta"><span class="avatar sm">${USER.iniciais}</span><span class="meta"><strong>${USER.primeiro}</strong><br><small>Casa Oliveira</small></span>${ic('down','sm')}</button>
            <div class="dropdown" id="user-dd" hidden>
              <a href="#perfil" data-go="perfil">${ic('user','sm')} Meu perfil</a>
              <a href="#perfil-2" data-go="perfil-2">${ic('sliders','sm')} Notificações</a>
              <a href="#perfil-3" data-go="perfil-3">${ic('users','sm')} Minha casa</a>
              <hr style="border:0;border-top:1px solid var(--line);margin:6px 0">
              <button class="dd-item" id="logout-btn">${ic('logout','sm')} Sair</button>
            </div>
          </div>
        </div>
      </header>
      <main class="content" id="view"></main>
    </div>
    <nav class="bottom-nav" id="bottom-nav" aria-label="Navegação inferior"></nav>
  </div>`;
}

function closeDropdowns(){ $$('.dropdown').forEach(d => d.hidden = true); $$('[aria-expanded]').forEach(b => b.setAttribute('aria-expanded','false')); }

function bindShell(){
  const app = $('.app');
  if (app.dataset.bound) return;
  app.dataset.bound = '1';
  $('#menu-toggle').onclick = () => app.classList.add('drawer');
  $('#scrim').onclick = () => app.classList.remove('drawer');
  const toggle = (btn, dd, fill) => { btn.onclick = e => { e.stopPropagation(); const open = dd.hidden; closeDropdowns(); if (open) { fill && fill(); dd.hidden = false; btn.setAttribute('aria-expanded','true'); } }; };
  toggle($('#notif-btn'), $('#notif-dd'), fillNotifDD);
  toggle($('#user-btn'), $('#user-dd'));
  document.addEventListener('click', e => { if (!e.target.closest('.dd-wrap')) closeDropdowns(); });
  $('#logout-btn').onclick = () => { closeDropdowns(); modal(`
    <div class="m-ico i-terra">${ic('logout','lg')}</div><h2>Sair da conta?</h2>
    <p class="muted">Você continuará recebendo alertas no celular enquanto o aplicativo estiver instalado.</p>
    <div class="modal-actions"><button class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-terra" data-go="login">Sair</button></div>`); };
  $('#global-search').addEventListener('keydown', e => {
    if (e.key === 'Enter') { despState.q = e.target.value; despState.tab = 'ativos'; go('despensa'); }
  });
}

function fillNotifDD(){
  $('#notif-dd').innerHTML = `<div class="nd-head"><strong>Notificações</strong><button class="link-btn" id="nd-all" style="font-size:.85rem">Marcar como lidas</button></div>
    ${ALERTS.slice(0,4).map(a => `<button class="dd-item" data-go="${a.pid ? 'produto-'+a.pid : 'alertas'}" style="align-items:flex-start">
      <span class="ico ${alertCls(a.tipo)}" style="width:32px;height:32px;border-radius:10px;display:grid;place-items:center;flex:none">${ic(alertIco(a.tipo),'sm')}</span>
      <span style="min-width:0"><strong style="display:block;font-size:.88rem">${esc(a.titulo)}</strong><small class="muted">${a.quando}</small></span>
      ${a.lido ? '' : '<span class="udot" style="margin-left:auto;margin-top:6px;flex:none"></span>'}</button>`).join('')}
    <a href="#alertas" data-go="alertas" style="justify-content:center;color:var(--green);font-weight:800">Ver todos os alertas</a>`;
  $('#nd-all').onclick = e => { e.stopPropagation(); ALERTS.forEach(a => a.lido = true); fillNotifDD(); updateBadges(); toast('Todas as notificações foram marcadas como lidas'); };
}
const alertCls = t => ({bad:'i-terra', today:'i-yellow', warn:'i-orange', ok:'i-green'}[t]);
const alertIco = t => ({bad:'alert', today:'clock', warn:'bell', ok:'leaf'}[t]);

function updateBadges(){
  const n = unread();
  $('#notif-dot').hidden = n === 0;
  const navRoute = route === 'produto' ? 'despensa' : route;
  $('#side-nav').innerHTML = `<span class="nav-label">Menu</span>` + NAV.map(x =>
    `<a href="#${x.r}" data-go="${x.r}" class="${navRoute===x.r?'active':''}" ${navRoute===x.r?'aria-current="page"':''}>${ic(x.i)} ${x.n}${x.badge && n ? `<span class="badge">${n}</span>` : ''}</a>`).join('') +
    `<span class="nav-label" style="margin-top:10px">Conta</span>
     <a href="#perfil" data-go="perfil" class="${navRoute==='perfil'?'active':''}">${ic('user')} Perfil e configurações</a>`;
  const bn = [['dashboard','Início','home'],['despensa','Geladeira','box'],['adicionar','Registrar','plus'],['alertas','Alertas','bell'],['perfil','Perfil','user']];
  $('#bottom-nav').innerHTML = bn.map(([r,n,i]) => r === 'adicionar'
    ? `<a href="#adicionar" data-go="adicionar" class="plus ${navRoute===r?'active':''}"><span class="p">${ic('plus')}</span>${n}</a>`
    : `<a href="#${r}" data-go="${r}" class="${navRoute===r?'active':''}">${ic(i)}${n}</a>`).join('');
}

function renderView(){
  stopCamera();
  salvarEstado();
  ALERTS = gerarAlertas();
  bindShell();
  const views = {dashboard:viewDashboard, adicionar:viewAdd, despensa:viewDespensa, produto:viewProduto, alertas:viewAlertas, prazos:viewPrazos, impacto:viewImpacto, perfil:viewPerfil};
  const fn = views[route] || viewDashboard;
  $('#view').innerHTML = fn();
  updateBadges();
  const binders = {dashboard:bindDashboard, adicionar:bindAdd, despensa:bindDespensa, produto:bindProduto, alertas:bindAlertas, prazos:bindPrazos, perfil:bindPerfil, impacto:bindImpacto};
  binders[route] && binders[route]();
}

/* ---------- Componentes ---------- */
function pcard(p){
  const sub = p.estado
    ? `${p.estado === 'consumido' ? 'Consumido' : 'Descartado'} em ${p.quando}`
    : `Aberto em ${fmt(p.aberto)} · até ${fmt(p.limite)}`;
  const days = p.restam < 0 ? 'vencido' : p.restam === 0 ? 'hoje' : p.restam + (p.restam===1?' dia':' dias');
  return `<button class="pcard" data-go="produto-${p.id}">
    <div class="head">${foodTile(p.k)}
      <div class="t"><strong>${esc(p.nome)}</strong><small>${esc(p.marca)}</small></div></div>
    <div class="mid"><span class="pill ${p.st.cls}">${p.st.label}</span>${p.estado ? `<span class="tag">${p.cat.nome.split(' ')[0]}</span>` : `<span class="days num">${days}</span>`}</div>
    ${p.estado ? '' : `<div class="bar ${p.st.bar}"><i style="width:${Math.round(p.frac*100)}%"></i></div>`}
    <div class="foot"><span>${sub}</span></div>
  </button>`;
}
function row(p, withAction){
  return `<div class="row">
    ${foodTile(p.k)}
    <button class="info" data-go="produto-${p.id}" style="background:none;border:0;padding:0;text-align:left"><strong>${esc(p.nome)}</strong><small>${esc(p.marca.split(' · ')[0])} · ${LOCS[p.loc]}</small></button>
    <div class="end"><span class="pill ${p.st.cls}">${p.restam < 0 ? 'Vencido' : restamTxt(p.restam)}</span>
    ${withAction ? `<button class="btn btn-soft btn-sm" data-consume="${p.id}">${ic('check','sm')} Consumi</button>` : ''}</div>
  </div>`;
}

