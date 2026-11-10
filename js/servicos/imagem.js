/* ======================================================================
   Serviço de reconhecimento de ingredientes por imagem
   Abordagem: visão computacional no próprio navegador (TensorFlow.js),
   sem servidor e sem enviar a foto para lugar nenhum.
     1. COCO-SSD (detecção de objetos) acha os objetos na foto e já
        reconhece alguns alimentos (banana, maçã, laranja, brócolis, cenoura).
     2. MobileNet (classificação ImageNet, 1000 categorias) classifica cada
        objeto recortado e a foto inteira; as categorias de alimentos são
        traduzidas para os ingredientes do EatWise (mapa IMAGENET abaixo).
     3. Os resultados são somados por ingrediente (fica a maior confiança).
   Reserva: se os modelos não carregarem (sem internet, rede bloqueada,
   arquivo aberto do disco), usamos um reconhecimento SIMULADO pela cor
   predominante. Ele está isolado em simulado() e pode ser trocado por
   uma API real sem mexer nas telas.
   Limitações conhecidas: os modelos não têm categorias para arroz,
   feijão, ovo e tomate (o tomate é aproximado pela categoria
   "pomegranate"/romã, a mais parecida); fotos da geladeira inteira
   reconhecem pouco. Por isso a pessoa sempre confirma a lista.
   ====================================================================== */
window.EW = window.EW || {};

EW.imagem = (() => {
  const URLS = {
    tf: 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js',
    coco: 'https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js',
    mobilenet: 'https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_1.0_224/model.json'
  };
  // categorias ImageNet (índice) -> ingrediente
  const IMAGENET = {
    954: 'banana', 948: 'maca', 950: 'laranja', 951: 'limao', 949: 'morango', 953: 'abacaxi',
    937: 'brocolis', 938: 'couve flor', 936: 'repolho', 939: 'abobrinha', 941: 'abobora', 942: 'abobora',   // 940 (spaghetti squash) fica de fora: o modelo confunde com banana
    943: 'pepino', 945: 'pimentao', 947: 'cogumelo', 987: 'milho', 998: 'milho', 935: 'batata', 924: 'abacate',
    957: 'tomate', 930: 'pao', 931: 'pao', 934: 'salsicha', 959: 'macarrao', 962: 'carne moida'
  };
  // classes COCO-SSD -> ingrediente
  const COCO = {banana: 'banana', apple: 'maca', orange: 'laranja', broccoli: 'brocolis', carrot: 'cenoura', 'hot dog': 'salsicha', sandwich: 'pao'};
  const TEMPO_LIMITE = 45000;
  let modelos = null;

  function script(src){
    return new Promise((ok, erro) => {
      if ([...document.scripts].some(s => s.src === src)) return ok();
      const s = document.createElement('script');
      s.src = src; s.async = true; s.crossOrigin = 'anonymous';
      s.onload = ok; s.onerror = () => erro(new Error('não foi possível baixar ' + src.split('/')[2]));
      document.head.appendChild(s);
    });
  }
  const comTempo = (p, ms) => Promise.race([p, new Promise((_, r) => setTimeout(() => r(new Error('tempo esgotado ao carregar os modelos')), ms))]);

  /** Carrega TensorFlow.js + COCO-SSD + MobileNet uma única vez. */
  function carregar(progresso){
    if (!modelos) {
      modelos = comTempo((async () => {
        progresso && progresso('Baixando o TensorFlow.js');
        if (!window.tf) await script(URLS.tf);
        if (!window.cocoSsd) await script(URLS.coco);
        progresso && progresso('Baixando os modelos de visão (só na primeira vez)');
        const [coco, mobilenet] = await Promise.all([cocoSsd.load({base: 'lite_mobilenet_v2'}), tf.loadLayersModel(URLS.mobilenet)]);
        return {coco, mobilenet};
      })(), TEMPO_LIMITE).catch(e => { modelos = null; throw e; });
    }
    return modelos;
  }

  /** MobileNet: as 5 categorias mais prováveis da imagem (ou de um recorte [x, y, largura, altura]). */
  function classificar(mobilenet, fonte, caixa){
    let top = [];
    tf.tidy(() => {
      let t = tf.browser.fromPixels(fonte);
      if (caixa) {
        const [x, y, w, h] = caixa.map(v => Math.max(0, Math.round(v)));
        t = t.slice([y, x, 0], [Math.min(h, t.shape[0] - y), Math.min(w, t.shape[1] - x), 3]);
      }
      const entrada = tf.image.resizeBilinear(t, [224, 224]).toFloat().div(127.5).sub(1).expandDims(0);
      const probs = mobilenet.predict(entrada).squeeze().dataSync();
      const deslocamento = probs.length === 1001 ? 1 : 0;   // alguns modelos têm a classe "fundo" na posição 0
      top = Array.from(probs).map((p, i) => ({i: i - deslocamento, p})).sort((a, b) => b.p - a.p).slice(0, 5);
    });
    return top;
  }

  const carregarImagem = src => new Promise((ok, erro) => { const im = new Image(); im.onload = () => ok(im); im.onerror = erro; im.src = src; });

  /**
   * Reconhece ingredientes numa foto.
   * @returns {Promise<{fonte:'modelo'|'simulado', motivo?:string, itens:Array<{ingrediente:string, confianca:number}>}>}
   */
  async function reconhecer(dataUrl, progresso){
    const img = await carregarImagem(dataUrl);
    let m;
    try { m = await carregar(progresso); }
    catch (e) { return {fonte: 'simulado', motivo: e.message, itens: simulado(img)}; }
    progresso && progresso('Procurando alimentos na foto');
    const achados = new Map();
    const somar = (ing, conf, origem) => {
      const a = achados.get(ing);
      if (!a || conf > a.confianca) achados.set(ing, {ingrediente: ing, confianca: conf, origem});
    };
    const deteccoes = await m.coco.detect(img, 20, 0.3);
    for (const d of deteccoes) {
      if (COCO[d.class]) somar(COCO[d.class], d.score, 'objeto');
      if (d.bbox[2] * d.bbox[3] >= 48 * 48) {
        for (const c of classificar(m.mobilenet, img, d.bbox)) if (IMAGENET[c.i] && c.p >= 0.15) somar(IMAGENET[c.i], c.p, 'objeto');
      }
    }
    // foto inteira e recorte central (fotos de um alimento só)
    const w = img.naturalWidth, h = img.naturalHeight, lado = Math.min(w, h) * 0.7;
    for (const caixa of [null, [(w - lado) / 2, (h - lado) / 2, lado, lado]]) {
      for (const c of classificar(m.mobilenet, img, caixa)) if (IMAGENET[c.i] && c.p >= 0.12) somar(IMAGENET[c.i], c.p, 'foto');
    }
    const itens = [...achados.values()].sort((a, b) => b.confianca - a.confianca).slice(0, 8);
    return {fonte: 'modelo', itens, objetos: deteccoes.map(d => d.class)};
  }

  /**
   * Reconhecimento SIMULADO (reserva): sugere ingredientes pela cor predominante.
   * Serve para o protótipo funcionar sem os modelos; trocar por API real depois.
   */
  function simulado(img){
    const N = 48, c = document.createElement('canvas'); c.width = c.height = N;
    const x = c.getContext('2d', {willReadFrequently: true});
    x.drawImage(img, 0, 0, N, N);
    let d;
    try { d = x.getImageData(0, 0, N, N).data; } catch (e) { return [{ingrediente: 'tomate', confianca: 0.4}, {ingrediente: 'cebola', confianca: 0.3}]; }
    const cores = {vermelho: 0, laranja: 0, amarelo: 0, verde: 0};
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i] / 255, g = d[i + 1] / 255, b = d[i + 2] / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b);
      if (mx < 0.25 || (mx - mn) / (mx || 1) < 0.3) continue;      // ignora fundo escuro/cinza
      let hue = mx === r ? ((g - b) / (mx - mn)) % 6 : mx === g ? (b - r) / (mx - mn) + 2 : (r - g) / (mx - mn) + 4;
      hue = (hue * 60 + 360) % 360;
      if (hue < 18 || hue >= 330) cores.vermelho++; else if (hue < 40) cores.laranja++; else if (hue < 70) cores.amarelo++; else if (hue < 170) cores.verde++;
    }
    const total = Object.values(cores).reduce((a, b) => a + b, 0) || 1;
    const sugestao = {vermelho: 'tomate', laranja: 'cenoura', amarelo: 'banana', verde: 'alface'};
    return Object.entries(cores).filter(([, n]) => n / total > 0.12).sort((a, b) => b[1] - a[1]).slice(0, 3)
      .map(([cor, n]) => ({ingrediente: sugestao[cor], confianca: Math.min(0.6, n / total)}));
  }

  return {reconhecer, carregar, simulado, URLS, IMAGENET, COCO};
})();
