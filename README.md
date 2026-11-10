# EatWise · assistente digital de cozinha

Protótipo do TCC de Sistemas de Informação do grupo **Seven**. O EatWise ajuda a decidir **"o que cozinhar hoje"** com os ingredientes que a pessoa já tem em casa. A prioridade vai para a alimentação saudável e para a **redução do desperdício**: as receitas que usam primeiro o que está para vencer sobem na lista.

O contador de validade original não foi removido. Ele virou o módulo **Inventário e Validade**, e cada item do inventário passa a ser um ingrediente disponível para as receitas.

> O protótipo é só front-end: não tem servidor, banco de dados nem login real. Tudo roda no navegador, e os dados ficam salvos no próprio navegador (`localStorage`). Usuários e casa são fictícios.

- **Site:** https://diogo-10.github.io/ProjetoEatWise/
- **App de celular (instalável):** https://diogo-10.github.io/ProjetoEatWise/app/
- **Diagramas para o artigo:** [`docs/diagramas.md`](docs/diagramas.md) (imagens em `docs/img/`)

## Funcionalidades

| Módulo | O que faz |
|---|---|
| **Inventário e Validade** | Itens com **validade da embalagem** e **validade depois de aberto** (vale a data que vencer primeiro). Destaca o que vence em até 3 dias e o que já venceu, e gera alertas. Itens livres (tomate, arroz, ovo...) têm a validade informada ou estimada pelo tipo de alimento. |
| **Normalização** | Todo nome vira uma chave padrão: minúsculas, sem acento, no singular e com sinônimos. Exemplos: "Tomates" → `tomate`, "Peito de frango" → `frango`, "aipim" → `mandioca`, "creme de leite leve" → `creme de leite`. |
| **Ingredientes por texto** | Campo livre, como "2 ovos, 3 tomates, meio quilo de frango e queijo". O app separa os itens, tira quantidades e unidades (inclusive escritas por extenso), mostra a lista para conferir ou editar e permite adicionar ao inventário ou só usar nas receitas. |
| **Ingredientes por imagem** | Foto da câmera ou da galeria. O reconhecimento é feito no navegador com TensorFlow.js (COCO-SSD + MobileNet). A lista reconhecida sempre passa pela confirmação. Se os modelos não carregarem, entra um modo simulado, e a tela avisa. |
| **Produto embalado** | O fluxo anterior do contador continua: foto do rótulo, código de barras, texto ou áudio (simulado) para registrar um produto que acabou de ser aberto. |
| **Base de receitas** | `data/receitas.json` com **36 receitas** brasileiras simples. Cada uma tem ingredientes essenciais e opcionais, preparo, tempo, porções, dificuldade, tags, calorias por porção e indicação de receita saudável. |
| **Recomendação** | Cruza os ingredientes disponíveis com as receitas e calcula uma pontuação. Mostra o que a pessoa **tem**, o que **falta** e o **motivo** da recomendação (ex.: "Usa o leite que vence amanhã"). |
| **Perfil** | Restrições (vegetariano, vegano, sem lactose, sem glúten), ingredientes que a pessoa não gosta e objetivo (comer mais saudável, refeições rápidas, reduzir o desperdício). |
| **Detalhe da receita** | Ingredientes marcados como "tenho" ou "falta", modo de preparo, tempo, porções e calorias. O botão **"Fiz esta receita"** dá baixa no inventário, com as opções "usei tudo", "sobrou" (com quantidade) e "não usei". |
| **Painel inicial** | Itens vencendo, sugestões do dia com esses itens, atalhos para adicionar por texto ou foto e o indicador de **desperdício evitado** (itens usados antes de vencer). |

Navegação: **Início | Inventário | Adicionar | Receitas | Perfil**. Alertas, base de prazos e impacto ficam no menu lateral.

## Como rodar

**Opção 1: pelo link.** Abra o endereço do GitHub Pages no computador ou no celular. É a forma completa, com câmera ao vivo e reconhecimento por imagem.

**Opção 2: servidor local** (para desenvolver):

```bash
python3 -m http.server 8000
# abra http://localhost:8000
```

**Opção 3: sem internet e sem servidor.** Baixe `download/EatWise-Prototipo.zip`, descompacte e dê dois cliques no `.html`. Nesse pacote, site e app são arquivos únicos, com receitas e fotos embutidas. Sem internet, a foto dos alimentos usa o modo simulado.

> Abrir o `index.html` da raiz com dois cliques não carrega as receitas, porque o navegador bloqueia a leitura de arquivos JSON fora de um servidor. Para esse caso, use a opção 3.

**Instalar no celular:** abra o link do app no Chrome (Android, menu ⋮ → *Instalar app*) ou no Safari (iPhone, Compartilhar → *Adicionar à Tela de Início*).

**Depois de alterar o código**, gere de novo o app e o pacote:

```bash
python3 tools/gerar_receitas.py   # só se mudar as receitas
python3 tools/build_app.py        # app/index.html (PWA) a partir do site
python3 tools/build_offline.py    # download/EatWise-Prototipo.zip
```

## Estrutura

```
index.html                 site (carrega os arquivos abaixo)
css/estilo.css             estilos (tema claro)
js/base/                   ícones, ilustrações, utilidades e roteador
js/dados/                  catálogo de embalagens e prazos, ingredientes, receitas/perfil
js/servicos/               serviços independentes da interface
  armazenamento.js         localStorage
  validade.js              cálculo do contador de validade
  normalizacao.js          nomes de ingredientes -> chave padrão
  inventario.js            criar itens e listar ingredientes disponíveis
  texto.js                 reconhecimento de texto
  imagem.js                reconhecimento por imagem (TensorFlow.js + reserva simulada)
  recomendacao.js          algoritmo de recomendação (comentado)
js/telas/                  uma tela por arquivo
data/receitas.json         base de receitas
app/                       app de celular (PWA) gerado por tools/build_app.py
assets/produtos/           fotos das embalagens (Open Food Facts)
docs/diagramas.md          casos de uso, fluxograma e modelo de dados (Mermaid)
tools/                     scripts de geração (receitas, app, pacote offline)
```

## Decisões técnicas

### Front-end puro, sem framework e sem build
HTML, CSS e JavaScript simples, em arquivos separados por responsabilidade. Os scripts são carregados na ordem pelo `index.html`. Não usamos "ES modules" porque eles não funcionam ao abrir o arquivo direto do computador, e o pacote offline precisa disso. Para o app e o pacote, `tools/bundle.py` junta tudo num HTML único.

### Armazenamento
O serviço `armazenamento.js` grava no `localStorage` (chaves `eatwise.v1.*`) o inventário, o perfil, o histórico de receitas feitas, os ingredientes informados e os alertas lidos. Na primeira visita, o app cria uma casa de exemplo com datas calculadas a partir de hoje, para sempre haver itens vencendo.

### Contador de validade
`validade.js` recebe a validade da embalagem, a data de abertura e o prazo depois de aberto. A data-limite é **a que vencer primeiro**. Os status são: vencido (< 0 dias), vence hoje/amanhã (≤ 1), atenção (≤ 3) e em dia. Os prazos dos produtos embalados têm fonte. O do requeijão Itambé, por exemplo, foi lido no próprio rótulo.

### Reconhecimento de texto
`texto.js`:
1. separa a frase por vírgula, ponto e vírgula, quebra de linha, "e" e "+";
2. lê a quantidade no começo de cada item: número, decimal, fração ("1/2") ou por extenso ("um", "meio", "uma dúzia");
3. lê a unidade logo depois (kg, g, L, lata, dente, maço...);
4. tira palavras de enchimento ("tenho", "uns", "um pouco de");
5. normaliza o nome e soma os itens repetidos.

### Reconhecimento por imagem
Escolhemos a **opção (a): visão computacional no navegador**, com uma reserva simulada no mesmo serviço.

- **Por quê:** é reconhecimento de verdade, sem servidor e sem enviar a foto para fora do aparelho, o que também protege a privacidade. Para o TCC, mostra IA aplicada de forma prática e com custo zero.
- **Como:**
  1. O TensorFlow.js é carregado da CDN.
  2. O **COCO-SSD** encontra objetos na foto e já reconhece alguns alimentos.
  3. O **MobileNet v1** (ImageNet, 1000 categorias) classifica cada objeto recortado e a foto inteira.
  4. Um mapa traduz as categorias de alimentos para os ingredientes em português (`IMAGENET` e `COCO` em `imagem.js`).
- **Resultado medido:** em fotos de teste, bananas foram reconhecidas com 84% a 99% de confiança, em cerca de 1 a 3 segundos por foto. Os modelos (cerca de 20 MB) levam alguns segundos para baixar na primeira vez.
- **Limitações:**
  - Os modelos não têm categorias para arroz, feijão, ovo nem tomate. O tomate é aproximado pela categoria mais parecida.
  - Alimentos dentro de embalagens plásticas ou redes, e fotos da geladeira inteira, quase não são reconhecidos.
  - Por isso a pessoa **sempre confirma e corrige** a lista.
- **Reserva:** sem internet, ou se a CDN for bloqueada, a função `simulado()` sugere ingredientes pela cor predominante da foto, e a tela avisa que é modo simulado. Ela pode ser trocada por uma API real sem mexer nas telas.

### Algoritmo de recomendação
Fica em `js/servicos/recomendacao.js`, isolado e comentado. Para cada receita:

1. **Restrições e preferências.** Ingrediente essencial proibido ou que a pessoa não gosta exclui a receita. Ingrediente opcional nessa situação é retirado da receita só para aquela pessoa (ex.: o queijo da omelete para quem é sem lactose).
2. **Cobertura ponderada.** Peso 2 para essenciais e 1 para opcionais. Os básicos de despensa (sal, óleo, água...) não entram na conta. `cobertura = pesos que tenho / pesos totais`.
3. **Pontuação:**

   ```
   pontos = 100 × cobertura
          − 15 × (essenciais que faltam)
          + bônus de vencimento   (+15 por item que vence hoje/amanhã, +10 se vence em 2–3 dias; teto 30;
                                   ×1,5 se o objetivo for reduzir o desperdício)
          + 8 se a receita é saudável
          + bônus do objetivo     ("saudável": +7 se saudável, +3 se baixo açúcar;
                                   "rápidas": +10 até 20 min, +5 até 30 min)
   ```

   Itens vencidos não contam como disponíveis. Os ingredientes informados por texto ou imagem contam como disponíveis, sem data.
4. **Ordenação.** Maior pontuação primeiro. No empate, vem a receita com menos essenciais faltando e, depois, a de menor tempo de preparo.
5. **Motivos.** Frases que explicam a escolha: "Usa o creme de leite que vence hoje", "Você tem 7 de 7 ingredientes", "Dá para fazer agora", "Receita saudável".

### Base de receitas
`data/receitas.json` é gerado por `tools/gerar_receitas.py`. As tags de restrição (vegetariana, vegana, sem lactose, sem glúten) são **calculadas pelos ingredientes essenciais**, para nunca ficarem incoerentes com a receita. As calorias são aproximadas por porção. A interface lembra que as sugestões não substituem a orientação de um nutricionista.

## Testes

Cada etapa foi validada com testes automatizados no navegador (Playwright):
- **Contador:** data-limite, status, cadastro, consumir, descartar, alertas e dados salvos após recarregar.
- **Normalização:** 20 casos. **Texto:** 7 frases.
- **Recomendação:** prioridade para o que vence, restrições, "não gosto" e filtros.
- **Fiz esta receita:** baixa no inventário.
- **Imagem:** com e sem os modelos.

## Créditos

- Fotos das embalagens: [Open Food Facts](https://world.openfoodfacts.org), licença CC BY-SA. Detalhes em `assets/produtos/CREDITOS.md`.
- Modelos de visão: TensorFlow.js, COCO-SSD e MobileNet (Google, licença Apache 2.0).
- As marcas citadas pertencem aos fabricantes. O EatWise é um projeto acadêmico, sem relação com elas.
