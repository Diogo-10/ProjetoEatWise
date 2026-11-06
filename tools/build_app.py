"""Gera o app de celular (app/index.html) a partir do protótipo web (index.html).

Mantém as duas versões idênticas em conteúdo e visual: depois de mudar o index.html,
rode `python3 tools/build_app.py` para atualizar o app.
"""
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
import re
src = open(ROOT / 'index.html', encoding='utf-8').read()
s = src

def rep(old, new, count=1):
    global s
    assert old in s, f"anchor not found: {old[:70]!r}"
    s = s.replace(old, new, count)

# ---------- head: PWA ----------
rep('<title>EatWise</title>', '''<title>EatWise</title>
<meta name="description" content="Controle a validade dos alimentos depois de abertos.">
<meta name="theme-color" content="#4E7A38">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="EatWise">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icons/icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="icons/icon-180.png">''')
rep('/* Layout: sistema web com menu lateral fixo + área de conteúdo em cards; vira gaveta + barra inferior no celular */',
    '/* Layout: app de celular (uma coluna, barra inferior, menu em gaveta); no computador aparece dentro de uma moldura de celular */')

# ---------- força o layout de celular em qualquer largura ----------
rep('@media (max-width:1100px){', '@media all{')
rep('@media (max-width:960px){', '@media all{')
rep('@media (max-width:640px){', '@media all{')
rep('.app{display:grid;grid-template-columns:264px minmax(0,1fr);min-height:100vh}', '.app{display:grid;grid-template-columns:264px minmax(0,1fr);min-height:100%}')
rep('.auth{min-height:100vh;', '.auth{min-height:100%;')
rep('position:sticky;top:0;height:100vh;overflow-y:auto}', 'position:sticky;top:0;height:100%;overflow-y:auto}')

APP_CSS = r'''
/* ============ APP DE CELULAR ============ */
html,body{height:100%}
body{display:block;overflow:hidden}
.device{position:relative;width:100%;height:100%}
.phone{position:relative;width:100%;height:100%;overflow:hidden;overflow:clip;transform:translateZ(0);background:var(--bg)}
#root{height:100%;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;-webkit-overflow-scrolling:touch}
.device-side{display:none}
.topbar{padding-top:calc(12px + env(safe-area-inset-top,0px));padding-bottom:12px}
.content{padding-top:20px}
.page-head h1,.welcome h1{font-size:1.6rem}
.toasts{left:16px;right:16px;max-width:none}
.toast{max-width:none}
@media (min-width:760px) and (min-height:640px){
  body{background:var(--sand);padding-block:24px;display:flex;gap:56px;justify-content:center;align-items:center}
  .device{width:400px;height:min(860px,calc(100% - 8px));flex:none;border-radius:54px;padding:12px;background:#121611;box-shadow:0 0 0 2px #3a4436,0 30px 80px rgba(20,30,15,.35)}
  .phone{border-radius:42px}
  .device::before{content:"";position:absolute;top:22px;left:50%;transform:translateX(-50%);width:110px;height:28px;border-radius:20px;background:#121611;z-index:200}
  .phone .topbar,.phone .onb-top{padding-top:46px}
  .device-side{display:grid;gap:18px;max-width:340px}
  .device-side h1{font-size:2.3rem;line-height:1.05}
  .device-side ol{margin:0;padding-left:20px;display:grid;gap:8px;color:var(--muted)}
}
@media (min-width:760px) and (max-width:1000px){ .device-side{display:none} }

/* Splash */
.splash{position:absolute;inset:0;z-index:300;background:var(--green);color:var(--on-accent);display:grid;place-items:center;align-content:center;gap:14px;transition:opacity .45s,visibility .45s}
.splash.hide{opacity:0;visibility:hidden}
.splash .logo-mark{width:84px;height:84px;border-radius:26px;background:var(--on-accent);color:var(--green);animation:pop .5s}
.splash .logo-mark .svg{width:46px;height:46px}
.splash strong{font-family:var(--font-display);font-size:2rem;font-weight:800}
.splash small{opacity:.85;font-weight:600}

/* Onboarding */
.onb{min-height:100%;display:flex;flex-direction:column;padding:0 22px calc(24px + env(safe-area-inset-bottom,0px))}
.onb-top{display:flex;justify-content:space-between;align-items:center;padding-top:calc(16px + env(safe-area-inset-top,0px));padding-bottom:8px}
.onb-art{flex:1;display:grid;place-items:center;min-height:260px;background:var(--sand);border-radius:32px;margin-top:8px;padding:18px;position:relative;overflow:hidden}
.onb-art .ill{width:100%;max-width:300px;height:auto}
.onb-text{display:grid;gap:10px;padding:26px 4px 10px}
.onb-text h1{font-size:1.85rem;line-height:1.1}
.onb-text h1 em{font-style:normal;color:var(--terra)}
.dots{display:flex;gap:8px;padding:10px 4px 22px}
.dots button{width:9px;height:9px;border-radius:999px;border:0;padding:0;background:var(--sand-2);transition:width .2s}
.dots button[aria-current="true"]{width:26px;background:var(--green)}
.onb-actions{display:grid;gap:10px}
.methods-art{display:grid;gap:14px;width:100%;max-width:280px}
.methods-art div{display:flex;gap:14px;align-items:center;background:var(--surface);border:1px solid var(--line);border-radius:20px;padding:14px 16px;font-weight:800}
.methods-art .ico{width:46px;height:46px;border-radius:50%;display:grid;place-items:center}
.notif-art{display:grid;gap:12px;width:100%;max-width:290px}
.notif-art .n{background:var(--surface);border:1px solid var(--line);border-radius:20px;padding:14px;display:flex;gap:12px;align-items:center;box-shadow:var(--shadow)}
.notif-art .n small{color:var(--muted);font-size:.8rem;display:block}
.notif-art .n .food{width:42px;height:42px;font-size:22px}

/* Câmera: visor vertical no celular */
.viewfinder{aspect-ratio:3/4}
'''
rep('@media (prefers-reduced-motion:reduce)', APP_CSS + '@media (prefers-reduced-motion:reduce)')

# ---------- corpo ----------
rep('''<body>
<div id="root"></div>
<div class="toasts" id="toasts" aria-live="polite"></div>
<div id="modal-root"></div>''', '''<body>
<aside class="device-side">
  <span class="logo"><span class="logo-mark"><svg class="svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg></span><span>Eat<b>Wise</b></span></span>
  <h1>O app que lembra a segunda validade.</h1>
  <p class="muted">Protótipo do aplicativo para celular do grupo Seven. Use o celular ao lado como se fosse o seu.</p>
  <ol>
    <li>Passe pela apresentação e entre na conta</li>
    <li>Toque no botão <strong style="color:var(--terra)">+</strong> e fotografe um produto</li>
    <li>Salve e veja a data-limite calculada</li>
  </ol>
  <p class="muted" style="font-size:.85rem">No celular, abra este endereço e use “Adicionar à tela inicial” para instalar.</p>
</aside>
<div class="device">
<div class="phone">
<div id="root"></div>
<div class="toasts" id="toasts" aria-live="polite"></div>
<div id="modal-root"></div>
<div class="splash" id="splash" aria-hidden="true"><span class="logo-mark"><svg class="svg" viewBox="0 0 24 24"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg></span><strong>EatWise</strong><small>Abriu? A gente lembra.</small></div>
</div>
</div>''')
rep('</script>\n</body>', '</script>\n</body>')  # sanity

# ---------- JS ----------
rep('  window.scrollTo(0,0);\n}', "  $('#root').scrollTop = 0;\n}")

# onboarding no lugar da landing page
start = s.index('function viewLanding(){'); end = s.index('function authArt(')
ONB = r'''let obIdx = 0;
const SLIDES = [
  {eyebrow:'A segunda validade', title:'Abriu o pote? A gente lembra <em>até quando</em> dá pra consumir.',
   text:'A validade impressa vale para o produto fechado. Depois de aberto, começa um novo prazo que ninguém guarda de cabeça.', art:() => ILL_FRIDGE},
  {eyebrow:'Registro em segundos', title:'Foto, texto ou áudio. Você escolhe.',
   text:'A IA reconhece o produto, consulta a base de prazos por categoria e calcula a nova data-limite.',
   art:() => `<div class="methods-art">
     <div><span class="ico i-orange">${ic('camera','lg')}</span>Tire uma foto do rótulo</div>
     <div><span class="ico i-green">${ic('type','lg')}</span>Digite o nome</div>
     <div><span class="ico i-terra">${ic('mic','lg')}</span>Fale o que abriu</div></div>`},
  {eyebrow:'Alertas', title:'Receba o aviso antes de vencer.',
   text:'Menos comida no lixo, mais economia e mais segurança para toda a casa.',
   art:() => `<div class="notif-art">
     <div class="n"><span class="food c-mol">🥚</span><div><strong>Maionese vence em 3 dias</strong><small>EatWise · agora</small></div></div>
     <div class="n"><span class="food c-lat">🧀</span><div><strong>Requeijão vence amanhã</strong><small>EatWise · 08:00</small></div></div>
     <div class="n"><span class="food c-hor">🌱</span><div><strong>Você evitou 33% de desperdício</strong><small>Resumo da semana</small></div></div></div>`}
];
function viewLanding(){
  const sl = SLIDES[obIdx], last = obIdx === SLIDES.length - 1;
  return `<div class="onb" id="onb">
    <div class="onb-top"><span class="logo"><span class="logo-mark">${ic('leaf')}</span><span>Eat<b>Wise</b></span></span>
      ${last ? '' : '<button class="link-btn" data-go="login">Pular</button>'}</div>
    <div class="onb-art">${sl.art()}</div>
    <div class="onb-text"><p class="eyebrow">${sl.eyebrow}</p><h1>${sl.title}</h1><p class="muted">${sl.text}</p></div>
    <div class="dots" role="tablist" aria-label="Apresentação">${SLIDES.map((_,i) => `<button data-dot="${i}" aria-label="Tela ${i+1} de ${SLIDES.length}" aria-current="${i===obIdx}"></button>`).join('')}</div>
    <div class="onb-actions">${last
      ? `<button class="btn btn-primary btn-block" data-go="cadastro">Criar conta grátis</button><button class="btn btn-ghost btn-block" data-go="login">Já tenho conta</button>`
      : `<button class="btn btn-primary btn-block" id="onb-next">Continuar ${ic('arrow','sm')}</button>`}</div>
  </div>`;
}
function bindOnboarding(){
  const o = $('#onb'); if (!o) return;
  const to = i => { obIdx = Math.max(0, Math.min(SLIDES.length - 1, i)); $('#root').innerHTML = viewLanding(); bindOnboarding(); };
  $('#onb-next') && ($('#onb-next').onclick = () => to(obIdx + 1));
  $$('[data-dot]').forEach(d => d.onclick = () => to(Number(d.dataset.dot)));
  let x0 = null;
  o.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, {passive:true});
  o.addEventListener('touchend', e => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) to(obIdx + (dx < 0 ? 1 : -1)); x0 = null; });
}

'''
s = s[:start] + ONB + s[end:]
rep("function bindPublic(){\n", "function bindPublic(){\n  bindOnboarding();\n")

# cabeçalho de app: logo no lugar do botão Registrar (o + da barra inferior já faz isso)
rep("""<button class="icon-btn menu-toggle" id="menu-toggle" aria-label="Abrir menu">${ic('menu')}</button>""",
    """<button class="icon-btn menu-toggle" id="menu-toggle" aria-label="Abrir menu">${ic('menu')}</button>
        <button class="logo app-logo" data-go="dashboard" aria-label="EatWise, início"><span class="logo-mark">${ic('leaf')}</span><span>Eat<b>Wise</b></span></button>""")
rep(".toasts{left:16px;right:16px;max-width:none}", ".toasts{left:16px;right:16px;max-width:none}\n#top-add{display:none}\n.app-logo{font-size:1.15rem}\n.app-logo .logo-mark{width:32px;height:32px;border-radius:10px}\n.app-logo .logo-mark .svg{width:18px;height:18px}")

rep("function startProcessing(k){ addState.pick = k; addState.stage = 'processing'; renderView(); }",
    "function startProcessing(k){ addState.pick = k; addState.stage = 'processing'; renderView(); $('#root').scrollTop = 0; }")

# splash + service worker
rep('\nrender();\n</script>', '''
render();
setTimeout(() => { const sp = $('#splash'); sp.classList.add('hide'); setTimeout(() => sp.remove(), 500); }, 1100);
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
  window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
}
</script>''')

open(ROOT / 'app' / 'index.html', 'w', encoding='utf-8').write(s)
import shutil
shutil.rmtree(ROOT / 'app' / 'assets', ignore_errors=True)
shutil.copytree(ROOT / 'assets', ROOT / 'app' / 'assets')
print('ok', len(s))
