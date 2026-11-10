/* ======================================================================
   Serviço de validade (o contador original do EatWise)
   Cada item pode ter duas datas:
     - validade impressa na embalagem (vale para o produto fechado);
     - data de abertura + prazo depois de aberto (a "segunda validade").
   A data-limite é a que acontecer primeiro. A partir dela saem os dias
   restantes e o status usado em todas as telas.
   ====================================================================== */
window.EW = window.EW || {};

EW.validade = (() => {
  const DIA = 86400000;
  const data = isoTxt => isoTxt ? new Date(isoTxt + 'T00:00:00') : null;
  const somar = (d, dias) => new Date(d.getTime() + dias * DIA);
  const diasEntre = (a, b) => Math.round((b - a) / DIA);

  /**
   * @param {{validade?:string, abertoEm?:string, prazoAberto?:number, criadoEm?:string}} item datas em AAAA-MM-DD
   * @param {Date} hoje
   * @returns {{aberto:Date|null, abertoHa:number|null, limite:Date, origem:'aberto'|'impressa', restam:number, frac:number}}
   */
  function calcular(item, hoje){
    const aberto = data(item.abertoEm);
    const impressa = data(item.validade);
    const candidatos = [];
    if (aberto && item.prazoAberto) candidatos.push({d: somar(aberto, item.prazoAberto), origem: 'aberto'});
    if (impressa) candidatos.push({d: impressa, origem: 'impressa'});
    // vale a data que vencer primeiro
    const escolhido = candidatos.sort((a, b) => a.d - b.d)[0] || {d: hoje, origem: 'impressa'};
    const restam = diasEntre(hoje, escolhido.d);
    // fração do prazo que ainda resta (para a barra de progresso)
    const inicio = escolhido.origem === 'aberto' ? aberto : (data(item.criadoEm) || somar(escolhido.d, -14));
    const total = Math.max(1, diasEntre(inicio, escolhido.d));
    return {aberto, abertoHa: aberto ? diasEntre(aberto, hoje) : null, limite: escolhido.d, origem: escolhido.origem,
            restam, frac: Math.max(0, Math.min(1, restam / total))};
  }

  /** Status mostrado nas telas a partir dos dias restantes. */
  function status(restam, estado){
    if (estado === 'consumido') return {k:'done', label:'Consumido', cls:'st-ok', bar:''};
    if (estado === 'descartado') return {k:'done', label:'Descartado', cls:'st-bad', bar:'bad'};
    if (restam < 0) return {k:'bad', label:'Vencido', cls:'st-bad', bar:'bad'};
    if (restam <= 1) return {k:'today', label: restam === 0 ? 'Vence hoje' : 'Vence amanhã', cls:'st-today', bar:'today'};
    if (restam <= 3) return {k:'warn', label:'Atenção', cls:'st-warn', bar:'warn'};
    return {k:'ok', label:'Em dia', cls:'st-ok', bar:''};
  }

  /** "Próximo do vencimento": vence em até 3 dias (inclusive hoje). */
  const vencendo = restam => restam >= 0 && restam <= 3;

  return {calcular, status, vencendo};
})();
