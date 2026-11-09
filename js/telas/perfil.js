/* ---------- Perfil e configurações ---------- */
let perfTab = 1;
function viewPerfil(){
  if (param) perfTab = param;
  const tabs = [[1,'Meus dados'],[2,'Notificações'],[3,'Minha casa'],[4,'Plano']];
  let body = '';
  if (perfTab === 1) body = `
    <form class="form-grid" id="pf-form" novalidate>
      <div class="field"><label for="pf-n">Nome</label><input class="input" id="pf-n" value="${USER.nome}"></div>
      <div class="field"><label for="pf-e">E-mail</label><input class="input" id="pf-e" value="${USER.email}"></div>
      <div class="field"><label for="pf-c">Cidade</label><input class="input" id="pf-c" value="${USER.cidade}"></div>
      <div class="field"><label for="pf-t">Celular</label><input class="input" id="pf-t" value="(19) 99812-4407"></div>
      <div class="field full"><label>Restrições e preferências alimentares</label>
        <div class="chips" id="pf-pref">${['Sem lactose','Vegetariano','Sem glúten','Low carb','Sem restrições'].map((x,i) => `<button type="button" class="chip" aria-pressed="${i===4}">${x}</button>`).join('')}</div></div>
      <div class="actions full"><button class="btn btn-primary" type="submit">Salvar alterações</button></div>
    </form>`;
  if (perfTab === 2) body = `
    <div>
      ${[['Alertas de vencimento','Aviso antes da data-limite de cada produto aberto',true],['Resumo semanal','Domingo às 10:00, com o que vence na semana',true],['Notificações por e-mail','Uma cópia dos alertas no seu e-mail',false],['Avisos de produtos vencidos','Lembrete diário até você dar baixa no item',true],['Dicas de conservação','No máximo duas por semana',false]].map(([t,d,on],i) => `
      <div class="setting"><div><strong>${t}</strong><p>${d}</p></div><label class="switch"><input type="checkbox" id="sw-${i}" ${on?'checked':''} aria-label="${t}"><span></span></label></div>`).join('')}
      <div class="setting"><div><strong>Antecedência padrão</strong><p>Quantos dias antes do vencimento avisar</p></div><select class="select" id="ant" style="width:auto"><option>1 dia</option><option selected>2 dias</option><option>3 dias</option></select></div>
      <div class="setting"><div><strong>Horário dos alertas</strong><p>Escolha um momento em que você costuma estar em casa</p></div><input class="input" type="time" id="hora" value="08:00" style="width:auto"></div>
    </div>`;
  if (perfTab === 3) body = `
    <div class="card-head" style="margin-bottom:6px"><div><h3>Casa Oliveira</h3><p class="muted" style="font-size:.9rem">Todos compartilham a mesma geladeira e recebem os alertas.</p></div><button class="btn btn-soft btn-sm" id="invite">${ic('plus','sm')} Convidar</button></div>
    <div id="members">
      ${[['MO','Maria Oliveira','Administradora · você','var(--orange)'],['JO','João Oliveira','Registrou 9 produtos este mês','var(--olive)'],['LO','Lia Oliveira','Registrou 4 produtos este mês','var(--terra)']].map(m => `
      <div class="member"><span class="avatar sm" style="background:${m[3]}">${m[0]}</span><div style="flex:1;min-width:0"><strong>${m[1]}</strong><br><small class="muted">${m[2]}</small></div>${m[2].includes('você') ? '<span class="tag">Admin</span>' : `<button class="btn btn-ghost btn-sm" data-member="${m[1]}">Gerenciar</button>`}</div>`).join('')}
    </div>`;
  if (perfTab === 4) body = `
    <div class="plans" style="max-width:none">
      <article class="card plan" style="border-color:var(--green)">
        <span class="pill st-ok">Plano atual</span>
        <h3 style="margin-top:10px">Gratuito</h3><p class="price num">R$ 0</p>
        <ul><li>${ic('check','sm')} 14 de 15 produtos abertos usados</li><li>${ic('check','sm')} Cadastro por foto e texto</li><li>${ic('check','sm')} Alerta 1 dia antes</li></ul>
        <div class="bar warn"><i style="width:93%"></i></div><p class="muted" style="font-size:.85rem;margin-top:8px">Você está perto do limite do plano gratuito.</p>
      </article>
      <article class="card plan featured">
        <h3 style="display:flex;gap:8px;align-items:center">Premium ${ic('star','sm')}</h3><p class="price num">R$ 19,90 <small>/mês</small></p>
        <ul><li>${ic('check','sm')} Produtos ilimitados</li><li>${ic('check','sm')} Cadastro por áudio</li><li>${ic('check','sm')} Alertas por categoria</li><li>${ic('check','sm')} Casa com até 6 pessoas</li><li>${ic('check','sm')} Relatório mensal de impacto</li></ul>
        <button class="btn btn-terra btn-block" id="go-premium">Testar 7 dias grátis</button>
      </article>
    </div>`;
  return `
  <div class="page-head"><div><h1>Perfil e configurações</h1><p>Seus dados, sua casa e como o EatWise conversa com você.</p></div></div>
  <article class="card profile-head">
    <span class="avatar">${USER.iniciais}</span>
    <div style="flex:1;min-width:0"><h2>${USER.nome}</h2><p class="muted">${USER.email} · ${USER.cidade}</p></div>
    <div class="chips"><span class="tag">${ic('leaf','sm')} Membro desde maio/2026</span><span class="tag">${ic('star','sm')} Plano ${USER.plano}</span></div>
  </article>
  <div class="tabs" role="tablist" style="justify-self:start">${tabs.map(([k,n]) => `<button role="tab" data-ptab="${k}" aria-selected="${perfTab===k}">${n}</button>`).join('')}</div>
  <article class="card">${body}</article>`;
}
function bindPerfil(){
  $$('[data-ptab]').forEach(b => b.onclick = () => go('perfil-' + b.dataset.ptab));
  if ($('#pf-form')) {
    $$('#pf-pref .chip').forEach(c => c.onclick = () => c.setAttribute('aria-pressed', c.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'));
    $('#pf-form').addEventListener('submit', e => { e.preventDefault(); toast('Perfil atualizado com sucesso'); });
  }
  $$('.switch input').forEach(s => s.onchange = () => toast(`${s.getAttribute('aria-label')} ${s.checked ? 'ativado' : 'desativado'}`, 'bell'));
  $('#ant') && ($('#ant').onchange = e => toast(`Antecedência padrão: ${e.target.value}`, 'bell'));
  $('#hora') && ($('#hora').onchange = e => toast(`Alertas passam a chegar às ${e.target.value}`, 'clock'));
  $('#invite') && ($('#invite').onclick = () => modal(`
    <div class="m-ico i-green">${ic('users','lg')}</div><h2>Convidar para a Casa Oliveira</h2>
    <p class="muted">A pessoa convidada poderá registrar produtos e receber os alertas da geladeira compartilhada.</p>
    <div class="field"><label for="inv-e">E-mail</label><input class="input" id="inv-e" placeholder="nome@email.com" value="vo.helena@email.com"></div>
    <div class="modal-actions"><button class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-primary" id="inv-ok">Enviar convite</button></div>`,
    m => $('#inv-ok', m).onclick = () => { closeModal(); toast('Convite enviado para ' + esc($('#inv-e', m).value || 'o e-mail informado')); }));
  $$('[data-member]').forEach(b => b.onclick = () => modal(`
    <h2>${b.dataset.member}</h2><p class="muted">Defina o que essa pessoa pode fazer na Casa Oliveira.</p>
    <div class="setting"><div><strong>Pode registrar produtos</strong></div><label class="switch"><input type="checkbox" id="mp1" checked aria-label="Pode registrar"><span></span></label></div>
    <div class="setting"><div><strong>Recebe alertas de vencimento</strong></div><label class="switch"><input type="checkbox" id="mp2" checked aria-label="Recebe alertas"><span></span></label></div>
    <div class="modal-actions"><button class="btn btn-danger-soft" data-close id="rm">Remover da casa</button><button class="btn btn-primary" data-close id="mp-ok">Salvar</button></div>`,
    m => { $('#mp-ok', m).addEventListener('click', () => toast('Permissões atualizadas')); $('#rm', m).addEventListener('click', () => toast('Para remover membros, confirme pelo e-mail enviado ao administrador', 'info')); }));
  $('#go-premium') && ($('#go-premium').onclick = () => modal(`
    <div class="m-ico i-yellow">${ic('star','lg')}</div><h2>Ativar teste do Premium</h2>
    <p class="muted">Você terá 7 dias grátis com todos os recursos. Depois, R$ 19,90 por mês. Cancele quando quiser, sem multa.</p>
    <div class="modal-actions"><button class="btn btn-ghost" data-close>Agora não</button><button class="btn btn-terra" id="pm-ok">Começar teste grátis</button></div>`,
    m => $('#pm-ok', m).onclick = () => { USER.plano = 'Premium (teste)'; closeModal(); renderView(); toast('Teste grátis de 7 dias ativado. Aproveite o cadastro por áudio!', 'star'); }));
}

