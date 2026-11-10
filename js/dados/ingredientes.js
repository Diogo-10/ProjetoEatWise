/* ======================================================================
   Base de ingredientes
   Chave = nome normalizado (minúsculas, sem acento, singular).
   geladeira: validade típica do alimento fresco/fechado, em dias (usada como
              estimativa quando a pessoa não informa a data da embalagem).
   aberto:    prazo depois de aberto/cortado, em dias (quando faz sentido).
   basico:    item de despensa que quase toda casa tem (sal, óleo...). Na
              recomendação ele não conta como "falta".
   Valores aproximados para uso doméstico; sempre vale o que está no rótulo.
   ====================================================================== */

Object.assign(CATS, {
  hort:{nome:'Hortifrúti', cls:'c-hor'},
  prot:{nome:'Carnes e ovos', cls:'c-emb'},
  grao:{nome:'Grãos e massas', cls:'c-con'},
  desp:{nome:'Temperos e básicos', cls:'c-doc'}
});

const INGREDIENTES = {
  // Hortifrúti
  'tomate':        {nome:'Tomate', cat:'hort', emoji:'🍅', geladeira:7},
  'cebola':        {nome:'Cebola', cat:'hort', emoji:'🧅', geladeira:30, aberto:5},
  'alho':          {nome:'Alho', cat:'hort', emoji:'🧄', geladeira:30},
  'batata':        {nome:'Batata', cat:'hort', emoji:'🥔', geladeira:20},
  'batata doce':   {nome:'Batata-doce', cat:'hort', emoji:'🍠', geladeira:20},
  'mandioca':      {nome:'Mandioca', cat:'hort', emoji:'🥔', geladeira:5},
  'cenoura':       {nome:'Cenoura', cat:'hort', emoji:'🥕', geladeira:14},
  'abobrinha':     {nome:'Abobrinha', cat:'hort', emoji:'🥒', geladeira:7},
  'berinjela':     {nome:'Berinjela', cat:'hort', emoji:'🍆', geladeira:7},
  'abobora':       {nome:'Abóbora', cat:'hort', emoji:'🎃', geladeira:20, aberto:5},
  'chuchu':        {nome:'Chuchu', cat:'hort', emoji:'🥒', geladeira:10},
  'pimentao':      {nome:'Pimentão', cat:'hort', emoji:'🫑', geladeira:7},
  'brocolis':      {nome:'Brócolis', cat:'hort', emoji:'🥦', geladeira:5},
  'couve flor':    {nome:'Couve-flor', cat:'hort', emoji:'🥦', geladeira:7},
  'cogumelo':      {nome:'Cogumelo', cat:'hort', emoji:'🍄', geladeira:5},
  'couve':         {nome:'Couve', cat:'hort', emoji:'🥬', geladeira:5},
  'alface':        {nome:'Alface', cat:'hort', emoji:'🥬', geladeira:5},
  'espinafre':     {nome:'Espinafre', cat:'hort', emoji:'🥬', geladeira:4},
  'repolho':       {nome:'Repolho', cat:'hort', emoji:'🥬', geladeira:14},
  'vagem':         {nome:'Vagem', cat:'hort', emoji:'🫛', geladeira:7},
  'pepino':        {nome:'Pepino', cat:'hort', emoji:'🥒', geladeira:7},
  'cheiro verde':  {nome:'Cheiro-verde', cat:'hort', emoji:'🌿', geladeira:5},
  'banana':        {nome:'Banana', cat:'hort', emoji:'🍌', geladeira:5},
  'maca':          {nome:'Maçã', cat:'hort', emoji:'🍎', geladeira:20},
  'laranja':       {nome:'Laranja', cat:'hort', emoji:'🍊', geladeira:14},
  'limao':         {nome:'Limão', cat:'hort', emoji:'🍋', geladeira:14},
  'morango':       {nome:'Morango', cat:'hort', emoji:'🍓', geladeira:4},
  'mamao':         {nome:'Mamão', cat:'hort', emoji:'🥭', geladeira:5, aberto:3},
  'manga':         {nome:'Manga', cat:'hort', emoji:'🥭', geladeira:6},
  'abacate':       {nome:'Abacate', cat:'hort', emoji:'🥑', geladeira:5, aberto:1},
  'abacaxi':       {nome:'Abacaxi', cat:'hort', emoji:'🍍', geladeira:5, aberto:3},
  // Carnes e ovos
  'ovo':           {nome:'Ovo', cat:'prot', emoji:'🥚', geladeira:21},
  'frango':        {nome:'Frango', cat:'prot', emoji:'🍗', geladeira:2},
  'carne moida':   {nome:'Carne moída', cat:'prot', emoji:'🥩', geladeira:2},
  'carne':         {nome:'Carne bovina', cat:'prot', emoji:'🥩', geladeira:3},
  'peixe':         {nome:'Peixe', cat:'prot', emoji:'🐟', geladeira:2},
  'atum':          {nome:'Atum em lata', cat:'con', emoji:'🐟', geladeira:700, aberto:2},
  // Grãos, massas e farinhas
  'arroz':         {nome:'Arroz', cat:'grao', emoji:'🍚', geladeira:365},
  'feijao':        {nome:'Feijão', cat:'grao', emoji:'🫘', geladeira:365},
  'lentilha':      {nome:'Lentilha', cat:'grao', emoji:'🫘', geladeira:365},
  'grao de bico':  {nome:'Grão-de-bico', cat:'grao', emoji:'🫘', geladeira:365},
  'macarrao':      {nome:'Macarrão', cat:'grao', emoji:'🍝', geladeira:365},
  'aveia':         {nome:'Aveia', cat:'grao', emoji:'🥣', geladeira:180},
  'farinha de trigo': {nome:'Farinha de trigo', cat:'grao', emoji:'🌾', geladeira:180},
  'farinha de mandioca': {nome:'Farinha de mandioca', cat:'grao', emoji:'🌾', geladeira:180},
  'fuba':          {nome:'Fubá', cat:'grao', emoji:'🌽', geladeira:180},
  'flocao de milho': {nome:'Flocão de milho (cuscuz)', cat:'grao', emoji:'🌽', geladeira:180},
  'tapioca':       {nome:'Goma de tapioca', cat:'grao', emoji:'🫓', geladeira:90},
  'pao':           {nome:'Pão', cat:'grao', emoji:'🍞', geladeira:4},
  // Laticínios
  'leite':         {nome:'Leite', cat:'lat', emoji:'🥛', geladeira:90, aberto:3},
  'queijo':        {nome:'Queijo', cat:'lat', emoji:'🧀', geladeira:30, aberto:5},
  'requeijao':     {nome:'Requeijão', cat:'lat', emoji:'🧀', geladeira:60, aberto:5},
  'creme de leite':{nome:'Creme de leite', cat:'lat', emoji:'🍶', geladeira:120, aberto:2},
  'iogurte':       {nome:'Iogurte natural', cat:'lat', emoji:'🥣', geladeira:20, aberto:5},
  'manteiga':      {nome:'Manteiga', cat:'lat', emoji:'🧈', geladeira:60, aberto:30},
  'leite de coco': {nome:'Leite de coco', cat:'lat', emoji:'🥥', geladeira:300, aberto:4},
  'leite condensado': {nome:'Leite condensado', cat:'doc', emoji:'🥫', geladeira:300, aberto:3},
  // Molhos, embutidos, conservas e doces (iguais aos produtos com foto)
  'molho de tomate': {nome:'Molho de tomate', cat:'mol', emoji:'🥫', geladeira:300, aberto:5},
  'maionese':      {nome:'Maionese', cat:'mol', emoji:'🥚', geladeira:180, aberto:30},
  'ketchup':       {nome:'Ketchup', cat:'mol', emoji:'🍅', geladeira:300, aberto:30},
  'mostarda':      {nome:'Mostarda', cat:'mol', emoji:'🌭', geladeira:300, aberto:15},
  'presunto':      {nome:'Presunto', cat:'emb', emoji:'🥓', geladeira:30, aberto:3},
  'salsicha':      {nome:'Salsicha', cat:'emb', emoji:'🌭', geladeira:30, aberto:3},
  'azeitona':      {nome:'Azeitona', cat:'con', emoji:'🫒', geladeira:365, aberto:14},
  'milho':         {nome:'Milho verde', cat:'con', emoji:'🌽', geladeira:365, aberto:3},
  'ervilha':       {nome:'Ervilha', cat:'con', emoji:'🫛', geladeira:365, aberto:3},
  'geleia':        {nome:'Geleia', cat:'doc', emoji:'🍓', geladeira:300, aberto:15},
  'doce de leite': {nome:'Doce de leite', cat:'doc', emoji:'🍯', geladeira:180, aberto:15},
  'mel':           {nome:'Mel', cat:'doc', emoji:'🍯', geladeira:700},
  'cacau':         {nome:'Cacau em pó', cat:'doc', emoji:'🍫', geladeira:365},
  // Temperos e básicos de despensa
  'sal':           {nome:'Sal', cat:'desp', emoji:'🧂', geladeira:3650, basico:true},
  'acucar':        {nome:'Açúcar', cat:'desp', emoji:'🍬', geladeira:3650, basico:true},
  'oleo':          {nome:'Óleo', cat:'desp', emoji:'🫗', geladeira:365, basico:true},
  'azeite':        {nome:'Azeite', cat:'desp', emoji:'🫒', geladeira:365, basico:true},
  'agua':          {nome:'Água', cat:'desp', emoji:'💧', geladeira:3650, basico:true},
  'pimenta do reino': {nome:'Pimenta-do-reino', cat:'desp', emoji:'🌶️', geladeira:730, basico:true},
  'vinagre':       {nome:'Vinagre', cat:'desp', emoji:'🫗', geladeira:730, basico:true},
  'oregano':       {nome:'Orégano', cat:'desp', emoji:'🌿', geladeira:365, basico:true},
  'fermento':      {nome:'Fermento em pó', cat:'desp', emoji:'🧁', geladeira:180, basico:true},
  'canela':        {nome:'Canela', cat:'desp', emoji:'🌿', geladeira:730, basico:true}
};

// Produtos com foto (catálogo de embalagens) -> ingrediente usado nas receitas
const CATALOGO_INGREDIENTE = {
  'maionese':'maionese', 'requeijao':'requeijao', 'molho-tomate':'molho de tomate', 'leite':'leite',
  'creme-leite':'creme de leite', 'presunto':'presunto', 'ketchup':'ketchup', 'azeitona':'azeitona',
  'geleia':'geleia', 'mucarela':'queijo', 'mostarda':'mostarda', 'milho':'milho',
  'doce-leite':'doce de leite', 'salsicha':'salsicha'
};
CATALOG.forEach(c => { c.ing = CATALOGO_INGREDIENTE[c.k]; });
