/* ======================================================================
   TELAS PÚBLICAS
   ====================================================================== */
function pubNav(){
  return `<header class="pub-nav">
    <button class="logo" data-go="inicio" aria-label="EatWise, página inicial"><span class="logo-mark">${LOGO}</span><span>Eat<b>Wise</b></span></button>
    <nav class="pub-links" aria-label="Seções">
      <a href="#como" data-scroll="como">Como funciona</a>
      <a href="#beneficios" data-scroll="beneficios">Benefícios</a>
      <a href="#planos" data-scroll="planos">Planos</a>
    </nav>
    <div class="pub-actions">
      <button class="btn btn-ghost" data-go="login">Entrar</button>
      <button class="btn btn-primary" data-go="cadastro">Criar conta grátis</button>
    </div>
  </header>`;
}

function viewLanding(){
  const steps = [
    ['camera','i-orange','Registre o produto','Ao abrir a embalagem, tire uma foto, digite o nome ou fale por áudio.'],
    ['spark','i-green','A IA identifica','O reconhecimento descobre o produto, a marca e a categoria em segundos.'],
    ['db','i-olive','Consulta a base de prazos','Cruzamos com prazos pós-abertura por categoria: laticínios, molhos, frios...'],
    ['cal','i-yellow','Calcula a nova data','A partir do dia em que você abriu, o EatWise define até quando consumir.'],
    ['bell','i-terra','Avisa no momento certo','Você recebe um alerta antes do vencimento, sem precisar anotar nada.']
  ];
  const benefits = [
    ['edit','i-orange','Nada de anotar à mão','Esqueça a fita crepe com data na tampa do pote. O registro leva poucos segundos.'],
    ['wallet','i-green','Menos dinheiro no lixo','Use o que você comprou antes de estragar e reduza o gasto da família no mercado.'],
    ['spark','i-olive','Cadastro com IA','Foto, texto ou áudio: você escolhe o jeito mais prático na correria do dia a dia.'],
    ['shield','i-terra','Mais segurança à mesa','Evite tanto o descarte precoce quanto o consumo de um item que já passou do ponto.'],
    ['chart','i-yellow','Consciência do consumo','Acompanhe mês a mês o que foi consumido a tempo e o que acabou desperdiçado.'],
    ['users','i-green','Para a casa toda','Toda a família registra e recebe alertas da mesma geladeira.']
  ];
  return `${pubNav()}
  <main>
    <section class="wrap hero">
      <div>
        <p class="eyebrow">Controle da validade pós-abertura</p>
        <h1 style="margin-top:12px">Abriu o pote? O EatWise lembra <em>até quando</em> dá pra consumir.</h1>
        <p class="lead">A validade impressa vale para o produto fechado. Depois de aberto, começa um novo prazo que ninguém guarda de cabeça. Registre por foto, texto ou áudio e receba um alerta antes de vencer.</p>
        <div class="hero-ctas">
          <button class="btn btn-primary" data-go="cadastro">Começar agora ${ic('arrow')}</button>
          <button class="btn btn-ghost" data-go="login">Já tenho conta</button>
        </div>
        <div class="hero-proof">
          <span>${ic('check','sm')} Grátis para começar</span>
          <span>${ic('check','sm')} Prazos baseados no Guia nº 16 da ANVISA</span>
        </div>
      </div>
      <div class="hero-art">
        ${ILL_FRIDGE}
        <div class="float-card fc-1"><span class="food c-mol">🥚</span><div><strong>Maionese</strong><small>Vence em 3 dias · 09/10</small></div></div>
        <div class="float-card fc-2"><span class="food c-lat">🧀</span><div><strong>Requeijão registrado por áudio</strong><small>Consumir até 07/10</small></div></div>
      </div>
    </section>

    <section class="band">
      <div class="wrap split">
        <div style="display:grid;gap:14px">
          <p class="eyebrow">A segunda validade</p>
          <h2 style="font-size:clamp(1.6rem,3vw,2.2rem)">O mesmo produto, dois prazos completamente diferentes</h2>
          <p class="muted" style="max-width:52ch">Um molho de tomate dura meses fechado na prateleira. Aberto, talvez só três dias na geladeira. É essa data que some quando você rasga a embalagem, e é ela que o EatWise passa a controlar.</p>
        </div>
        <div class="compare">
          <div class="card"><span class="tag">${ic('box','sm')} Fechado</span><p class="big num">12 meses</p><p class="muted">Validade impressa na embalagem do molho de tomate</p></div>
          <div class="card" style="background:var(--terra-soft);border-color:transparent"><span class="tag" style="background:var(--surface)">${ic('thermo','sm')} Aberto</span><p class="big num" style="color:var(--terra)">3 dias</p><p class="muted">Na geladeira, em pote fechado, a partir da abertura</p></div>
        </div>
      </div>
    </section>

    <section class="wrap section" id="como">
      <div class="section-head"><p class="eyebrow">Como funciona</p><h2 style="font-size:clamp(1.6rem,3vw,2.2rem)">Do pote aberto ao alerta em cinco etapas</h2></div>
      <div class="steps">
        ${steps.map((s,i) => `<article class="step"><span class="n">${i+1}</span><div class="ico ${s[1]}">${ic(s[0])}</div><h3>${s[2]}</h3><p>${s[3]}</p></article>`).join('')}
      </div>
    </section>

    <section class="wrap" style="padding-bottom:72px">
      <div class="stat-quote">
        <p class="big num">60%</p>
        <div style="display:grid;gap:8px"><p style="font-family:var(--font-display);font-size:1.25rem;font-weight:700">do desperdício de alimentos no mundo acontece dentro de casa.</p><p style="opacity:.85;font-size:.92rem">Foram 1,05 bilhão de toneladas de resíduos alimentares em 2022. Fonte: PNUMA/ONU, Food Waste Index Report 2024.</p></div>
      </div>
    </section>

    <section class="band" id="beneficios">
      <div class="wrap">
        <div class="section-head"><p class="eyebrow">Benefícios</p><h2 style="font-size:clamp(1.6rem,3vw,2.2rem)">Feito para quem cozinha em casa e não quer jogar comida fora</h2></div>
        <div class="benefits">
          ${benefits.map(b => `<article class="benefit"><span class="ico ${b[1]}">${ic(b[0])}</span><div><h3 style="margin-bottom:4px">${b[2]}</h3><p class="muted" style="font-size:.9rem">${b[3]}</p></div></article>`).join('')}
        </div>
      </div>
    </section>

    <section class="wrap section" id="planos">
      <div class="section-head"><p class="eyebrow">Planos</p><h2 style="font-size:clamp(1.6rem,3vw,2.2rem)">Comece grátis. Evolua quando quiser.</h2></div>
      <div class="plans">
        <article class="card plan">
          <h3>Gratuito</h3><p class="price num">R$ 0</p><p class="muted">Para experimentar o controle da segunda validade.</p>
          <ul><li>${ic('check','sm')} Até 15 produtos abertos ao mesmo tempo</li><li>${ic('check','sm')} Cadastro por foto e texto</li><li>${ic('check','sm')} Alerta 1 dia antes do vencimento</li></ul>
          <button class="btn btn-ghost btn-block" data-go="cadastro">Criar conta grátis</button>
        </article>
        <article class="card plan featured">
          <h3 style="display:flex;align-items:center;gap:8px">Premium ${ic('star','sm')}</h3><p class="price num">R$ 19,90 <small>/mês</small></p><p class="muted">Para a família que quer zerar o desperdício.</p>
          <ul><li>${ic('check','sm')} Produtos ilimitados</li><li>${ic('check','sm')} Cadastro por áudio</li><li>${ic('check','sm')} Alertas personalizados por categoria</li><li>${ic('check','sm')} Casa compartilhada com até 6 pessoas</li><li>${ic('check','sm')} Relatório mensal de impacto</li></ul>
          <button class="btn btn-terra btn-block" data-go="cadastro">Testar 7 dias grátis</button>
        </article>
      </div>
    </section>

    <footer class="wrap pub-footer">
      <span><strong style="color:var(--ink)">EatWise</strong> · um projeto do grupo Seven</span>
      <span>Protótipo navegável · usuários fictícios · fotos de produtos: Open Food Facts (CC BY-SA) · 2026</span>
    </footer>
  </main>`;
}

function authArt(quote, who){
  return `<aside class="auth-art">
    <button class="logo" data-go="inicio"><span class="logo-mark">${LOGO}</span><span>Eat<b>Wise</b></span></button>
    <div class="ill">${ILL_JAR}</div>
    <div style="display:grid;gap:18px">
      <blockquote>${quote}</blockquote>
      <div class="who"><span class="avatar sm" style="background:var(--yellow);color:var(--ink)">${who[0]}</span><span>${who[1]}</span></div>
    </div>
  </aside>`;
}

function viewLogin(){
  return `<div class="auth">
    ${authArt('“Parei de abrir a geladeira e achar requeijão estragado que eu nem lembrava que tinha aberto.”', ['CS','Carla Souza, participante do grupo piloto'])}
    <main class="auth-form">
      <form class="auth-box" id="login-form" novalidate>
        <button type="button" class="back-link" data-go="inicio">${ic('left','sm')} Voltar ao início</button>
        <div><h1>Bem-vinda de volta</h1><p class="muted" style="margin-top:6px">Entre para ver o que está perto de vencer na sua geladeira.</p></div>
        <div class="field"><label for="l-email">E-mail</label><div class="input-icon">${ic('mail','sm')}<input class="input" id="l-email" type="email" value="maria.oliveira@email.com" autocomplete="email"></div></div>
        <div class="field"><label for="l-pass">Senha</label><div class="input-icon">${ic('lock','sm')}<input class="input" id="l-pass" type="password" value="eatwise2026" autocomplete="current-password"></div></div>
        <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">
          <label class="check"><input type="checkbox" id="l-remember" checked> Manter conectado</label>
          <button type="button" class="link-btn" id="forgot">Esqueci minha senha</button>
        </div>
        <button class="btn btn-primary btn-block" type="submit">Entrar</button>
        <div class="divider">ou</div>
        <button type="button" class="btn btn-ghost btn-block" id="google-login"><span style="font-weight:800;color:var(--terra)">G</span> Entrar com Google</button>
        <p class="muted" style="text-align:center">Ainda não tem conta? <button type="button" class="link-btn" data-go="cadastro">Criar conta grátis</button></p>
      </form>
    </main>
  </div>`;
}

function viewSignup(){
  return `<div class="auth">
    ${authArt('“Registrei a maionese por foto e o app me avisou três dias antes. Simples assim.”', ['RA','Rafael Alves, participante do grupo piloto'])}
    <main class="auth-form">
      <form class="auth-box" id="signup-form" novalidate>
        <button type="button" class="back-link" data-go="inicio">${ic('left','sm')} Voltar ao início</button>
        <div><h1>Crie sua conta</h1><p class="muted" style="margin-top:6px">Leva menos de um minuto. Depois é só registrar o primeiro produto aberto.</p></div>
        <div class="field"><label for="s-nome">Nome completo</label><input class="input" id="s-nome" placeholder="Como devemos te chamar?" value="Maria Oliveira"></div>
        <div class="field"><label for="s-email">E-mail</label><input class="input" id="s-email" type="email" placeholder="voce@email.com" value="maria.oliveira@email.com"></div>
        <div class="field"><label for="s-pass">Senha</label><input class="input" id="s-pass" type="password" placeholder="Mínimo de 8 caracteres" value="eatwise2026"></div>
        <div class="field"><label>Quantas pessoas moram na sua casa?</label>
          <div class="chips" data-single>
            <button type="button" class="chip" aria-pressed="false">Só eu</button>
            <button type="button" class="chip" aria-pressed="false">2</button>
            <button type="button" class="chip" aria-pressed="true">3 a 4</button>
            <button type="button" class="chip" aria-pressed="false">5 ou mais</button>
          </div>
        </div>
        <label class="check"><input type="checkbox" id="s-terms" checked> Li e aceito os termos de uso e a política de privacidade (LGPD).</label>
        <button class="btn btn-primary btn-block" type="submit">Criar minha conta</button>
        <p class="muted" style="text-align:center">Já tem conta? <button type="button" class="link-btn" data-go="login">Entrar</button></p>
      </form>
    </main>
  </div>`;
}

function bindChips(scope=document){
  $$('[data-single]', scope).forEach(g => g.addEventListener('click', e => {
    const c = e.target.closest('.chip'); if (!c) return;
    $$('.chip', g).forEach(x => x.setAttribute('aria-pressed', x === c ? 'true' : 'false'));
    g.dispatchEvent(new CustomEvent('pick', {detail:c.dataset.v ?? c.textContent.trim()}));
  }));
}

function bindPublic(){
  $$('[data-scroll]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); document.getElementById(a.dataset.scroll)?.scrollIntoView({behavior:'smooth'}); }));
  bindChips();
  const lf = $('#login-form');
  if (lf) {
    lf.addEventListener('submit', e => { e.preventDefault(); go('dashboard'); setTimeout(() => toast('Bem-vinda de volta, Maria!', 'leaf'), 150); });
    $('#google-login').onclick = () => { go('dashboard'); setTimeout(() => toast('Conectado com a conta Google', 'check'), 150); };
    $('#forgot').onclick = () => modal(`
      <div class="m-ico i-green">${ic('mail','lg')}</div>
      <h2>Recuperar senha</h2>
      <p class="muted">Enviaremos um link para redefinir sua senha.</p>
      <div class="field"><label for="f-email">E-mail</label><input class="input" id="f-email" value="maria.oliveira@email.com"></div>
      <div class="modal-actions"><button class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-primary" id="f-send">Enviar link</button></div>`,
      m => $('#f-send', m).onclick = () => { closeModal(); toast('Link de recuperação enviado para o seu e-mail'); });
  }
  const sf = $('#signup-form');
  if (sf) sf.addEventListener('submit', e => {
    e.preventDefault();
    if (!$('#s-terms').checked) { toast('Aceite os termos de uso para continuar', 'info'); return; }
    modal(`
      <div class="m-ico i-green">${ic('check','lg')}</div>
      <h2>Cadastro realizado com sucesso!</h2>
      <p class="muted">Sua conta EatWise está pronta. Que tal registrar agora o primeiro produto que você abriu hoje?</p>
      <div class="modal-actions"><button class="btn btn-ghost" data-go="dashboard">Ir para o início</button><button class="btn btn-primary" data-go="adicionar">${ic('plus','sm')} Registrar produto</button></div>`);
  });
}

