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

/* Base de prazo de um item livre (sem foto/catálogo). */
function baseLivre(p, ing){
  return {k:p.k, item:p.nome, marca:'', cat:p.cat || (ing && ing.cat) || 'desp',
    dias:p.prazoAberto || (ing && ing.aberto) || null,
    cons:(p.loc && LOCS[p.loc]) || 'Geladeira',
    orient:p.validadeEstimada ? 'Data estimada pelo tipo de alimento. Se a embalagem trouxer outra data, edite o item.' : '',
    fonte:p.validadeEstimada ? 'Estimativa típica para o alimento' : 'Data informada no cadastro', url:'', doRotulo:false};
}

/* Junta os dados do item com o cálculo do contador (EW.validade) para as telas. */
function enrich(p){
  const c = CATALOG.find(x => x.k === p.k) || null;          // produto com foto (catálogo de embalagens)
  const ingrediente = p.ingrediente || (c && c.ing) || '';
  const ing = INGREDIENTES[ingrediente] || null;
  const b = c ? baseBy(p.k) : baseLivre(p, ing);
  const estaAberto = p.aberto !== false && !!p.abertoEm;     // itens antigos do contador: sempre abertos
  const prazoAberto = estaAberto ? (p.prazoAberto || b.dias || (ing && ing.aberto) || null) : null;
  const v = EW.validade.calcular({validade:p.validade, abertoEm:estaAberto ? p.abertoEm : null, prazoAberto, criadoEm:p.criadoEm}, TODAY);
  const st = EW.validade.status(v.restam, p.estado);
  const nome = c ? c.nome : p.nome;
  const marca = c ? c.marca : [p.quantidade ? `${p.quantidade} ${p.unidade || ''}`.trim() : '', (EW.normalizacao.limpar(EW.normalizacao.rotulo(ingrediente)) === EW.normalizacao.limpar(p.nome) ? '' : EW.normalizacao.rotulo(ingrediente))].filter(Boolean).join(' · ') || 'Item do inventário';
  return {...p, b, c, ing, ingrediente, prazoAberto, aberto:v.aberto, abertoHa:v.abertoHa, limite:v.limite, origemLimite:v.origem,
          restam:v.restam, st, frac:v.frac, nome, marca, cat:CATS[b.cat] || CATS.desp};
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
  EW.armazenamento.gravar('informados', INFORMADOS);
  EW.armazenamento.gravar('perfil', PERFIL);
  EW.armazenamento.gravar('historico', HISTORICO);
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
  // "#produto-3" -> rota produto, parâmetro 3; "#receita-omelete-de-legumes" -> rota receita, parâmetro texto
  const i = h.indexOf('-');
  route = i < 0 ? h : h.slice(0, i);
  const p = i < 0 ? null : h.slice(i + 1);
  param = p === null ? null : /^\d+$/.test(p) ? Number(p) : p;
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

