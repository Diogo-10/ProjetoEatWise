/* ======================================================================
   Dados de receitas, perfil e histórico de receitas feitas
   - As receitas vêm de data/receitas.json. No app de celular e no pacote
     offline, o JSON já vem embutido (window.EW_RECEITAS); no site, é
     carregado com fetch.
   - Perfil e histórico ficam salvos no navegador (armazenamento).
   ====================================================================== */
let RECEITAS = (window.EW_RECEITAS && window.EW_RECEITAS.receitas) || [];
let RECEITAS_ERRO = false;

function carregarReceitas(){
  if (RECEITAS.length) return Promise.resolve(RECEITAS);
  return fetch('data/receitas.json')
    .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(d => { RECEITAS = d.receitas || []; return RECEITAS; })
    .catch(() => { RECEITAS_ERRO = true; return RECEITAS; });
}

// Preferências e restrições alimentares (tela Perfil)
let PERFIL = Object.assign({restricoes: [], naoGosto: [], objetivo: 'desperdicio'}, EW.armazenamento.ler('perfil', {}));

// Receitas feitas: {receita, data, itens:[{id, nome, antesDeVencer}]}
let HISTORICO = EW.armazenamento.ler('historico', []);

/** Ingredientes disponíveis = inventário (não vencidos) + informados por texto/imagem. */
function ingredientesDisponiveis(){
  const lista = EW.inventario.disponiveis();
  INFORMADOS.forEach(k => { if (!lista.find(d => d.ingrediente === k)) lista.push({ingrediente: k, restam: Infinity, nome: EW.normalizacao.rotulo(k), informado: true}); });
  return lista;
}

/** Recomendação com os dados atuais da pessoa. */
function recomendacoes(){
  return EW.recomendacao.recomendar({receitas: RECEITAS, disponiveis: ingredientesDisponiveis(), perfil: PERFIL});
}
