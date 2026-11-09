/* ---------- Utilidades ---------- */
const $ = (s, el=document) => el.querySelector(s);
const $$ = (s, el=document) => [...el.querySelectorAll(s)];
const pad = n => String(n).padStart(2,'0');
const addDays = (d, n) => new Date(d.getTime() + n*DAY);
const fmt = d => `${pad(d.getDate())}/${pad(d.getMonth()+1)}`;
const fmtFull = d => `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`;
const iso = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const WEEK = ['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'];
const MONTHS = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];

function enrich(p){
  const b = baseBy(p.k), c = CATALOG.find(x => x.k === p.k);
  const aberto = new Date(p.abertoEm + 'T00:00:00');
  const abertoHa = Math.round((TODAY - aberto) / DAY);
  const limite = addDays(aberto, b.dias);
  const restam = b.dias - abertoHa;
  let st;
  if (p.estado === 'consumido') st = {k:'done', label:'Consumido', cls:'st-ok', bar:''};
  else if (p.estado === 'descartado') st = {k:'done', label:'Descartado', cls:'st-bad', bar:'bad'};
  else if (restam < 0) st = {k:'bad', label:'Vencido', cls:'st-bad', bar:'bad'};
  else if (restam <= 1) st = {k:'today', label: restam === 0 ? 'Vence hoje' : 'Vence amanhã', cls:'st-today', bar:'today'};
  else if (restam <= 3) st = {k:'warn', label:'Atenção', cls:'st-warn', bar:'warn'};
  else st = {k:'ok', label:'Em dia', cls:'st-ok', bar:''};
  const frac = Math.max(0, Math.min(1, restam / b.dias));
  return {...p, b, c, aberto, abertoHa, limite, restam, st, frac, nome:c.nome, marca:c.marca, emoji:b.emoji, cat:CATS[b.cat]};
}
const active = () => PRODUCTS.filter(p => !p.estado).map(enrich);
const restamTxt = r => r < 0 ? `venceu há ${-r} ${-r===1?'dia':'dias'}` : r === 0 ? 'vence hoje' : r === 1 ? 'vence amanhã' : `${r} dias restantes`;
const esc = s => String(s).replace(/[&<>"]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));

/* ---------- Alertas gerados do inventário ----------
   Um item gera alerta quando venceu ou quando chegou o dia do aviso (data-limite menos a antecedência). */
function gerarAlertas(){
  const grupo = dias => dias <= 0 ? 'Hoje' : dias <= 7 ? 'Esta semana' : 'Anteriores';
  const quando = d => { const dias = Math.round((TODAY - d) / DAY); return dias === 0 ? 'Hoje, 08:00' : dias === 1 ? 'Ontem, 08:00' : `${fmt(d)}, 08:00`; };
  const lista = [];
  active().sort((a, b) => a.restam - b.restam).forEach(p => {
    const aviso = addDays(p.limite, -p.alerta);
    if (p.restam < 0) {
      const dia = addDays(p.limite, 1);
      lista.push({id:`venc-${p.id}-${iso(p.limite)}`, pid:p.id, tipo:'bad', titulo:`${p.nome} ${p.restam === -1 ? 'venceu ontem' : `venceu há ${-p.restam} dias`}`,
        texto:`O prazo depois de aberto terminou em ${fmt(p.limite)}. Recomendamos descartar.`, quando:quando(dia), grupo:grupo(Math.round((TODAY - dia) / DAY)), data:dia});
    } else if (TODAY >= aviso) {
      lista.push({id:`aviso-${p.id}-${iso(p.limite)}`, pid:p.id, tipo:p.restam <= 1 ? 'today' : 'warn', titulo:`${p.nome} ${restamTxt(p.restam).replace(' restantes', '').replace(/^(\d+) dias$/, 'vence em $1 dias')}`,
        texto:`Data-limite: ${fmt(p.limite)}. Aviso enviado ${p.alerta} ${p.alerta === 1 ? 'dia' : 'dias'} antes, como configurado.`, quando:quando(aviso), grupo:grupo(Math.round((TODAY - aviso) / DAY)), data:aviso});
    }
  });
  lista.push({id:'resumo', pid:null, tipo:'ok', titulo:'Resumo da semana', texto:'Você consumiu 6 itens a tempo e descartou apenas 1. Economia estimada: R$ 23,80.', quando:'Domingo, 10:00', grupo:'Esta semana', data:addDays(TODAY, -2)});
  lista.push({id:'base', pid:null, tipo:'ok', titulo:'Novo produto na base de prazos', texto:'Adicionamos o requeijão Itambé com o prazo do próprio rótulo: 5 dias após aberto.', quando:fmt(addDays(TODAY, -9)) + ', 14:12', grupo:'Anteriores', data:addDays(TODAY, -9)});
  lista.forEach(a => a.lido = ALERTAS_LIDOS.has(a.id));
  return lista;
}

/* ---------- Salvar estado no navegador ---------- */
function salvarEstado(){
  ALERTS.filter(a => a.lido).forEach(a => ALERTAS_LIDOS.add(a.id));
  EW.armazenamento.gravar('alertasLidos', [...ALERTAS_LIDOS]);
  EW.armazenamento.gravar('usuario', {plano: USER.plano});
  if (!EW.armazenamento.gravar('inventario', PRODUCTS)) {
    // sem espaço (fotos grandes): guarda o inventário sem as fotos tiradas pelo usuário
    EW.armazenamento.gravar('inventario', PRODUCTS.map(p => Object.assign({}, p, {foto:null})));
  }
}
window.addEventListener('pagehide', salvarEstado);

/* ---------- Toast & modal ---------- */
function toast(msg, icon='check'){
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<span class="ti">${ic(icon)}</span><span>${msg}</span>`;
  $('#toasts').appendChild(t);
  setTimeout(() => { t.style.transition='opacity .3s'; t.style.opacity='0'; setTimeout(() => t.remove(), 300); }, 3200);
}
function modal(html, onMount){
  const root = $('#modal-root');
  root.innerHTML = `<div class="overlay" data-close-overlay><div class="modal" role="dialog" aria-modal="true">${html}</div></div>`;
  const ov = root.firstElementChild;
  ov.addEventListener('click', e => { if (e.target === ov || e.target.closest('[data-close]')) closeModal(); });
  onMount && onMount(ov.firstElementChild);
  const f = ov.querySelector('button, input, select'); f && f.focus();
}
function closeModal(){ $('#modal-root').innerHTML = ''; }
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); closeDropdowns(); } });

/* ---------- Roteador ---------- */
const PUBLIC = ['inicio','login','cadastro'];
let route = 'inicio', param = null;

function go(r){ if (location.hash.slice(1) === r) render(); else location.hash = r; }
window.addEventListener('hashchange', render);
document.addEventListener('click', e => {
  const g = e.target.closest('[data-go]');
  if (g) { e.preventDefault(); closeDropdowns(); $('.app')?.classList.remove('drawer'); go(g.dataset.go); }
});

function render(){
  const h = (location.hash.slice(1) || 'inicio');
  const [r, p] = h.split('-');
  route = r; param = p ? Number(p) : null;
  closeModal();
  if (PUBLIC.includes(route)) {
    $('#root').innerHTML = route === 'inicio' ? viewLanding() : route === 'login' ? viewLogin() : viewSignup();
    bindPublic();
  } else {
    if (!$('.app')) $('#root').innerHTML = shell();
    renderView();
  }
  window.scrollTo(0,0);
}

