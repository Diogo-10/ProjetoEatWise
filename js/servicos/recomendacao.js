/* ======================================================================
   Serviço de recomendação de receitas (EatWise)

   Entrada
     - receitas:     base local (data/receitas.json)
     - disponiveis:  ingredientes que a pessoa tem, com os dias até vencer
                     (inventário, sem itens vencidos) + os informados por
                     texto/imagem (sem data, contam como disponíveis)
     - perfil:       restrições, ingredientes que não gosta e objetivo

   Algoritmo (para cada receita)
     1. Restrições e preferências
        - Se um ingrediente ESSENCIAL fere uma restrição ou é algo que a
          pessoa não gosta, a receita é excluída.
        - Se um ingrediente OPCIONAL fere, ele é retirado da receita para
          essa pessoa (ex.: queijo na omelete para quem é sem lactose).
     2. Cobertura ponderada (0 a 1)
        - Peso 2 para ingrediente essencial e 1 para opcional.
        - Itens básicos de despensa (sal, óleo, água...) não entram na conta.
        - cobertura = pesos dos ingredientes que tenho / pesos de todos.
     3. Pontuação
        pontos = 100 × cobertura
               − 15 por ingrediente essencial que falta
               + bônus de vencimento: +15 por ingrediente que vence hoje ou
                 amanhã e +10 por ingrediente que vence em 2 ou 3 dias
                 (teto de 30; ×1,5 se o objetivo for reduzir desperdício)
               + 8 se a receita for marcada como saudável
               + bônus do objetivo do perfil:
                   "comer mais saudável": +7 se saudável, +3 se baixo açúcar
                   "refeições rápidas":   +10 até 20 min, +5 até 30 min
        A pontuação nunca fica negativa.
     4. Ordenação: maior pontuação; empate -> menos essenciais faltando ->
        menor tempo de preparo.
     5. Motivos: frases curtas que explicam a recomendação
        (ex.: "Usa o leite que vence amanhã").
   ====================================================================== */
window.EW = window.EW || {};

EW.recomendacao = (() => {
  // Grupos de ingredientes usados nas restrições alimentares
  const CARNES = ['frango', 'carne moida', 'carne', 'peixe', 'atum', 'presunto', 'salsicha'];
  const ORIGEM_ANIMAL = CARNES.concat(['ovo', 'leite', 'queijo', 'requeijao', 'creme de leite', 'iogurte', 'manteiga', 'leite condensado', 'doce de leite', 'mel', 'maionese']);
  const LACTOSE = ['leite', 'queijo', 'requeijao', 'creme de leite', 'iogurte', 'manteiga', 'leite condensado', 'doce de leite'];
  const GLUTEN = ['farinha de trigo', 'macarrao', 'pao', 'aveia'];

  /** Restrições disponíveis no perfil: chave -> {nome, proibidos} */
  const RESTRICOES = {
    vegetariano: {nome: 'Vegetariano', proibidos: CARNES},
    vegano:      {nome: 'Vegano', proibidos: ORIGEM_ANIMAL},
    sem_lactose: {nome: 'Sem lactose', proibidos: LACTOSE},
    sem_gluten:  {nome: 'Sem glúten', proibidos: GLUTEN}
  };
  const OBJETIVOS = {
    saudavel:    'Comer mais saudável',
    rapidas:     'Refeições rápidas',
    desperdicio: 'Reduzir o desperdício'
  };

  const PESO_ESSENCIAL = 2, PESO_OPCIONAL = 1;
  const PENALIDADE_ESSENCIAL = 15;
  const TETO_VENCIMENTO = 30;

  const ehBasico = k => !!(INGREDIENTES[k] && INGREDIENTES[k].basico);
  const rotulo = k => EW.normalizacao.rotulo(k).toLowerCase();
  const quando = d => d <= 0 ? 'vence hoje' : d === 1 ? 'vence amanhã' : `vence em ${d} dias`;

  /** Qual restrição/preferência um ingrediente fere (ou null). */
  function conflito(ing, perfil){
    for (const r of perfil.restricoes || []) {
      if (RESTRICOES[r] && RESTRICOES[r].proibidos.includes(ing)) return RESTRICOES[r].nome.toLowerCase();
    }
    if ((perfil.naoGosto || []).includes(ing)) return 'você não gosta';
    return null;
  }

  /** Avalia uma receita para a pessoa. Retorna null se a receita for excluída. */
  function avaliar(receita, disponiveis, perfil){
    const mapa = new Map(disponiveis.map(d => [d.ingrediente, d]));
    const objetivo = perfil.objetivo || '';

    // 1. restrições e preferências
    const removidos = [];
    const usados = [];
    for (const i of receita.ingredientes) {
      const motivo = conflito(i.ingrediente, perfil);
      if (motivo && i.essencial) return null;                          // exclui a receita
      if (motivo) { removidos.push({...i, motivo}); continue; }        // retira o opcional
      usados.push(i);
    }

    // 2. cobertura ponderada (sem os básicos de despensa)
    const contaveis = usados.filter(i => !ehBasico(i.ingrediente));
    let total = 0, tenhoPeso = 0;
    const tenho = [], falta = [], basicos = usados.filter(i => ehBasico(i.ingrediente));
    for (const i of contaveis) {
      const peso = i.essencial ? PESO_ESSENCIAL : PESO_OPCIONAL;
      total += peso;
      const d = mapa.get(i.ingrediente);
      if (d) { tenhoPeso += peso; tenho.push({...i, restam: d.restam, nomeItem: d.nome}); }
      else falta.push(i);
    }
    const cobertura = total ? tenhoPeso / total : 0;
    const essenciaisFaltando = falta.filter(i => i.essencial);

    // 3. pontuação
    let pontos = 100 * cobertura - PENALIDADE_ESSENCIAL * essenciaisFaltando.length;
    const vencendo = tenho.filter(i => Number.isFinite(i.restam) && i.restam >= 0 && i.restam <= 3).sort((a, b) => a.restam - b.restam);
    let bonusVenc = vencendo.reduce((s, i) => s + (i.restam <= 1 ? 15 : 10), 0);
    bonusVenc = Math.min(TETO_VENCIMENTO, bonusVenc) * (objetivo === 'desperdicio' ? 1.5 : 1);
    pontos += bonusVenc;
    if (receita.saudavel) pontos += 8;
    if (objetivo === 'saudavel') pontos += (receita.saudavel ? 7 : 0) + (receita.tags.includes('baixo açúcar') ? 3 : 0);
    if (objetivo === 'rapidas') pontos += receita.tempo <= 20 ? 10 : receita.tempo <= 30 ? 5 : 0;
    pontos = Math.max(0, Math.round(pontos));

    // 5. motivos (explicação para a pessoa)
    const motivos = [];
    vencendo.slice(0, 2).forEach(i => motivos.push(`Usa ${artigo(i.ingrediente)} ${rotulo(i.ingrediente)} que ${quando(i.restam)}`));
    if (contaveis.length) motivos.push(`Você tem ${tenho.length} de ${contaveis.length} ingredientes`);
    if (!essenciaisFaltando.length && contaveis.length) motivos.push('Dá para fazer agora, sem comprar nada essencial');
    if (receita.saudavel) motivos.push('Receita saudável');
    if (objetivo === 'rapidas' && receita.tempo <= 30) motivos.push(`Pronta em ${receita.tempo} minutos`);
    (perfil.restricoes || []).forEach(r => { if (RESTRICOES[r]) motivos.push(`Compatível: ${RESTRICOES[r].nome.toLowerCase()}`); });

    return {receita, pontuacao: pontos, cobertura, tenho, falta, essenciaisFaltando, basicos, removidos, vencendo, motivos};
  }

  // "o leite", "a banana", "os ovos"... (simples: feminino se termina em "a")
  function artigo(k){
    const n = rotulo(k);
    return /a$/.test(n) || ['carne moida', 'farinha de trigo', 'farinha de mandioca', 'manteiga'].includes(k) ? 'a' : 'o';
  }

  /**
   * Lista de receitas recomendadas, da mais para a menos indicada.
   * @param {object} p
   * @param {Array} p.receitas
   * @param {Array<{ingrediente:string, restam:number, nome?:string}>} p.disponiveis
   * @param {{restricoes?:string[], naoGosto?:string[], objetivo?:string}} p.perfil
   */
  function recomendar({receitas, disponiveis, perfil}){
    return receitas
      .map(r => avaliar(r, disponiveis, perfil || {}))
      .filter(Boolean)
      .sort((a, b) => b.pontuacao - a.pontuacao || a.essenciaisFaltando.length - b.essenciaisFaltando.length || a.receita.tempo - b.receita.tempo);
  }

  return {recomendar, avaliar, RESTRICOES, OBJETIVOS};
})();
