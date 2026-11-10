/* ---------- Dados fictícios ---------- */
const CATS = {
  lat:{nome:'Laticínios', cls:'c-lat'},
  mol:{nome:'Molhos e condimentos', cls:'c-mol'},
  emb:{nome:'Frios e embutidos', cls:'c-emb'},
  con:{nome:'Conservas', cls:'c-con'},
  doc:{nome:'Doces e geleias', cls:'c-doc'}
};
const LOCS = {gel:'Geladeira', por:'Porta da geladeira', fre:'Freezer', des:'Despensa'};
const METHODS = {foto:{n:'Foto', i:'camera'}, texto:{n:'Texto', i:'type'}, audio:{n:'Áudio', i:'mic'}, imagem:{n:'Imagem', i:'camera'}, manual:{n:'Cadastro manual', i:'edit'}};

// Base de prazos pós-abertura. Cada prazo vem do rótulo do fabricante quando foi possível ler,
// ou da orientação publicada mais conservadora encontrada (fonte em cada item).
const BASE = [
  {k:'requeijao', item:'Requeijão cremoso', cat:'lat', dias:5, cons:'Geladeira, de 1 a 10 °C. Não congelar.', doRotulo:true,
   orient:'Após aberto, consumir em até 05 dias. Manter refrigerado de 1 °C a 10 °C. Não congelar.', fonte:'Rótulo Itambé (foto da embalagem no Open Food Facts)', url:'https://world.openfoodfacts.org/product/7896051167167'},
  {k:'leite', item:'Leite UHT integral', cat:'lat', dias:3, cons:'Geladeira, caixa bem fechada', orient:'Depois de aberto, refrigerar e consumir em até 3 dias.', fonte:'Orientação da Piracanjuba para leite UHT, reproduzida por varejista', url:'https://www.tendaatacado.com.br/produto/leite-uht-semidesnatado-zero-lactose-protein-piracanjuba-1l'},
  {k:'creme-leite', item:'Creme de leite (caixinha)', cat:'lat', dias:2, cons:'Pote fechado na geladeira, de 2 a 8 °C', orient:'Transferir para pote fechado e consumir em 2 a 3 dias. Usamos o menor prazo.', fonte:'Orientações de varejo para creme de leite UHT (2 a 3 dias)', url:'https://www.tendaatacado.com.br/creme-de-leite'},
  {k:'mucarela', item:'Muçarela fatiada', cat:'lat', dias:3, cons:'Embalada em filme, na parte mais fria', orient:'A validade da embalagem vale só fechada. Depois de aberta, até 3 dias refrigerada.', fonte:'Ital, citado pelo Canal Rural', url:'https://www.canalrural.com.br/noticias/saiba-como-escolher-conservar-queijos-67619/'},
  {k:'maionese', item:'Maionese', cat:'mol', dias:30, cons:'Geladeira, tampa bem fechada', orient:'Depois de aberta, manter refrigerada; a maionese industrializada dura de 3 a 4 semanas.', fonte:'TudoGostoso e Auditório Ibirapuera (3 a 4 semanas)', url:'https://www.tudogostoso.com.br/noticias/leia-antes-de-fazer-salpicao-pode-comer-maionese-caseira-de-um-dia-para-outro-e-a-industrializada-a10919.htm'},
  {k:'ketchup', item:'Ketchup', cat:'mol', dias:30, cons:'Geladeira após aberto', orient:'A Heinz recomenda refrigerar depois de aberto; especialistas indicam consumir em até 1 mês.', fonte:'Heinz e especialistas citados pelo TudoGostoso', url:'https://www.tudogostoso.com.br/noticias/a-heinz-finalmente-resolve-o-debate-o-ketchup-deve-ser-guardado-na-geladeira-ou-na-despensa-a30937.htm'},
  {k:'mostarda', item:'Mostarda', cat:'mol', dias:15, cons:'Geladeira após aberto', orient:'Temperos líquidos como mostarda: até 15 dias após abertos, na falta de prazo no rótulo.', fonte:'Critérios de validade, Secretaria de Educação de Goiás', url:'https://goias.gov.br/educacao/wp-content/uploads/sites/40/2019/12/Criterios_de_validade_2024-aa6.pdf'},
  {k:'molho-tomate', item:'Molho de tomate', cat:'mol', dias:5, cons:'Pote limpo, não metálico e com tampa, na geladeira', orient:'Guardar em recipiente não metálico com tampa, refrigerado; dura em média 5 dias.', fonte:'Pomarola (modo de guardar) e TudoGostoso (5 dias)', url:'https://www.tudogostoso.com.br/noticias/depois-de-abrir-o-sache-de-molho-de-tomate-e-assim-que-voce-deve-guarda-lo-para-nao-estragar-a22410.htm'},
  {k:'presunto', item:'Presunto fatiado', cat:'emb', dias:3, cons:'Embalagem bem vedada, na geladeira', orient:'Produto de origem animal sem prazo no rótulo: até 3 dias após aberto.', fonte:'Critérios de validade, Secretaria de Educação de Goiás; USDA: 3 a 5 dias', url:'https://goias.gov.br/educacao/wp-content/uploads/sites/40/2019/12/Criterios_de_validade_2024-aa6.pdf'},
  {k:'salsicha', item:'Salsicha', cat:'emb', dias:3, cons:'Pote fechado; consumir cozida', orient:'Produto de origem animal sem prazo no rótulo: até 3 dias após aberto.', fonte:'Critérios de validade, Secretaria de Educação de Goiás', url:'https://goias.gov.br/educacao/wp-content/uploads/sites/40/2019/12/Criterios_de_validade_2024-aa6.pdf'},
  {k:'azeitona', item:'Azeitonas em conserva', cat:'con', dias:14, cons:'Sempre cobertas pela salmoura, pote fechado', orient:'Manter na própria salmoura, refrigerada; cerca de 2 semanas depois de aberta.', fonte:'Guia de validade de conservas citado pela Itatiaia', url:'https://www.itatiaia.com.br/curioso/por-quanto-tempo-os-condimentos-abertos-realmente-duram/'},
  {k:'milho', item:'Milho verde em lata', cat:'con', dias:3, cons:'Nunca guardar na lata aberta; usar pote com tampa', orient:'Passar para um pote com tampa; usar em 2 a 4 dias na geladeira.', fonte:'Catraca Livre e TudoGostoso (2 a 4 dias)', url:'https://catracalivre.com.br/noticias/latas-de-milho-e-ervilha-abertas-nao-podem-ser-usadas-para-guardar-o-restante-do-alimento-na-geladeira-entenda-o-motivo/'},
  {k:'geleia', item:'Geleia de frutas', cat:'doc', dias:15, cons:'Geladeira, colher limpa e seca', orient:'Geleia aberta vai para a geladeira e deve ser consumida em até 15 dias.', fonte:'TudoGostoso', url:'https://www.tudogostoso.com.br/noticias/a-geleia-deve-ser-armazenada-na-geladeira-ou-em-temperatura-ambiente-aqui-esta-a-resposta-a9440.htm'},
  {k:'doce-leite', item:'Doce de leite', cat:'doc', dias:15, cons:'Geladeira, pote bem fechado', orient:'Até 15 dias depois de aberto (algumas fontes citam 30; usamos o menor).', fonte:'Critérios de validade, Secretaria de Educação de Goiás', url:'https://goias.gov.br/educacao/wp-content/uploads/sites/40/2019/12/Criterios_de_validade_2024-aa6.pdf'}
];
const baseBy = k => BASE.find(b => b.k === k);
// Fotos reais das embalagens: Open Food Facts (CC BY-SA), ver assets/produtos/CREDITOS.md
const IMG = k => `assets/produtos/${k}.jpg`;
// Produtos com foto mostram a embalagem; itens livres ("ing:tomate") mostram um ícone do alimento.
const foodTile = (k, cls='') => {
  if (typeof k === 'string' && k.startsWith('ing:')) {
    const ing = INGREDIENTES[k.slice(4)], cat = CATS[(ing && ing.cat) || 'desp'];
    return `<span class="food ${cat ? cat.cls : ''} ${cls}" aria-hidden="true">${ing ? ing.emoji : '🥫'}</span>`;
  }
  return `<span class="food photo ${cls}"><img src="${IMG(k)}" alt="" loading="lazy" decoding="async"></span>`;
};

// Catálogo "reconhecível" pela IA simulada
const CATALOG = [
  {k:'maionese', ean:'7894000050034', nome:"Maionese Tradicional", marca:"Hellmann's · pote 500 g"},
  {k:'requeijao', ean:'7896051167167', nome:'Requeijão Cremoso', marca:'Itambé · copo 200 g'},
  {k:'molho-tomate', ean:'7896036099988', nome:'Molho de Tomate Tradicional', marca:'Pomarola · sachê 300 g'},
  {k:'leite', ean:'7898215151708', nome:'Leite Integral UHT', marca:'Piracanjuba · caixa 1 L'},
  {k:'creme-leite', ean:'7891000126905', nome:'Creme de Leite Leve', marca:'Nestlé · caixinha 200 g'},
  {k:'presunto', ean:'7891515432652', nome:'Presunto Cozido Fatiado', marca:'Sadia · bandeja 200 g'},
  {k:'ketchup', ean:'7896102503708', nome:'Ketchup Tradicional', marca:'Heinz · frasco 397 g'},
  {k:'azeitona', ean:'7891089101206', nome:'Azeitona Verde Fatiada', marca:'La Violetera · vidro 320 g'},
  {k:'geleia', ean:'7896214505157', nome:'Geleia de Morango 100% Fruta', marca:'Queensberry · vidro 170 g'},
  {k:'mucarela', ean:'7896030520181', nome:'Muçarela Fatiada Light', marca:'Tirolez · bandeja 150 g'},
  {k:'mostarda', ean:'7896102503715', nome:'Mostarda Amarela', marca:'Heinz · frasco 255 g'},
  {k:'milho', ean:'7896102500608', nome:'Milho Verde em Conserva', marca:'Quero · lata 170 g'},
  {k:'doce-leite', ean:'7896331100372', nome:'Doce de Leite', marca:'Aviação · pote 400 g'},
  {k:'salsicha', ean:'7891515742034', nome:'Salsicha Hot Dog', marca:'Perdigão · pacote 500 g'}
];
BASE.forEach(b => { b.marca = CATALOG.find(c => c.k === b.k).marca; });

/* Dados de exemplo (casa da Maria). As datas são calculadas a partir de hoje,
   para o protótipo sempre mostrar itens vencendo, vencidos e em dia. */
const isoHa = dias => { const d = new Date(TODAY.getTime() - dias * DAY); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
const ddmmHa = dias => { const d = new Date(TODAY.getTime() - dias * DAY); return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`; };
function exemploInventario(){
  return [
    {id:1, k:'maionese', abertoEm:isoHa(27), loc:'gel', via:'foto', alerta:3, quem:'Maria'},
    {id:2, k:'requeijao', abertoEm:isoHa(4), loc:'gel', via:'audio', alerta:1, quem:'João'},
    {id:3, k:'molho-tomate', abertoEm:isoHa(1), loc:'gel', via:'texto', alerta:1, quem:'Maria'},
    {id:4, k:'presunto', abertoEm:isoHa(4), loc:'gel', via:'foto', alerta:1, quem:'Maria'},
    {id:5, k:'leite', abertoEm:isoHa(1), loc:'gel', via:'audio', alerta:1, quem:'Lia'},
    {id:7, k:'ketchup', abertoEm:isoHa(22), loc:'por', via:'foto', alerta:3, quem:'João'},
    {id:8, k:'creme-leite', abertoEm:isoHa(2), loc:'gel', via:'texto', alerta:1, quem:'Maria'},
    {id:9, k:'azeitona', abertoEm:isoHa(6), loc:'gel', via:'foto', alerta:2, quem:'Maria'},
    {id:11, k:'geleia', abertoEm:isoHa(12), loc:'por', via:'foto', alerta:3, quem:'Lia'},
    {id:13, k:'mucarela', abertoEm:isoHa(2), loc:'gel', via:'foto', alerta:1, quem:'Maria'},
    {id:14, k:'mostarda', abertoEm:isoHa(9), loc:'por', via:'texto', alerta:3, quem:'João'},
    // itens livres (hortifrúti, grãos, ovos...): validade da embalagem ou estimada
    {id:20, k:'ing:frango', ingrediente:'frango', nome:'Peito de frango', cat:'prot', quantidade:500, unidade:'g', validade:isoHa(-1), aberto:false, loc:'gel', via:'texto', alerta:1, quem:'Maria', criadoEm:isoHa(1)},
    {id:21, k:'ing:tomate', ingrediente:'tomate', nome:'Tomate', cat:'hort', quantidade:4, unidade:'un', validade:isoHa(-2), validadeEstimada:true, aberto:false, loc:'gel', via:'texto', alerta:1, quem:'Maria', criadoEm:isoHa(5)},
    {id:22, k:'ing:banana', ingrediente:'banana', nome:'Banana prata', cat:'hort', quantidade:5, unidade:'un', validade:isoHa(-2), validadeEstimada:true, aberto:false, loc:'des', via:'texto', alerta:1, quem:'Lia', criadoEm:isoHa(3)},
    {id:23, k:'ing:abobrinha', ingrediente:'abobrinha', nome:'Abobrinha', cat:'hort', quantidade:2, unidade:'un', validade:isoHa(-3), validadeEstimada:true, aberto:false, loc:'gel', via:'manual', alerta:1, quem:'Maria', criadoEm:isoHa(4)},
    {id:24, k:'ing:ovo', ingrediente:'ovo', nome:'Ovos', cat:'prot', quantidade:10, unidade:'un', validade:isoHa(-15), aberto:false, loc:'gel', via:'texto', alerta:2, quem:'Maria', criadoEm:isoHa(6)},
    {id:25, k:'ing:cenoura', ingrediente:'cenoura', nome:'Cenoura', cat:'hort', quantidade:3, unidade:'un', validade:isoHa(-8), validadeEstimada:true, aberto:false, loc:'gel', via:'texto', alerta:1, quem:'Maria', criadoEm:isoHa(6)},
    {id:26, k:'ing:cebola', ingrediente:'cebola', nome:'Cebola', cat:'hort', quantidade:3, unidade:'un', validade:isoHa(-25), validadeEstimada:true, aberto:false, loc:'des', via:'texto', alerta:1, quem:'Maria', criadoEm:isoHa(5)},
    {id:27, k:'ing:alho', ingrediente:'alho', nome:'Alho', cat:'hort', quantidade:1, unidade:'cabeça', validade:isoHa(-25), validadeEstimada:true, aberto:false, loc:'des', via:'texto', alerta:1, quem:'Maria', criadoEm:isoHa(5)},
    {id:28, k:'ing:batata', ingrediente:'batata', nome:'Batata', cat:'hort', quantidade:1, unidade:'kg', validade:isoHa(-12), validadeEstimada:true, aberto:false, loc:'des', via:'manual', alerta:1, quem:'João', criadoEm:isoHa(8)},
    {id:29, k:'ing:arroz', ingrediente:'arroz', nome:'Arroz branco', cat:'grao', quantidade:1, unidade:'kg', validade:isoHa(-210), aberto:false, loc:'des', via:'texto', alerta:3, quem:'Maria', criadoEm:isoHa(20)},
    {id:30, k:'ing:feijao', ingrediente:'feijao', nome:'Feijão carioca', cat:'grao', quantidade:1, unidade:'kg', validade:isoHa(-160), aberto:false, loc:'des', via:'texto', alerta:3, quem:'Maria', criadoEm:isoHa(20)},
    {id:31, k:'ing:macarrao', ingrediente:'macarrao', nome:'Macarrão espaguete', cat:'grao', quantidade:500, unidade:'g', validade:isoHa(-280), aberto:false, loc:'des', via:'manual', alerta:3, quem:'João', criadoEm:isoHa(15)},
    {id:32, k:'ing:aveia', ingrediente:'aveia', nome:'Aveia em flocos', cat:'grao', quantidade:200, unidade:'g', aberto:true, abertoEm:isoHa(10), prazoAberto:90, validade:isoHa(-120), loc:'des', via:'manual', alerta:3, quem:'Lia', criadoEm:isoHa(30)},
    // histórico
    {id:16, k:'salsicha', abertoEm:isoHa(8), loc:'gel', via:'audio', alerta:1, quem:'João', estado:'descartado', quando:ddmmHa(4), motivo:'Passou do prazo'},
    {id:17, k:'doce-leite', abertoEm:isoHa(20), loc:'gel', via:'texto', alerta:2, quem:'Lia', estado:'consumido', quando:ddmmHa(6)},
    {id:18, k:'milho', abertoEm:isoHa(7), loc:'gel', via:'foto', alerta:1, quem:'Maria', estado:'consumido', quando:ddmmHa(8)}
  ];
}

// Inventário salvo no navegador; na primeira visita, usa o exemplo.
let PRODUCTS = EW.armazenamento.ler('inventario', null) || exemploInventario();
let nextId = PRODUCTS.reduce((m, p) => Math.max(m, p.id), 0) + 1;

// Alertas: gerados a partir do inventário (ver gerarAlertas em util.js). Guardamos só quais já foram lidos.
let ALERTAS_LIDOS = new Set(EW.armazenamento.ler('alertasLidos', ['resumo', 'base']));
let ALERTS = [];

const USER = Object.assign({nome:'Maria Oliveira', primeiro:'Maria', email:'maria.oliveira@email.com', cidade:'Campinas, SP', iniciais:'MO', plano:'Gratuito'}, EW.armazenamento.ler('usuario', {}));

