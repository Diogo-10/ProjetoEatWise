/* ======================================================================
   Serviço de reconhecimento de texto
   Entrada: frase livre, ex.: "2 ovos, 3 tomates, meio quilo de frango e queijo".
   Saída: lista estruturada, ex.:
     [{nome:'ovos', ingrediente:'ovo', quantidade:2, unidade:'un'}, ...]
   Passos:
     1. separar os itens (vírgula, ponto e vírgula, quebra de linha, " e ", "+");
     2. retirar quantidade (número, fração ou por extenso) e unidade;
     3. retirar palavras de enchimento ("tenho", "um pouco de", "uns"...);
     4. normalizar o nome (EW.normalizacao) e juntar itens repetidos.
   ====================================================================== */
window.EW = window.EW || {};

EW.texto = (() => {
  const NUMEROS = {um:1, uma:1, dois:2, duas:2, tres:3, quatro:4, cinco:5, seis:6, sete:7, oito:8, nove:9, dez:10,
                   onze:11, doze:12, meio:0.5, meia:0.5, duzia:12};
  // unidade escrita -> unidade padrão
  const UNIDADES = [
    [/^(kg|kgs|quilo|quilos|kilo|kilos)$/, 'kg'], [/^(g|gr|grama|gramas)$/, 'g'],
    [/^(l|lt|litro|litros)$/, 'L'], [/^(ml|mililitro|mililitros)$/, 'ml'],
    [/^(un|und|unid|unidade|unidades)$/, 'un'], [/^(duzia|duzias)$/, 'dúzia'],
    [/^(pacote|pacotes|pct)$/, 'pacote'], [/^(lata|latas)$/, 'lata'], [/^(caixa|caixas|cx)$/, 'caixa'],
    [/^(pote|potes)$/, 'pote'], [/^(vidro|vidros)$/, 'vidro'], [/^(dente|dentes)$/, 'dente'],
    [/^(maco|macos)$/, 'maço'], [/^(fatia|fatias)$/, 'fatia'], [/^(pedaco|pedacos)$/, 'pedaço'],
    [/^(xicara|xicaras)$/, 'xícara'], [/^(colher|colheres)$/, 'colher'], [/^(copo|copos)$/, 'copo'],
    [/^(cabeca|cabecas)$/, 'cabeça'], [/^(bandeja|bandejas)$/, 'bandeja'], [/^(saco|sacos)$/, 'saco']
  ];
  const ENCHIMENTO = /^(eu\s+)?(tenho|temos|tem|sobrou|sobraram|comprei|ha|há)\s+|^(um\s+pouco|uns|umas|alguns|algumas|o|a|os|as)\s+(de\s+)?/;

  const semAcento = t => t.normalize('NFD').replace(/[̀-ͯ]/g, '');

  /** Separa a frase em pedaços, um por ingrediente. */
  function separar(texto){
    return String(texto || '')
      .replace(/\([^)]*\)/g, ' ')                        // remove observações entre parênteses
      .split(/[,;\n+]|\s+e\s+|\s+&\s+/i)
      .map(t => t.trim()).filter(Boolean);
  }

  /** Lê "2", "1,5", "1/2", "meio", "uma dúzia" no começo do texto. */
  function lerQuantidade(palavras){
    const p0 = semAcento(palavras[0] || '').toLowerCase();
    let qtd = null, usadas = 0;
    let m;
    if ((m = p0.match(/^(\d+)\/(\d+)$/))) { qtd = Number(m[1]) / Number(m[2]); usadas = 1; }
    else if ((m = p0.match(/^(\d+(?:[.,]\d+)?)([a-z]+)?$/))) {              // "2", "1,5", "500g"
      qtd = Number(m[1].replace(',', '.')); usadas = 1;
      if (m[2]) palavras.splice(1, 0, m[2]);                                 // "500g" -> "500" + "g"
    }
    else if (NUMEROS[p0] !== undefined) { qtd = NUMEROS[p0]; usadas = 1; }
    // "uma dúzia de ovos" / "meia dúzia"
    if (qtd !== null && semAcento(palavras[usadas] || '').toLowerCase() === 'duzia') { qtd = qtd === 1 ? 12 : qtd * 12; usadas++; }
    return {qtd, usadas};
  }

  function lerUnidade(palavra){
    const p = semAcento(palavra || '').toLowerCase();
    const achada = UNIDADES.find(([re]) => re.test(p));
    return achada ? achada[1] : null;
  }

  /** Interpreta um pedaço: "meio quilo de frango" -> {quantidade:0.5, unidade:'kg', nome:'frango'} */
  function interpretarItem(pedaco){
    let t = pedaco.trim().replace(/\s+/g, ' ');
    for (let i = 0; i < 2; i++) t = t.replace(new RegExp(ENCHIMENTO.source, 'i'), '');   // "tenho uns ..."
    let palavras = t.split(' ');
    const {qtd, usadas} = lerQuantidade(palavras);
    palavras = palavras.slice(usadas);
    let unidade = qtd !== null ? lerUnidade(palavras[0]) : null;
    if (unidade) palavras = palavras.slice(1);
    if (/^(de|do|da|dos|das)$/i.test(palavras[0] || '')) palavras = palavras.slice(1);   // "500 g de frango"
    // quantidade escrita depois: "tomate 3", "ovos x2"
    let quantidade = qtd;
    const ult = palavras[palavras.length - 1] || '';
    if (quantidade === null && /^x?\d+$/i.test(ult)) { quantidade = Number(ult.replace(/x/i, '')); palavras.pop(); }
    if (quantidade !== null && !unidade) unidade = 'un';
    if (unidade === 'dúzia') { quantidade = (quantidade || 1) * 12; unidade = 'un'; }
    const nome = palavras.join(' ').replace(/^[^\p{L}\d]+|[^\p{L}\d]+$/gu, '').trim();
    const ingrediente = EW.normalizacao.normalizar(nome);
    return {original: pedaco, nome, ingrediente, quantidade, unidade: unidade || '', conhecido: EW.normalizacao.conhecido(ingrediente)};
  }

  /** Frase livre -> lista de ingredientes (itens repetidos são somados). */
  function interpretar(texto){
    const itens = [];
    separar(texto).map(interpretarItem).filter(i => i.ingrediente).forEach(i => {
      const igual = itens.find(x => x.ingrediente === i.ingrediente);
      if (!igual) itens.push(i);
      else if (igual.quantidade !== null && i.quantidade !== null && igual.unidade === i.unidade) igual.quantidade += i.quantidade;
    });
    return itens;
  }

  return {interpretar, separar, interpretarItem};
})();
