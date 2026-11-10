/* ======================================================================
   Serviço de normalização de ingredientes
   Transforma o que a pessoa escreve ("Tomates", "Peito de frango",
   "creme de leite leve") na chave usada pelas receitas ("tomate",
   "frango", "creme de leite"). Passos:
     1. minúsculas, sem acento, sem pontuação;
     2. cada palavra no singular (regras simples do português);
     3. sinônimos (ex.: "aipim" -> "mandioca", "mussarela" -> "queijo");
     4. se começar por um ingrediente conhecido, fica com ele
        ("tomate italiano" -> "tomate"); se terminar por um, idem
        ("file de frango" -> "frango").
   ====================================================================== */
window.EW = window.EW || {};

EW.normalizacao = (() => {
  // nomes e variações comuns -> chave do ingrediente
  const SINONIMOS = {
    'mussarela':'queijo', 'mucarela':'queijo', 'muzzarela':'queijo', 'queijo mussarela':'queijo', 'queijo mucarela':'queijo',
    'parmesao':'queijo', 'queijo parmesao':'queijo', 'queijo ralado':'queijo', 'queijo minas':'queijo', 'queijo prato':'queijo',
    'peito de frango':'frango', 'file de frango':'frango', 'coxa de frango':'frango', 'sobrecoxa':'frango', 'frango desfiado':'frango',
    'patinho moido':'carne moida', 'carne de boi':'carne', 'bife':'carne', 'acem':'carne', 'patinho':'carne',
    'file de peixe':'peixe', 'tilapia':'peixe', 'merluza':'peixe', 'sardinha':'peixe',
    'aipim':'mandioca', 'macaxeira':'mandioca', 'batata inglesa':'batata', 'jerimum':'abobora',
    'salsinha':'cheiro verde', 'salsa':'cheiro verde', 'cebolinha':'cheiro verde', 'coentro':'cheiro verde',
    'espaguete':'macarrao', 'massa':'macarrao', 'penne':'macarrao', 'parafuso':'macarrao', 'talharim':'macarrao', 'miojo':'macarrao',
    'pao frances':'pao', 'pao de forma':'pao', 'pao integral':'pao', 'paozinho':'pao',
    'farinha':'farinha de trigo', 'trigo':'farinha de trigo', 'farofa pronta':'farinha de mandioca',
    'goma de tapioca':'tapioca', 'polvilho':'tapioca', 'cuscuz':'flocao de milho', 'flocao':'flocao de milho',
    'extrato de tomate':'molho de tomate', 'polpa de tomate':'molho de tomate', 'passata':'molho de tomate',
    'oleo de soja':'oleo', 'oleo de girassol':'oleo', 'azeite de oliva':'azeite',
    'iogurte natural':'iogurte', 'coalhada':'iogurte', 'manteiga sem sal':'manteiga', 'margarina':'manteiga',
    'clara':'ovo', 'gema':'ovo', 'ovo caipira':'ovo', 'ovo de galinha':'ovo',
    'acucar mascavo':'acucar', 'acucar cristal':'acucar', 'adocante':'acucar', 'sal grosso':'sal',
    'pimenta':'pimenta do reino', 'chocolate em po':'cacau', 'achocolatado':'cacau',
    'tangerina':'laranja', 'mexerica':'laranja', 'bergamota':'laranja', 'papaia':'mamao',
    'milho verde':'milho', 'ervilha em conserva':'ervilha', 'grao':'grao de bico'
  };
  // palavras que terminam em "s" mas já estão no singular
  const SINGULAR_EM_S = new Set(['brocolis', 'ananas', 'lapis', 'pires', 'gas', 'mais', 'tres']);

  const semAcento = t => t.normalize('NFD').replace(/[̀-ͯ]/g, '');

  function singular(p){
    if (p.length <= 3 || SINGULAR_EM_S.has(p)) return p;
    if (/oes$/.test(p)) return p.replace(/oes$/, 'ao');   // limões -> limao
    if (/aes$/.test(p)) return p.replace(/aes$/, 'ao');   // pães -> pao
    if (/ais$/.test(p)) return p.replace(/ais$/, 'al');   // animais -> animal
    if (/eis$/.test(p)) return p.replace(/eis$/, 'el');   // pastéis -> pastel
    if (/ns$/.test(p))  return p.replace(/ns$/, 'm');     // vagens -> vagem
    if (/(r|z)es$/.test(p)) return p.slice(0, -2);        // nozes -> noz
    if (/s$/.test(p) && !/ss$/.test(p)) return p.slice(0, -1); // tomates -> tomate
    return p;
  }

  // texto limpo, palavra a palavra no singular
  function limpar(texto){
    return semAcento(String(texto || '').toLowerCase())
      .replace(/[-_/]/g, ' ').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim()
      .split(' ').filter(Boolean).map(singular).join(' ');
  }

  const conhecidos = () => Object.keys(INGREDIENTES);
  const canon = k => SINONIMOS[k] || k;

  /** Chave normalizada do ingrediente. Ex.: "Tomates maduros" -> "tomate". */
  function normalizar(texto){
    const t = limpar(texto);
    if (!t) return '';
    if (SINONIMOS[t]) return SINONIMOS[t];
    if (INGREDIENTES[t]) return t;
    const chaves = conhecidos().concat(Object.keys(SINONIMOS)).sort((a, b) => b.length - a.length);
    const comeco = chaves.find(k => t.startsWith(k + ' '));   // "tomate italiano"
    if (comeco) return canon(comeco);
    // "dente de alho", "lata de milho", "fatia de queijo": descritor + "de" + ingrediente
    const desc = t.match(/^(dente|cabeca|folha|ramo|maco|fatia|pedaco|posta|lata|pacote|pote|caixa|vidro|xicara|colher|copo|file|peito) (de|da|do) (.+)$/);
    if (desc) return normalizar(desc[3]);
    return t;                                                  // ingrediente novo: fica como foi escrito (limpo)
  }

  /** Nome bonito para mostrar na tela. */
  function rotulo(chave){
    if (INGREDIENTES[chave]) return INGREDIENTES[chave].nome;
    return chave ? chave.charAt(0).toUpperCase() + chave.slice(1) : '';
  }

  const conhecido = chave => !!INGREDIENTES[chave];

  return {normalizar, rotulo, conhecido, limpar};
})();
