/* ---------- Registrar produto (funcionalidade principal) ---------- */
let addState = {method:'foto', stage:'input', pick:null, q:''};
function resetAdd(){ addState = {method:addState.method, stage:'input', pick:null, q:'', camOn:addState.camOn}; }

/* Câmera real (getUserMedia). Sem permissão ou fora de https, cai no seletor de arquivo,
   que no celular abre o app de câmera do aparelho. O reconhecimento continua simulado. */
let camStream = null, camFacing = 'environment', guessIdx = 0;
const GUESS_ORDER = ['maionese','requeijao','molho-tomate','leite','creme-leite','ketchup','presunto','geleia','mostarda','mucarela'];
const guessesFor = k => (addState.alts && addState.alts.length ? addState.alts : GUESS_ORDER).filter(x => x !== k).slice(0, 3);

/* Reconhecimento feito no próprio aparelho, sem servidor:
   1) lê o código de barras (BarcodeDetector, disponível no Chrome do Android);
   2) se não houver código legível, compara as cores da embalagem com as fotos de referência
      e devolve os produtos mais parecidos. */
const REF_SIG = {};
function colorSignature(src, w, h, crop){
  const N = 56, c = document.createElement('canvas'); c.width = c.height = N;
  const x = c.getContext('2d', {willReadFrequently:true});
  const cw = w * crop, ch = h * crop;
  x.drawImage(src, (w - cw) / 2, (h - ch) / 2, cw, ch, 0, 0, N, N);
  const d = x.getImageData(0, 0, N, N).data, H = new Float32Array(12 * 2 * 3 + 4);
  let n = 0;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i] / 255, g = d[i+1] / 255, b = d[i+2] / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), sat = mx ? (mx - mn) / mx : 0;
    if (mx > .9 && sat < .1) continue;              // ignora fundo branco
    let bin;
    if (sat < .2) bin = 72 + Math.min(3, Math.floor(mx * 4));
    else {
      let hue = mx === r ? ((g - b) / (mx - mn)) % 6 : mx === g ? (b - r) / (mx - mn) + 2 : (r - g) / (mx - mn) + 4;
      hue = (hue * 60 + 360) % 360;
      bin = Math.floor(hue / 30) * 6 + (sat < .55 ? 0 : 3) + Math.min(2, Math.floor(mx * 3));
    }
    H[bin]++; n++;
  }
  for (let i = 72; i < H.length; i++) H[i] *= .35;       // cinzas e textos pesam menos que a cor da marca
  let t = 0; for (let i = 0; i < H.length; i++) t += H[i];
  if (t) for (let i = 0; i < H.length; i++) H[i] /= t;
  return H;
}
const similarity = (a, b) => { let t = 0; for (let i = 0; i < a.length; i++) t += Math.sqrt(a[i] * b[i]); return t; };
const loadImg = src => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src; });
async function recognize(dataUrl){
  const photo = await loadImg(dataUrl);
  if ('BarcodeDetector' in window) {
    try {
      const codes = await new BarcodeDetector({formats:['ean_13','ean_8','upc_a']}).detect(photo);
      for (const code of codes) {
        const hit = CATALOG.find(c => c.ean === code.rawValue);
        if (hit) return {pick:hit.k, alts:[], how:'barcode', conf:100};
      }
    } catch (e) {}
  }
  try {
    for (const c of CATALOG) if (!REF_SIG[c.k]) { const im = await loadImg(IMG(c.k)); REF_SIG[c.k] = colorSignature(im, im.naturalWidth, im.naturalHeight, 1); }
    const sig = colorSignature(photo, photo.naturalWidth, photo.naturalHeight, .75);
    const ranked = CATALOG.map(c => ({k:c.k, score:similarity(sig, REF_SIG[c.k])})).sort((a, b) => b.score - a.score);
    return {pick:ranked[0].k, alts:ranked.slice(1, 4).map(r => r.k), how:'visual', conf:Math.round(Math.max(40, Math.min(97, ranked[0].score * 100)))};
  } catch (e) {
    const k = GUESS_ORDER[guessIdx++ % GUESS_ORDER.length];   // imagens bloqueadas (ex.: aberto direto do disco)
    return {pick:k, alts:GUESS_ORDER.filter(x => x !== k).slice(0, 3), how:'fallback', conf:60};
  }
}
function stopCamera(){ if (camStream) { camStream.getTracks().forEach(t => t.stop()); camStream = null; } }
async function startCamera(){
  const v = $('#vf-video');
  if (!v || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return false;
  try {
    stopCamera();
    camStream = await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:camFacing}, width:{ideal:1280}, height:{ideal:960}}, audio:false});
    if (!$('#vf-video')) { stopCamera(); return false; }
    v.srcObject = camStream; v.hidden = false;
    await v.play().catch(() => {});
    $('#vf-idle').hidden = true;
    $('#vf').classList.add('live');
    $('#vf').classList.toggle('mirror', camFacing === 'user');
    addState.camOn = true;
    return true;
  } catch (e) { return false; }
}
function shrinkToDataURL(src, w, h){
  const scale = Math.min(1, 900 / Math.max(w, h));
  const c = document.createElement('canvas');
  c.width = Math.round(w * scale); c.height = Math.round(h * scale);
  c.getContext('2d').drawImage(src, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', .85);
}
function fileToDataURL(file){
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file), im = new Image();
    im.onload = () => { const d = shrinkToDataURL(im, im.naturalWidth, im.naturalHeight); URL.revokeObjectURL(url); res(d); };
    im.onerror = () => { URL.revokeObjectURL(url); rej(new Error('imagem inválida')); };
    im.src = url;
  });
}
function usePhoto(dataUrl){
  stopCamera();
  addState.photo = dataUrl;
  addState.pick = null; addState.recog = null;
  addState.stage = 'processing';
  recognize(dataUrl).then(r => { addState.recog = r; addState.pick = r.pick; addState.alts = r.alts; });
  renderView();
  if (document.getElementById('root')) document.getElementById('root').scrollTop = 0; else window.scrollTo(0, 0);
}

function viewAdd(){
  const s = addState;
  const m = (k, sub) => `<button class="method" role="tab" data-method="${k}" aria-selected="${s.method===k}"><span class="ico">${ic(METHODS[k].i,'lg')}</span>${METHODS[k].n}<small>${sub}</small></button>`;
  let panel = '';
  if (s.stage === 'input') {
    if (s.method === 'foto') panel = `
      <div class="cam">
        <div class="viewfinder" id="vf">
          <video id="vf-video" playsinline muted autoplay hidden></video>
          <div class="vf-idle" id="vf-idle">${ic('camera')}<strong>Fotografe o rótulo do produto</strong><span>Toque no botão redondo para abrir a câmera ou envie uma foto da galeria.</span></div>
          <span class="vf-frame"><i></i><i></i><i></i><i></i></span>
          <span class="vf-scan"></span>
          <span class="vf-hint">Enquadre o rótulo do produto</span>
        </div>
        <div class="shutter-row">
          <label class="vf-btn" for="photo-gallery" title="Escolher uma foto que já está no aparelho"><span class="vf-side">${ic('upload')}</span>Galeria</label>
          <button class="shutter" id="vf-shoot" aria-label="Tirar foto"></button>
          <button class="vf-btn" id="vf-switch" type="button" title="Trocar câmera" style="background:none;border:0;padding:0"><span class="vf-side">${ic('flip')}</span>Virar</button>
        </div>
        <input type="file" id="photo-gallery" class="file-hidden" accept="image/*" tabindex="-1">
        <input type="file" id="photo-input" class="file-hidden" accept="image/*" capture="environment" tabindex="-1">
      </div>`;
    if (s.method === 'texto') panel = `
      <div class="field"><label for="add-q">Qual produto você abriu?</label>
      <div class="input-icon">${ic('search','sm')}<input class="input" id="add-q" placeholder="Ex.: requeijão, molho de tomate, presunto" value="${esc(s.q)}" autocomplete="off"></div></div>
      <div class="suggest" id="add-suggest"></div>`;
    if (s.method === 'audio') panel = `
      <div class="processing" id="audio-box">
        <button class="mic" id="mic-btn" aria-label="Começar a gravar">${ic('mic')}</button>
        <strong>Toque e diga o que você abriu</strong>
        <p class="muted" style="font-size:.9rem">Exemplo: “Abri agora um requeijão cremoso Itambé”.</p>
      </div>`;
  } else if (s.stage === 'processing') {
    panel = `<div class="processing">${s.photo ? `<img class="proc-photo" src="${s.photo}" alt="Foto tirada do produto">` : ''}<div class="spinner" aria-hidden="true"></div><strong>Identificando o produto…</strong>
      <div class="proc-steps" id="proc-steps">
        <div class="now" data-i="0">${ic('clock','sm')} ${s.method==='audio'?'Transcrevendo o áudio':s.method==='foto'?'Procurando o código de barras':'Interpretando o texto'}</div>
        <div data-i="1">${ic('clock','sm')} ${s.method==='foto'?'Comparando com as embalagens conhecidas':'Reconhecendo produto e marca'}</div>
        <div data-i="2">${ic('clock','sm')} Consultando a base de prazos</div>
        <div data-i="3">${ic('clock','sm')} Calculando a nova data-limite</div>
      </div></div>`;
  } else {
    const c = CATALOG.find(x => x.k === s.pick), b = baseBy(s.pick);
    panel = `
      <div class="result">
        <div class="shot-pair">${s.photo ? `<img class="shot" src="${s.photo}" alt="Sua foto">` : ''}${foodTile(s.pick,'lg')}</div>
        <div class="t"><span class="conf">${ic('spark','sm')} ${s.method!=='foto' ? `Identificado por IA · ${s.method==='texto'?'99':'94'}% de confiança` : s.recog && s.recog.how==='barcode' ? 'Código de barras lido · produto exato' : `Reconhecido pela imagem · ${s.recog ? s.recog.conf : 60}% de semelhança`}</span>
          <h2 style="margin:4px 0 2px">${c.nome}</h2><p class="muted">${c.marca}</p>
          <div class="chips" style="margin-top:8px"><span class="tag">${CATS[b.cat].nome}</span><span class="tag">${ic('cal','sm')} ${b.dias} ${b.dias===1?'dia':'dias'} após aberto</span></div></div>
      </div>
      <blockquote class="label-quote">${b.doRotulo ? 'No rótulo' : 'Orientação'}: “${b.orient}”</blockquote>
      ${s.method==='foto' ? `<div class="guess-row"><span class="muted" style="font-size:.85rem;font-weight:700">Não é esse? Parecidos com a sua foto:</span>${guessesFor(s.pick).map(k => `<button type="button" class="guess" data-guess="${k}">${foodTile(k)}${CATALOG.find(x => x.k === k).nome}</button>`).join('')}</div>` : ''}
      <button class="link-btn" id="not-this" style="justify-self:start">Buscar o produto pelo nome</button>
      <form id="add-form" class="form-grid" novalidate>
        <div class="field"><label for="f-open">Data de abertura</label><input class="input" type="date" id="f-open" value="${iso(TODAY)}" max="${iso(TODAY)}"></div>
        <div class="field"><label for="f-loc">Onde vai ficar guardado?</label><select class="select" id="f-loc">${Object.entries(LOCS).map(([k,n]) => `<option value="${k}" ${k==='gel'?'selected':''}>${n}</option>`).join('')}</select></div>
        <div class="field"><label for="f-alert">Me avisar</label><select class="select" id="f-alert"><option value="1">1 dia antes</option><option value="2">2 dias antes</option><option value="3" ${b.dias>=7?'selected':''}>3 dias antes</option></select></div>
        <div class="field"><label for="f-who">Quem abriu</label><select class="select" id="f-who"><option>Maria</option><option>João</option><option>Lia</option></select></div>
        <div class="limit-box full" id="limit-box"></div>
        <div class="field full"><label for="f-note">Observação (opcional)</label><input class="input" id="f-note" placeholder="Ex.: sobrou metade, usar na lasanha de sábado"></div>
        <div class="actions full"><button class="btn btn-primary" type="submit">${ic('check','sm')} Salvar produto</button><button class="btn btn-ghost" type="button" id="add-cancel">Cancelar</button></div>
      </form>`;
  }
  const stageIdx = s.stage === 'input' ? 0 : s.stage === 'processing' ? 1 : 3;
  const flow = [['Registro','Foto, texto ou áudio'],['IA de reconhecimento','Identifica produto e marca'],['Base de prazos','Prazo por categoria'],['Cálculo do prazo','Nova data-limite'],['Alerta ao usuário','Aviso antes de vencer']];
  return `
  <div class="page-head"><div><button class="back-link" data-go="dashboard">${ic('left','sm')} Início</button><h1 style="margin-top:8px">Registrar produto aberto</h1><p>Escolha como prefere registrar. O EatWise cuida do resto.</p></div></div>
  <div class="add-grid">
    <article class="card" style="display:grid;gap:18px">
      <div class="method-tabs" role="tablist" aria-label="Forma de registro">${m('foto','Pelo rótulo')}${m('texto','Digitando')}${m('audio','Falando')}</div>
      ${panel}
    </article>
    <div class="stack">
      <article class="card">
        <h3 style="margin-bottom:16px">O que acontece por trás</h3>
        <div class="flow-mini">${flow.map((f,i) => `<div class="fs ${i<=stageIdx?'on':''}"><span class="ico">${i<stageIdx?ic('check','sm'):i+1}</span><div><strong>${f[0]}</strong><p>${f[1]}</p></div></div>`).join('')}</div>
      </article>
      <article class="card tip">
        <p class="eyebrow">${ic('info','sm')} Por que registrar na hora?</p>
        <p class="muted" style="margin-top:8px;font-size:.92rem">O prazo pós-abertura conta a partir do dia em que a embalagem foi aberta. Registrar no momento garante que o alerta chegue no dia certo.</p>
      </article>
    </div>
  </div>`;
}

function bindAdd(){
  $$('[data-method]').forEach(b => b.onclick = () => { addState = {method:b.dataset.method, stage:'input', pick:null, q:''}; renderView(); });
  const s = addState;
  if (s.stage === 'input' && s.method === 'foto') {
    const input = $('#photo-input');
    const pickFile = () => input.click();
    const onFile = async e => {
      const f = e.target.files && e.target.files[0]; if (!f) return;
      try { usePhoto(await fileToDataURL(f)); }
      catch (err) { e.target.value = ''; toast('Não foi possível ler essa imagem. Tente uma foto em JPG ou PNG.', 'info'); }
    };
    input.onchange = onFile;
    $('#photo-gallery').onchange = onFile;
    $('#vf-shoot').onclick = async () => {
      const v = $('#vf-video');
      if (camStream && v.videoWidth) {
        $('#vf').insertAdjacentHTML('beforeend', '<span class="vf-flash"></span>');
        const shot = shrinkToDataURL(v, v.videoWidth, v.videoHeight);
        setTimeout(() => usePhoto(shot), 250);
      } else if (!(await startCamera())) {
        toast('A câmera não abriu aqui. Escolha ou tire uma foto pelo celular.', 'camera');
        pickFile();
      }
    };
    $('#vf-switch').onclick = async () => { camFacing = camFacing === 'environment' ? 'user' : 'environment'; if (!(await startCamera())) toast('Não há outra câmera disponível', 'camera'); };
    if (addState.camOn) startCamera();
  }
  if (s.stage === 'result') $$('[data-guess]').forEach(g => g.onclick = () => { const k = g.dataset.guess; addState.alts = [addState.pick, ...(addState.alts || []).filter(x => x !== k)]; addState.pick = k; renderView(); });
  if (s.stage === 'input' && s.method === 'texto') {
    const q = $('#add-q'), box = $('#add-suggest');
    const fill = () => {
      const t = q.value.trim().toLowerCase();
      const list = (t ? CATALOG.filter(c => (c.nome + ' ' + c.marca + ' ' + baseBy(c.k).item).toLowerCase().includes(t)) : CATALOG.slice(0,5)).slice(0,6);
      box.innerHTML = (t ? '' : `<div style="padding:10px 14px;font-size:.8rem;font-weight:800;color:var(--muted);letter-spacing:.06em;text-transform:uppercase;background:var(--bg)">Mais registrados</div>`) +
        (list.length ? list.map(c => { const b = baseBy(c.k); return `<button type="button" data-pick="${c.k}">${foodTile(c.k)}<span style="min-width:0;flex:1"><strong style="display:block">${c.nome}</strong><small class="muted">${c.marca}</small></span><span class="tag">${b.dias} dias</span></button>`; }).join('')
        : `<div style="padding:16px" class="muted">Nenhum produto encontrado. Tente outro nome, como “ketchup” ou “geleia”.</div>`);
      $$('[data-pick]', box).forEach(x => x.onclick = () => startProcessing(x.dataset.pick));
    };
    q.addEventListener('input', fill); fill(); q.focus();
  }
  if (s.stage === 'input' && s.method === 'audio') {
    $('#mic-btn').onclick = () => {
      const box = $('#audio-box');
      box.innerHTML = `<button class="mic rec" aria-label="Gravando">${ic('mic')}</button><div class="wave">${Array.from({length:9},(_,i)=>`<i style="animation-delay:${i*.1}s"></i>`).join('')}</div><strong>Ouvindo…</strong>`;
      setTimeout(() => {
        box.innerHTML = `<span class="method-ico" style="width:56px;height:56px;background:var(--terra-soft);color:var(--terra)">${ic('mic','lg')}</span>
          <p style="font-family:var(--font-display);font-size:1.2rem;font-weight:700;max-width:30ch">“Abri agora um requeijão cremoso Itambé”</p><p class="muted">Transcrição concluída</p>`;
        setTimeout(() => startProcessing('requeijao'), 900);
      }, 2200);
    };
  }
  if (s.stage === 'processing') {
    let i = 0;
    const tick = setInterval(() => {
      const rows = $$('#proc-steps div'); if (!rows.length) { clearInterval(tick); return; }
      rows[i].className = 'done'; rows[i].innerHTML = ic('check','sm') + rows[i].textContent;
      i++;
      if (i < rows.length) rows[i].className = 'now';
      else {
        clearInterval(tick);
        const done = () => { if (addState.stage !== 'processing') return; if (addState.method === 'foto' && !addState.recog) return setTimeout(done, 150); addState.stage = 'result'; renderView(); };
        setTimeout(done, 300);
      }
    }, 550);
  }
  if (s.stage === 'result') {
    const b = baseBy(s.pick);
    const upd = () => {
      const d = new Date($('#f-open').value + 'T12:00:00');
      const lim = addDays(d, b.dias), al = addDays(lim, -Number($('#f-alert').value));
      $('#limit-box').innerHTML = `<span class="food" style="background:var(--green-soft);color:var(--green)">${ic('cal','lg')}</span>
        <div><p class="muted" style="font-size:.85rem;font-weight:700">Consumir com segurança até</p><p class="big num">${WEEK[lim.getDay()]}, ${fmtFull(lim)}</p><p class="muted" style="font-size:.86rem">Alerta agendado para ${fmt(al)} às 08:00 · ${b.dias} dias para ${CATS[b.cat].nome.toLowerCase()}</p></div>`;
    };
    ['f-open','f-alert'].forEach(id => $('#'+id).addEventListener('change', upd)); upd();
    $('#not-this').onclick = () => { addState = {method:'texto', stage:'input', pick:null, q:''}; renderView(); };
    $('#add-cancel').onclick = () => { resetAdd(); renderView(); };
    $('#add-form').addEventListener('submit', e => {
      e.preventDefault();
      const d = new Date($('#f-open').value + 'T12:00:00');
      const id = nextId++;
      PRODUCTS.unshift({id, k:s.pick, foto:s.photo || null, abertoEm:$('#f-open').value, loc:$('#f-loc').value, via:s.method, alerta:Number($('#f-alert').value), quem:$('#f-who').value, novo:true});
      const lim = addDays(d, b.dias);
      resetAdd();
      go('produto-' + id);
      setTimeout(() => toast(`Produto cadastrado! Alerta agendado para ${fmt(addDays(lim, -Number(PRODUCTS[0].alerta)))}.`), 120);
    });
  }
}
function startProcessing(k){ addState.pick = k; addState.stage = 'processing'; renderView(); }

