/* ======================================================================
   Serviço de armazenamento
   Guarda os dados do EatWise no próprio navegador (localStorage).
   Não há servidor: cada pessoa/navegador tem os seus dados.
   ====================================================================== */
window.EW = window.EW || {};

EW.armazenamento = (() => {
  const PREFIXO = 'eatwise.v1.';

  function ler(chave, padrao){
    try {
      const bruto = localStorage.getItem(PREFIXO + chave);
      return bruto === null ? padrao : JSON.parse(bruto);
    } catch (e) { return padrao; }   // modo privado, armazenamento bloqueado ou dado corrompido
  }

  function gravar(chave, valor){
    try { localStorage.setItem(PREFIXO + chave, JSON.stringify(valor)); return true; }
    catch (e) { return false; }      // ex.: cota cheia (fotos grandes)
  }

  function apagarTudo(){
    try { Object.keys(localStorage).filter(k => k.startsWith(PREFIXO)).forEach(k => localStorage.removeItem(k)); }
    catch (e) {}
  }

  return {ler, gravar, apagarTudo};
})();
