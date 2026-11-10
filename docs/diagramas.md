# EatWise · Diagramas

Diagramas em Mermaid do protótipo EatWise, para o artigo do TCC. O GitHub mostra os diagramas desenhados nesta página. As versões em imagem (SVG e PNG) estão na pasta `docs/img/`.

## 1. Diagrama de casos de uso

O Mermaid não tem um tipo próprio para casos de uso. Por isso o diagrama usa a notação de fluxograma: o ator fica à esquerda e cada caso de uso é uma elipse dentro do limite do sistema.

```mermaid
flowchart LR
  U(["Usuário"])
  subgraph S["Sistema EatWise"]
    direction TB
    UC1(["Gerenciar inventário"])
    UC2(["Controlar validade"])
    UC3(["Informar ingredientes por texto"])
    UC4(["Informar ingredientes por imagem"])
    UC5(["Receber recomendações de receitas"])
    UC6(["Visualizar receita"])
    UC7(["Definir preferências e restrições"])
    UC8(["Dar baixa no inventário"])
    UC9(["Normalizar ingredientes"])
  end
  U --- UC1
  U --- UC3
  U --- UC4
  U --- UC5
  U --- UC6
  U --- UC7
  UC1 -. "«include»" .-> UC2
  UC3 -. "«include»" .-> UC9
  UC4 -. "«include»" .-> UC9
  UC5 -. "«include»" .-> UC2
  UC5 -. "«include»" .-> UC7
  UC8 -. "«extend»" .-> UC6
```

- **Gerenciar inventário**: cadastrar, editar, consumir, descartar e excluir itens.
- **Controlar validade**: calcular a data-limite (validade da embalagem ou abertura + prazo depois de aberto, a que vencer primeiro), o status e os alertas.
- **Informar ingredientes por texto ou por imagem**: as duas entradas passam pela normalização e por uma lista que o usuário confirma.
- **Receber recomendações**: usa o controle de validade (bônus para o que vence logo) e as preferências do perfil.
- **Dar baixa no inventário**: estende "Visualizar receita" pelo botão "Fiz esta receita".

## 2. Fluxograma do fluxo principal

Entrada de ingredientes → tratamento/reconhecimento → confirmação → recomendação → escolha da receita → baixa no inventário.

```mermaid
flowchart TD
  A([Início]) --> B{Como informar os ingredientes?}
  B -->|Texto| C["Digitar livremente<br/>ex.: 2 ovos, tomate e arroz"]
  B -->|Imagem| D[Tirar ou escolher uma foto]
  B -->|Inventário| E[Usar os itens já cadastrados]
  C --> F["Serviço de texto<br/>separa itens, tira quantidades e unidades"]
  D --> G{Modelos de visão carregaram?}
  G -->|Sim| H["COCO-SSD + MobileNet<br/>no navegador (TensorFlow.js)"]
  G -->|Não| I["Reconhecimento simulado<br/>pela cor predominante"]
  F --> J["Normalização<br/>minúsculas, sem acento, singular, sinônimos"]
  H --> J
  I --> J
  J --> K["Lista para o usuário confirmar,<br/>corrigir ou remover"]
  K --> L{Adicionar ao inventário?}
  L -->|Sim| M["Criar itens com validade<br/>informada ou estimada"]
  L -->|Não| N[Considerar só para as receitas]
  M --> O
  N --> O
  E --> O["Ingredientes disponíveis<br/>+ dias até vencer (sem vencidos)"]
  O --> P["Recomendação<br/>restrições, cobertura ponderada,<br/>bônus de vencimento e saudável"]
  P --> Q["Lista ordenada: tenho, falta<br/>e motivo da recomendação"]
  Q --> R[Escolher receita]
  R --> S["Detalhe: ingredientes, modo de preparo,<br/>tempo, porções e calorias"]
  S --> T{Fez a receita?}
  T -->|Não| Q
  T -->|Sim| U["Baixa no inventário<br/>usei tudo / sobrou / não usei"]
  U --> V[Atualizar desperdício evitado e histórico]
  V --> W([Fim])
```

## 3. Diagrama do modelo de dados

Não há banco de dados: os dados ficam no navegador (`localStorage`, chaves `eatwise.v1.*`). A base de ingredientes, o catálogo de produtos, os prazos e as receitas são arquivos do próprio app.

```mermaid
erDiagram
  INGREDIENTE {
    string chave PK "nome normalizado, ex.: tomate"
    string nome
    string categoria
    int geladeira "validade típica em dias"
    int aberto "prazo depois de aberto em dias"
    bool basico "item de despensa"
  }
  PRODUTO_CATALOGO {
    string k PK "ex.: requeijao"
    string ean "código de barras"
    string nome
    string marca
    string ingrediente FK
  }
  PRAZO_BASE {
    string k PK "mesmo k do produto"
    int dias "prazo depois de aberto"
    string conservacao
    string fonte
    bool doRotulo
  }
  ITEM_INVENTARIO {
    int id PK
    string k FK "produto do catálogo ou ing:chave"
    string ingrediente FK
    string nome
    float quantidade
    string unidade
    date validade "embalagem ou estimada"
    bool validadeEstimada
    bool aberto
    date abertoEm
    int prazoAberto
    string local "geladeira, porta, freezer, despensa"
    string origem "texto, imagem, foto, audio, manual"
    string estado "ativo, consumido, descartado"
    int alerta "dias de antecedência"
    date criadoEm
  }
  RECEITA {
    string id PK
    string nome
    string refeicao
    int tempo "minutos"
    int porcoes
    string dificuldade
    int calorias "por porção, aproximada"
    bool saudavel
    string tags "vegetariana, sem lactose..."
    string preparo "passos"
  }
  INGREDIENTE_RECEITA {
    string receita FK
    string ingrediente FK
    string quantidade
    bool essencial
  }
  PERFIL {
    string restricoes "vegetariano, vegano, sem_lactose, sem_gluten"
    string naoGosto "lista de ingredientes"
    string objetivo "saudavel, rapidas, desperdicio"
  }
  HISTORICO_RECEITA {
    string receita FK
    date data
  }
  ITEM_USADO {
    int item FK
    bool consumido
    float sobrou
    bool antesDeVencer
  }
  INFORMADO {
    string ingrediente FK "via texto ou imagem, sem entrar no inventário"
  }

  INGREDIENTE ||--o{ ITEM_INVENTARIO : "identifica"
  INGREDIENTE ||--o{ PRODUTO_CATALOGO : "corresponde a"
  PRODUTO_CATALOGO |o--o{ ITEM_INVENTARIO : "foto e marca de"
  PRODUTO_CATALOGO ||--|| PRAZO_BASE : "tem prazo"
  RECEITA ||--|{ INGREDIENTE_RECEITA : "contém"
  INGREDIENTE ||--o{ INGREDIENTE_RECEITA : "usado em"
  PERFIL }o--o{ INGREDIENTE : "não gosta de"
  RECEITA ||--o{ HISTORICO_RECEITA : "registrada em"
  HISTORICO_RECEITA ||--o{ ITEM_USADO : "dá baixa em"
  ITEM_INVENTARIO ||--o{ ITEM_USADO : "usado como"
  INGREDIENTE ||--o{ INFORMADO : "informado como"
```
