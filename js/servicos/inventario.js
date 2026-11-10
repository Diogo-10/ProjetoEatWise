/* ======================================================================
   Serviço de inventário
   Cria itens livres (tomate, arroz, ovo...) com as regras de validade e
   expõe os "ingredientes disponíveis" usados pela recomendação de receitas.
   Os itens ficam no array global PRODUCTS (salvo pelo armazenamento).
   ====================================================================== */
window.EW = window.EW || {};

EW.inventario = (() => {
  const isoDe = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const somar = (d, dias) => new Date(d.getTime() + dias * 86400000);

  /**
   * Cria um item livre no inventário.
   * Se a pessoa não informar a validade e o item estiver fechado, estimamos
   * pela validade típica do alimento (e marcamos como estimada).
   */
  function novoItem(dados){
    const ingrediente = dados.ingrediente || EW.normalizacao.normalizar(dados.nome);
    const ing = INGREDIENTES[ingrediente] || null;
    const aberto = !!dados.aberto;
    let validade = dados.validade || null, validadeEstimada = false;
    if (!validade && !aberto) { validade = isoDe(somar(TODAY, (ing && ing.geladeira) || 7)); validadeEstimada = true; }
    const cat = (ing && ing.cat) || 'desp';
    const item = {
      id: nextId++,
      k: 'ing:' + ingrediente,
      ingrediente,
      nome: (dados.nome && dados.nome.trim()) ? dados.nome.trim().charAt(0).toUpperCase() + dados.nome.trim().slice(1) : EW.normalizacao.rotulo(ingrediente),
      cat,
      quantidade: dados.quantidade || null,
      unidade: dados.unidade || '',
      validade, validadeEstimada,
      aberto,
      abertoEm: aberto ? (dados.abertoEm || isoDe(TODAY)) : null,
      prazoAberto: aberto ? (Number(dados.prazoAberto) || (ing && ing.aberto) || 3) : null,
      loc: dados.loc || (['grao', 'desp'].includes(cat) || ['banana', 'cebola', 'alho', 'batata'].includes(ingrediente) ? 'des' : 'gel'),
      via: dados.via || 'manual',
      quem: dados.quem || USER.primeiro,
      alerta: 1,
      criadoEm: isoDe(TODAY)
    };
    PRODUCTS.unshift(item);
    return item;
  }

  /**
   * Ingredientes disponíveis para cozinhar: itens ativos e não vencidos.
   * Se o mesmo ingrediente aparece mais de uma vez, fica o que vence primeiro.
   * @returns {Array<{ingrediente:string, restam:number, id:number, nome:string}>}
   */
  function disponiveis(){
    const mapa = new Map();
    active().filter(p => p.ingrediente && p.restam >= 0).forEach(p => {
      const atual = mapa.get(p.ingrediente);
      if (!atual || p.restam < atual.restam) mapa.set(p.ingrediente, {ingrediente: p.ingrediente, restam: p.restam, id: p.id, nome: p.nome});
    });
    return [...mapa.values()];
  }

  return {novoItem, disponiveis};
})();
