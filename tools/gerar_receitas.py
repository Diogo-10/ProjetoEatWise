"""Gera data/receitas.json a partir da lista abaixo.

As tags de restrição (vegetariana, vegana, sem lactose, sem glúten) são
calculadas pelos ingredientes ESSENCIAIS, para nunca ficarem incoerentes.
Os opcionais que conflitam com uma restrição são retirados pela
recomendação para quem tem essa restrição.
Calorias por porção são aproximadas (referência para o protótipo).

Uso: python3 tools/gerar_receitas.py
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

CARNES = {'frango', 'carne moida', 'carne', 'peixe', 'atum', 'presunto', 'salsicha'}
ANIMAL_SEM_CARNE = {'ovo', 'leite', 'queijo', 'requeijao', 'creme de leite', 'iogurte', 'manteiga',
                    'leite condensado', 'doce de leite', 'mel', 'maionese'}
LACTOSE = {'leite', 'queijo', 'requeijao', 'creme de leite', 'iogurte', 'manteiga', 'leite condensado', 'doce de leite'}
GLUTEN = {'farinha de trigo', 'macarrao', 'pao', 'aveia'}


def I(spec):
    """'ovo:3 unidades*' -> essencial; sem '*' -> opcional."""
    essencial = spec.endswith('*')
    spec = spec.rstrip('*')
    ing, _, qtd = spec.partition(':')
    return {'ingrediente': ing, 'quantidade': qtd, 'essencial': essencial}


R = [
 dict(id='omelete-de-legumes', nome='Omelete de legumes', refeicao='Café da manhã', tempo=15, porcoes=1, dificuldade='fácil', calorias=280, saudavel=True, proteina=True, baixo_acucar=True,
   ingredientes=['ovo:3 unidades*', 'tomate:1/2 unidade picado*', 'cebola:2 colheres de sopa picada', 'cheiro verde:1 colher de sopa', 'queijo:2 fatias', 'sal:a gosto*', 'azeite:1 fio*'],
   preparo=['Bata os ovos com o sal em uma tigela.', 'Misture o tomate, a cebola e o cheiro-verde.', 'Aqueça o azeite numa frigideira antiaderente e despeje a mistura.', 'Cozinhe em fogo baixo com tampa; se quiser, coloque o queijo antes de dobrar.']),
 dict(id='frango-grelhado-com-legumes', nome='Frango grelhado com legumes', refeicao='Almoço e jantar', tempo=30, porcoes=2, dificuldade='fácil', calorias=320, saudavel=True, proteina=True, baixo_acucar=True,
   ingredientes=['frango:400 g de peito em filés*', 'abobrinha:1 unidade em rodelas*', 'cenoura:1 unidade em palitos', 'alho:2 dentes', 'limao:1/2 unidade', 'azeite:2 colheres de sopa*', 'sal:a gosto*'],
   preparo=['Tempere o frango com alho, limão e sal.', 'Grelhe os filés em frigideira com metade do azeite, 5 minutos de cada lado.', 'Na mesma frigideira, salteie a abobrinha e a cenoura com o restante do azeite até ficarem macias.', 'Sirva o frango com os legumes.']),
 dict(id='arroz-feijao-e-ovo', nome='Prato feito com arroz, feijão e ovo', refeicao='Almoço e jantar', tempo=40, porcoes=2, dificuldade='fácil', calorias=450, saudavel=True, proteina=True, baixo_acucar=True,
   ingredientes=['arroz:1 xícara*', 'feijao:2 conchas cozido*', 'ovo:2 unidades*', 'tomate:1 unidade para salada', 'cebola:1/2 unidade*', 'alho:1 dente', 'oleo:1 colher de sopa*', 'sal:a gosto*'],
   preparo=['Refogue metade da cebola e o alho no óleo, junte o arroz e 2 xícaras de água quente com sal; cozinhe tampado.', 'Aqueça o feijão já cozido com o restante da cebola refogada.', 'Frite ou cozinhe os ovos.', 'Monte o prato com arroz, feijão, ovo e uma salada de tomate.']),
 dict(id='sopa-de-legumes', nome='Sopa de legumes', refeicao='Almoço e jantar', tempo=35, porcoes=4, dificuldade='fácil', calorias=150, saudavel=True, proteina=False, baixo_acucar=True,
   ingredientes=['batata:2 unidades em cubos*', 'cenoura:2 unidades em cubos*', 'abobrinha:1 unidade', 'cebola:1 unidade*', 'alho:2 dentes', 'cheiro verde:a gosto', 'azeite:1 colher de sopa*', 'agua:1,5 litro*', 'sal:a gosto*'],
   preparo=['Refogue a cebola e o alho no azeite.', 'Junte a batata e a cenoura, cubra com a água e cozinhe por 15 minutos.', 'Acrescente a abobrinha e cozinhe mais 10 minutos.', 'Acerte o sal e finalize com cheiro-verde. Se preferir, bata metade no liquidificador para engrossar.']),
 dict(id='macarrao-ao-sugo', nome='Macarrão ao sugo', refeicao='Almoço e jantar', tempo=25, porcoes=3, dificuldade='fácil', calorias=420, saudavel=False, proteina=False, baixo_acucar=True,
   ingredientes=['macarrao:250 g*', 'molho de tomate:1 sachê*', 'alho:2 dentes', 'cebola:1/2 unidade', 'queijo:ralado a gosto', 'azeite:1 colher de sopa*', 'oregano:a gosto', 'sal:a gosto*'],
   preparo=['Cozinhe o macarrão em água fervente com sal até ficar al dente.', 'Refogue o alho e a cebola no azeite, junte o molho e deixe apurar 5 minutos.', 'Misture o macarrão ao molho e finalize com orégano e queijo.']),
 dict(id='macarrao-com-frango-e-legumes', nome='Macarrão com frango e legumes', refeicao='Almoço e jantar', tempo=30, porcoes=3, dificuldade='fácil', calorias=480, saudavel=True, proteina=True, baixo_acucar=True,
   ingredientes=['macarrao:250 g*', 'frango:300 g em cubos*', 'abobrinha:1 unidade', 'cenoura:1 unidade ralada', 'tomate:2 unidades', 'alho:2 dentes', 'azeite:2 colheres de sopa*', 'sal:a gosto*'],
   preparo=['Cozinhe o macarrão al dente e reserve.', 'Doure o frango temperado no azeite com o alho.', 'Junte a cenoura, a abobrinha e o tomate e refogue até murchar.', 'Misture o macarrão e acerte o sal.']),
 dict(id='escondidinho-de-frango', nome='Escondidinho de frango com purê de batata', refeicao='Almoço e jantar', tempo=50, porcoes=4, dificuldade='média', calorias=390, saudavel=False, proteina=True, baixo_acucar=True,
   ingredientes=['batata:600 g*', 'frango:400 g cozido e desfiado*', 'leite:1/2 xícara', 'requeijao:3 colheres de sopa', 'manteiga:1 colher de sopa', 'cebola:1 unidade*', 'alho:2 dentes', 'sal:a gosto*'],
   preparo=['Cozinhe as batatas, amasse e misture leite, manteiga e sal até virar purê.', 'Refogue a cebola e o alho e junte o frango desfiado.', 'Em um refratário, faça uma camada de frango, espalhe o requeijão e cubra com o purê.', 'Leve ao forno a 200 °C por 20 minutos para dourar.']),
 dict(id='salada-de-batata', nome='Salada de batata com cenoura', refeicao='Almoço e jantar', tempo=30, porcoes=4, dificuldade='fácil', calorias=220, saudavel=False, proteina=False, baixo_acucar=True,
   ingredientes=['batata:500 g em cubos*', 'cenoura:1 unidade em cubos', 'ovo:2 unidades cozidos', 'maionese:3 colheres de sopa*', 'azeitona:a gosto', 'cheiro verde:a gosto', 'sal:a gosto*'],
   preparo=['Cozinhe a batata e a cenoura em água com sal até ficarem macias, sem desmanchar.', 'Escorra e deixe esfriar.', 'Misture a maionese, os ovos picados, as azeitonas e o cheiro-verde.', 'Guarde na geladeira e consuma no mesmo dia.']),
 dict(id='panqueca-de-banana-e-aveia', nome='Panqueca de banana e aveia', refeicao='Café da manhã', tempo=15, porcoes=1, dificuldade='fácil', calorias=300, saudavel=True, proteina=True, baixo_acucar=True,
   ingredientes=['banana:1 unidade madura*', 'ovo:1 unidade*', 'aveia:3 colheres de sopa*', 'canela:a gosto', 'mel:1 fio para servir'],
   preparo=['Amasse a banana com um garfo.', 'Misture o ovo e a aveia até formar uma massa.', 'Doure porções pequenas em frigideira antiaderente, 2 minutos de cada lado.', 'Sirva com canela e, se quiser, um fio de mel.']),
 dict(id='mingau-de-aveia', nome='Mingau de aveia com banana', refeicao='Café da manhã', tempo=10, porcoes=1, dificuldade='fácil', calorias=280, saudavel=True, proteina=False, baixo_acucar=True,
   ingredientes=['aveia:4 colheres de sopa*', 'leite:1 xícara*', 'banana:1 unidade', 'canela:a gosto', 'mel:1 colher de chá'],
   preparo=['Leve o leite e a aveia ao fogo baixo, mexendo sempre.', 'Quando engrossar, desligue.', 'Sirva com banana em rodelas e canela.']),
 dict(id='vitamina-de-banana', nome='Vitamina de banana', refeicao='Lanche', tempo=5, porcoes=2, dificuldade='fácil', calorias=200, saudavel=True, proteina=False, baixo_acucar=True,
   ingredientes=['banana:2 unidades*', 'leite:2 xícaras*', 'aveia:2 colheres de sopa', 'mel:1 colher de chá'],
   preparo=['Bata todos os ingredientes no liquidificador.', 'Sirva na hora, gelada.']),
 dict(id='strogonoff-de-frango', nome='Strogonoff de frango', refeicao='Almoço e jantar', tempo=30, porcoes=4, dificuldade='fácil', calorias=380, saudavel=False, proteina=True, baixo_acucar=False,
   ingredientes=['frango:500 g em cubos*', 'creme de leite:1 caixinha*', 'molho de tomate:1/2 sachê*', 'cebola:1 unidade*', 'alho:2 dentes', 'mostarda:1 colher de sopa', 'ketchup:1 colher de sopa', 'oleo:1 colher de sopa*', 'sal:a gosto*'],
   preparo=['Doure o frango no óleo com sal.', 'Junte a cebola e o alho e refogue.', 'Acrescente o molho de tomate, a mostarda e o ketchup e cozinhe 5 minutos.', 'Desligue o fogo e misture o creme de leite. Sirva com arroz.']),
 dict(id='torta-de-legumes', nome='Torta de liquidificador com legumes', refeicao='Almoço e jantar', tempo=50, porcoes=6, dificuldade='fácil', calorias=260, saudavel=False, proteina=False, baixo_acucar=True,
   ingredientes=['ovo:3 unidades*', 'leite:1 xícara*', 'farinha de trigo:1 xícara*', 'oleo:1/2 xícara*', 'fermento:1 colher de sopa*', 'abobrinha:1 unidade ralada', 'cenoura:1 unidade ralada', 'tomate:1 unidade', 'queijo:100 g', 'sal:a gosto*'],
   preparo=['Bata no liquidificador ovos, leite, óleo, farinha e sal.', 'Misture o fermento com uma colher.', 'Em uma forma untada, despeje metade da massa, os legumes e o queijo, e cubra com o restante.', 'Asse a 200 °C por cerca de 35 minutos.']),
 dict(id='misto-quente', nome='Misto-quente', refeicao='Lanche', tempo=10, porcoes=2, dificuldade='fácil', calorias=330, saudavel=False, proteina=True, baixo_acucar=True,
   ingredientes=['pao:4 fatias*', 'presunto:4 fatias*', 'queijo:4 fatias*', 'requeijao:para passar'],
   preparo=['Monte os sanduíches com presunto e queijo.', 'Passe um pouco de requeijão por fora, se quiser.', 'Aqueça numa frigideira ou sanduicheira até o queijo derreter.']),
 dict(id='crepioca', nome='Crepioca recheada', refeicao='Café da manhã', tempo=10, porcoes=1, dificuldade='fácil', calorias=250, saudavel=True, proteina=True, baixo_acucar=True,
   ingredientes=['ovo:1 unidade*', 'tapioca:2 colheres de sopa*', 'queijo:1 fatia', 'tomate:fatias', 'cheiro verde:a gosto', 'sal:uma pitada*'],
   preparo=['Misture o ovo, a goma de tapioca e o sal.', 'Espalhe em frigideira antiaderente quente e espere firmar.', 'Vire, recheie com queijo e tomate e dobre ao meio.']),
 dict(id='cuscuz-com-ovo', nome='Cuscuz nordestino com ovo', refeicao='Café da manhã', tempo=15, porcoes=2, dificuldade='fácil', calorias=320, saudavel=True, proteina=True, baixo_acucar=True,
   ingredientes=['flocao de milho:1 xícara*', 'agua:1/2 xícara*', 'sal:uma pitada*', 'ovo:2 unidades*', 'manteiga:1 colher de chá'],
   preparo=['Hidrate o flocão com a água e o sal por 10 minutos.', 'Cozinhe na cuscuzeira por cerca de 8 minutos, até ficar macio.', 'Sirva com ovos mexidos ou cozidos e um pouco de manteiga.']),
 dict(id='tapioca-de-queijo-e-tomate', nome='Tapioca de queijo e tomate', refeicao='Lanche', tempo=10, porcoes=1, dificuldade='fácil', calorias=230, saudavel=True, proteina=False, baixo_acucar=True,
   ingredientes=['tapioca:4 colheres de sopa*', 'queijo:2 fatias*', 'tomate:1/2 unidade', 'oregano:a gosto'],
   preparo=['Espalhe a goma peneirada na frigideira quente.', 'Quando unir, vire e recheie com queijo, tomate e orégano.', 'Dobre e sirva.']),
 dict(id='salada-de-grao-de-bico', nome='Salada de grão-de-bico', refeicao='Almoço e jantar', tempo=15, porcoes=2, dificuldade='fácil', calorias=260, saudavel=True, proteina=True, baixo_acucar=True,
   ingredientes=['grao de bico:2 xícaras cozido*', 'tomate:2 unidades*', 'pepino:1 unidade', 'cebola:1/2 unidade', 'cheiro verde:a gosto', 'limao:1 unidade', 'azeite:2 colheres de sopa*', 'sal:a gosto*'],
   preparo=['Pique o tomate, o pepino e a cebola.', 'Misture com o grão-de-bico cozido.', 'Tempere com limão, azeite, sal e cheiro-verde.']),
 dict(id='sopa-de-lentilha', nome='Sopa de lentilha', refeicao='Almoço e jantar', tempo=40, porcoes=4, dificuldade='fácil', calorias=230, saudavel=True, proteina=True, baixo_acucar=True,
   ingredientes=['lentilha:1 xícara*', 'cebola:1 unidade*', 'alho:2 dentes*', 'cenoura:1 unidade', 'tomate:1 unidade', 'azeite:1 colher de sopa*', 'agua:1 litro*', 'sal:a gosto*'],
   preparo=['Refogue a cebola e o alho no azeite.', 'Junte a lentilha lavada, a cenoura, o tomate e a água.', 'Cozinhe por 30 minutos, até a lentilha ficar macia. Acerte o sal.']),
 dict(id='abobrinha-recheada', nome='Abobrinha recheada com queijo', refeicao='Almoço e jantar', tempo=30, porcoes=2, dificuldade='fácil', calorias=210, saudavel=True, proteina=False, baixo_acucar=True,
   ingredientes=['abobrinha:2 unidades*', 'tomate:1 unidade*', 'queijo:100 g*', 'cebola:1/2 unidade', 'oregano:a gosto', 'azeite:1 fio*', 'sal:a gosto*'],
   preparo=['Corte as abobrinhas ao meio no comprimento e retire o miolo.', 'Refogue o miolo picado com cebola e tomate.', 'Recheie as abobrinhas, cubra com queijo e orégano.', 'Asse a 200 °C por 20 minutos.']),
 dict(id='legumes-assados', nome='Legumes assados com ervas', refeicao='Almoço e jantar', tempo=40, porcoes=3, dificuldade='fácil', calorias=220, saudavel=True, proteina=False, baixo_acucar=True,
   ingredientes=['batata:3 unidades*', 'cenoura:2 unidades*', 'abobora:300 g', 'abobrinha:1 unidade', 'cebola:1 unidade', 'alho:3 dentes', 'azeite:3 colheres de sopa*', 'oregano:a gosto', 'sal:a gosto*'],
   preparo=['Corte os legumes em pedaços parecidos.', 'Tempere com azeite, alho, sal e orégano.', 'Asse a 200 °C por 30 a 35 minutos, mexendo na metade do tempo.']),
 dict(id='carne-moida-com-batata', nome='Carne moída com batata', refeicao='Almoço e jantar', tempo=35, porcoes=4, dificuldade='fácil', calorias=380, saudavel=True, proteina=True, baixo_acucar=True,
   ingredientes=['carne moida:500 g*', 'batata:3 unidades em cubos*', 'cenoura:1 unidade', 'tomate:2 unidades', 'cebola:1 unidade*', 'alho:2 dentes', 'oleo:1 colher de sopa*', 'sal:a gosto*'],
   preparo=['Doure a carne no óleo, soltando bem.', 'Junte cebola, alho e tomate e refogue.', 'Acrescente a batata, a cenoura e meio copo de água.', 'Cozinhe tampado até a batata ficar macia.']),
 dict(id='bolinho-de-arroz-assado', nome='Bolinho de arroz assado (sobra de arroz)', refeicao='Lanche', tempo=30, porcoes=4, dificuldade='fácil', calorias=210, saudavel=False, proteina=False, baixo_acucar=True,
   ingredientes=['arroz:2 xícaras cozido*', 'ovo:1 unidade*', 'queijo:50 g ralado', 'cheiro verde:a gosto', 'farinha de trigo:2 colheres de sopa', 'sal:a gosto*'],
   preparo=['Misture o arroz cozido, o ovo, o queijo e o cheiro-verde.', 'Se a massa estiver mole, junte a farinha.', 'Modele bolinhos e asse em forma untada a 200 °C por 20 minutos.']),
 dict(id='farofa-de-ovo', nome='Farofa de ovo com cenoura', refeicao='Almoço e jantar', tempo=15, porcoes=4, dificuldade='fácil', calorias=230, saudavel=False, proteina=False, baixo_acucar=True,
   ingredientes=['farinha de mandioca:1 xícara*', 'ovo:2 unidades*', 'cenoura:1 unidade ralada', 'cebola:1/2 unidade', 'manteiga:1 colher de sopa', 'cheiro verde:a gosto', 'sal:a gosto*'],
   preparo=['Refogue a cebola e a cenoura na manteiga.', 'Junte os ovos e mexa até cozinharem.', 'Acrescente a farinha aos poucos, mexendo até tostar levemente.', 'Finalize com cheiro-verde e sal.']),
 dict(id='peixe-assado', nome='Peixe assado com batatas', refeicao='Almoço e jantar', tempo=40, porcoes=2, dificuldade='fácil', calorias=340, saudavel=True, proteina=True, baixo_acucar=True,
   ingredientes=['peixe:2 filés*', 'batata:2 unidades em rodelas*', 'tomate:1 unidade', 'cebola:1 unidade', 'limao:1 unidade', 'azeite:2 colheres de sopa*', 'sal:a gosto*'],
   preparo=['Tempere o peixe com limão e sal.', 'Forre um refratário com as batatas e regue com azeite.', 'Coloque o peixe por cima com rodelas de tomate e cebola.', 'Cubra com papel-alumínio e asse a 200 °C por 25 minutos; retire o papel e doure por mais 10.']),
 dict(id='arroz-de-forno', nome='Arroz de forno (sobras)', refeicao='Almoço e jantar', tempo=30, porcoes=4, dificuldade='fácil', calorias=360, saudavel=False, proteina=False, baixo_acucar=True,
   ingredientes=['arroz:3 xícaras cozido*', 'queijo:150 g*', 'presunto:100 g', 'milho:1/2 lata', 'ervilha:1/2 lata', 'molho de tomate:1/2 sachê', 'requeijao:3 colheres de sopa', 'cebola:1/2 unidade'],
   preparo=['Misture o arroz com presunto, milho, ervilha, cebola e molho.', 'Coloque num refratário, espalhe o requeijão e cubra com queijo.', 'Asse a 200 °C até gratinar, cerca de 20 minutos.']),
 dict(id='salada-verde-com-ovo', nome='Salada verde com ovo', refeicao='Almoço e jantar', tempo=10, porcoes=2, dificuldade='fácil', calorias=150, saudavel=True, proteina=True, baixo_acucar=True,
   ingredientes=['alface:1 pé pequeno*', 'tomate:1 unidade*', 'ovo:2 unidades cozidos', 'cenoura:1 unidade ralada', 'limao:1/2 unidade', 'azeite:1 colher de sopa*', 'sal:a gosto*'],
   preparo=['Lave bem as folhas e rasgue com as mãos.', 'Junte o tomate, a cenoura e os ovos em quartos.', 'Tempere na hora de servir com limão, azeite e sal.']),
 dict(id='frango-desfiado-com-milho', nome='Frango desfiado com milho', refeicao='Almoço e jantar', tempo=35, porcoes=4, dificuldade='fácil', calorias=280, saudavel=True, proteina=True, baixo_acucar=True,
   ingredientes=['frango:500 g*', 'cebola:1 unidade*', 'alho:2 dentes', 'tomate:2 unidades', 'milho:1 lata', 'requeijao:2 colheres de sopa', 'cheiro verde:a gosto', 'azeite:1 colher de sopa*', 'sal:a gosto*'],
   preparo=['Cozinhe o frango em água com sal e desfie.', 'Refogue cebola, alho e tomate no azeite.', 'Junte o frango e o milho e cozinhe 5 minutos.', 'Desligue, misture o requeijão e o cheiro-verde. Serve como prato ou recheio.']),
 dict(id='canja', nome='Canja de galinha', refeicao='Almoço e jantar', tempo=45, porcoes=4, dificuldade='fácil', calorias=260, saudavel=True, proteina=True, baixo_acucar=True,
   ingredientes=['frango:400 g*', 'arroz:1/2 xícara*', 'cenoura:1 unidade', 'batata:1 unidade', 'cebola:1 unidade*', 'alho:2 dentes', 'cheiro verde:a gosto', 'agua:1,5 litro*', 'sal:a gosto*'],
   preparo=['Cozinhe o frango na água com cebola, alho e sal por 20 minutos; retire e desfie.', 'No mesmo caldo, cozinhe o arroz, a cenoura e a batata em cubos.', 'Volte o frango à panela e finalize com cheiro-verde.']),
 dict(id='iogurte-com-frutas', nome='Iogurte com frutas e aveia', refeicao='Café da manhã', tempo=5, porcoes=1, dificuldade='fácil', calorias=220, saudavel=True, proteina=True, baixo_acucar=True,
   ingredientes=['iogurte:1 pote*', 'banana:1/2 unidade', 'morango:5 unidades', 'aveia:2 colheres de sopa', 'mel:1 colher de chá'],
   preparo=['Coloque o iogurte numa tigela.', 'Cubra com as frutas picadas e a aveia.', 'Finalize com mel, se quiser.']),
 dict(id='salada-de-frutas', nome='Salada de frutas', refeicao='Sobremesa', tempo=15, porcoes=4, dificuldade='fácil', calorias=120, saudavel=True, proteina=False, baixo_acucar=True,
   ingredientes=['banana:2 unidades*', 'maca:1 unidade*', 'laranja:2 unidades', 'mamao:1/2 unidade', 'manga:1 unidade', 'morango:1 xícara'],
   preparo=['Pique as frutas em cubos.', 'Esprema o suco das laranjas por cima, para não escurecer.', 'Sirva gelada no mesmo dia.']),
 dict(id='pao-de-queijo-de-frigideira', nome='Pão de queijo de frigideira', refeicao='Café da manhã', tempo=10, porcoes=1, dificuldade='fácil', calorias=280, saudavel=False, proteina=True, baixo_acucar=True,
   ingredientes=['ovo:1 unidade*', 'tapioca:2 colheres de sopa*', 'queijo:2 colheres de sopa ralado*', 'requeijao:1 colher de sopa', 'sal:uma pitada*'],
   preparo=['Misture todos os ingredientes até formar uma massa.', 'Despeje em frigideira antiaderente e tampe.', 'Doure dos dois lados em fogo baixo.']),
 dict(id='bolo-de-banana-e-aveia', nome='Bolo de banana e aveia sem açúcar', refeicao='Lanche', tempo=45, porcoes=8, dificuldade='fácil', calorias=170, saudavel=True, proteina=False, baixo_acucar=True,
   ingredientes=['banana:4 unidades maduras*', 'ovo:3 unidades*', 'aveia:2 xícaras*', 'oleo:1/4 xícara*', 'fermento:1 colher de sopa*', 'canela:1 colher de chá'],
   preparo=['Bata as bananas, os ovos e o óleo no liquidificador.', 'Misture a aveia, a canela e por último o fermento.', 'Asse em forma untada a 180 °C por cerca de 35 minutos.']),
 dict(id='pure-de-batata', nome='Purê de batata', refeicao='Almoço e jantar', tempo=30, porcoes=3, dificuldade='fácil', calorias=190, saudavel=True, proteina=False, baixo_acucar=True,
   ingredientes=['batata:500 g*', 'leite:1/2 xícara', 'manteiga:1 colher de sopa', 'sal:a gosto*'],
   preparo=['Cozinhe as batatas descascadas em água com sal até ficarem bem macias.', 'Amasse ainda quentes.', 'Misture o leite e a manteiga aos poucos até ficar cremoso.']),
 dict(id='cachorro-quente', nome='Cachorro-quente caseiro', refeicao='Lanche', tempo=20, porcoes=4, dificuldade='fácil', calorias=350, saudavel=False, proteina=True, baixo_acucar=False,
   ingredientes=['pao:4 unidades*', 'salsicha:4 unidades*', 'molho de tomate:1 sachê*', 'cebola:1/2 unidade', 'tomate:1 unidade', 'milho:a gosto', 'ketchup:a gosto', 'mostarda:a gosto'],
   preparo=['Cozinhe as salsichas no molho de tomate com cebola e tomate picados por 10 minutos.', 'Abra os pães e recheie com a salsicha e o molho.', 'Finalize com milho, ketchup e mostarda.']),
 dict(id='sanduiche-natural', nome='Sanduíche natural de frango', refeicao='Lanche', tempo=15, porcoes=2, dificuldade='fácil', calorias=300, saudavel=True, proteina=True, baixo_acucar=True,
   ingredientes=['pao:4 fatias integrais*', 'frango:150 g cozido e desfiado*', 'cenoura:1 unidade ralada', 'alface:algumas folhas', 'tomate:fatias', 'requeijao:2 colheres de sopa', 'maionese:1 colher de sopa'],
   preparo=['Misture o frango com a cenoura e o requeijão (ou a maionese).', 'Monte o sanduíche com alface e tomate.', 'Se não for comer na hora, guarde na geladeira e consuma no mesmo dia.']),
]


def gerar():
    saida = []
    for r in R:
        ings = [I(x) for x in r['ingredientes']]
        ess = {i['ingrediente'] for i in ings if i['essencial']}
        tags = []
        if not ess & CARNES:
            tags.append('vegetariana')
            if not ess & ANIMAL_SEM_CARNE:
                tags.append('vegana')
        if not ess & LACTOSE:
            tags.append('sem lactose')
        if not ess & GLUTEN:
            tags.append('sem glúten')
        if r['baixo_acucar']:
            tags.append('baixo açúcar')
        if r['proteina']:
            tags.append('rica em proteína')
        if r['tempo'] <= 20:
            tags.append('rápida')
        saida.append({
            'id': r['id'], 'nome': r['nome'], 'refeicao': r['refeicao'],
            'ingredientes': ings, 'preparo': r['preparo'],
            'tempo': r['tempo'], 'porcoes': r['porcoes'], 'dificuldade': r['dificuldade'],
            'tags': tags, 'calorias': r['calorias'], 'saudavel': r['saudavel'],
        })
    return saida


if __name__ == '__main__':
    dados = {'versao': 1,
             'aviso': 'Receitas simples para o protótipo EatWise. Calorias aproximadas por porção; não substituem orientação de nutricionista.',
             'receitas': gerar()}
    (ROOT / 'data').mkdir(exist_ok=True)
    (ROOT / 'data' / 'receitas.json').write_text(json.dumps(dados, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    print(len(dados['receitas']), 'receitas geradas')
