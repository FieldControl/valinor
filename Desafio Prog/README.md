
# MORTAL KOMBAT 11 GUIDE

Essa é a primeira versão do meu projeto de guia para jogadores de Mortal Kombat 11, que foi criado através da minha iniciativa de aprender React JS do zero. 
Nesse guia, tentei implementar os melhores combos para as variações mais famosas de cada personagem, com o objetivo de ensinar os jogadores que buscam esse tipo de conteúdo. 

## Referência
Muito do conhecimento é revelado e disseminado por jogadores profissionais.
Para buscar as melhores informações, além daquilo que eu já sabia sobre o jogo, busquei ajuda em alguns sites e canais do Youtube, para trazer um conteúdo legítimo e de qualidade.
 - [Kombat Akademy](https://www.kombatakademy.com/)
 - [DashFight](https://www.youtube.com/channel/UCzk4TpVVNChWJE3X2Z_nb_A)
 - [Fernando Namur](https://www.youtube.com/channel/UCNWAxQmhAI8LF6kgZM9JK7Q)
 - [GuiExceptional](https://www.youtube.com/channel/UCxLO-2xWvYNxH4TFbLKICkA)

## Stack utilizada e funcionamento
Feito em React JS, utilizando principalmente a biblioteca Lodash. Por ter sido criado inicialmente para fins de aprendizado, acabei optando por escrever todo o meu banco de dados em um JSON e utilizar as informações desse jeito. Esse aplicativo possui a tela principal, onde mostram todos os personagens do jogo mais recentes, no mesmo formato original inclusive. Ao clicar em qualquer personagem desejado, ele reproduz o som de escolha do personagem e, assim, parte para as informações das variações e dos combos.


## Guia para entendimento do tema

#### COMBOS
A versão atual ainda não mostra todas as sequências de caracteres (strings e combos) da melhor maneira, mas dá para entender perfeitamente. Todos os botões mostrados devem ser interpretados pelo jogador e treinados da maneira adequada.




#### "Bread N' Butter", "Bars", "Fatal Blow", "Krushing Blow"
Para as pessoas que não possuem contato com o jogo, passo o significado de cada palavra, sigla e gíria.
```bash
  Combos
```
Combo é uma abreviação do palavra "combination", vinda do dicionário inglês, que nada mais é que a combinação de algo. Em jogos, principalmente jogos de luta, essa palavra é utilizada para explicar sequências de comandos (botões) que o jogador precisa apertar para realizar alguma ação dentro de jogo. Assim como na programação, os combos não passam de strings, ou seja, uma sequência de caracteres, que nesse caso é a sequência de botões apertados.

```bash
  Letra K iniciando certas palavras
```
Mortal Kombat, como  o nome sugere, possui uma identidade de trocar algumas palavras que inciam com a letra C para K, como "Kombat", "Kombo", etc. Então, caso encontre algo no código, ou no aplicativo, que pareça errado, revise para confirmar se não foi colocado com a intenção de aplicar essa identidade.

```bash
  Bread N' Butter
```

Sigla comumente utilizada na comunidade de jogos de luta para indicar um combo que seja o mais simples e efetivo para o personagem, ou seja, pão com manteiga.

```bash
  Bars
```

Em jogos de luta, geralmente utilizam-se as barras para amplificar um golpe e dá-lo um novo efeito. Então, se há "2 bars" como requisito para um combo, quer dizer que é preciso gastar duas barras para realizá-lo.

```bash
  Fatal Blow
```

Exclusivamente no Mortal Kombat 11, é um golpe decisivo que se adquire quando se está com 30% da vida. Se acertado, ele não poderá ser mais utilizado durante a partida. Caso não seja acertado, retorna alguns segundos depois. Geralmente é ativado com os dois botões traseiros dos controles, apertados simultaneamente (LT + RT | L2 + R2)

```bash
  Krushing Blow
```
Golpes especiais que só se adquirem sob determinados requisitos dentro da partida, sendo diferente os requisitos para cada personagem.

```bash
  Kustom Variation
```
Em Mortal Kombat 11, há a possibilidade de criação de variações de golpes personalizadas para cada personagem, ou seja, o jogador pode escolher os golpes que deseja utilizar, no limite de 3. Porém, alguns golpes podem ocupar 2 espaços ao invés de 1.


## Rodando localmente

Clone o projeto

```bash
  git clone https://github.com/GutoRomagnolo/MK11-Guide
```

Entre no diretório do projeto

```bash
  cd my-project
```

Instale as dependências

```bash
  npm install
```

Inicie o servidor

```bash
  npm  start
```


## Melhorias

- Implementação de uma API
Com certeza essa será a próxima  melhoria que irei fazer, pois servirá de muito aprendizado criar a minha própria API e administrar as minhas próprias informações.

- Criação de uma identidade visual
Como o projeto está em sua primeira versão, ainda não desenvolvi uma identidade própria para ele, mas está por vir.

- Refinamento das informações
Como todas as informações foram pesquisadas e escritas manualmente por mim, com certeza existem melhorias que posso fazer.

- Maior número de combos
Busco, futuramente, trazer realmente todos os melhores combos em diversas situações, como Krushing Blows, combos de canto, setups específicos, entre outros.

- Melhores detalhes sobre os combos
Atualmente ele apenas mostra os botões e o dano causado, porém precisa mostrar quais suas outras opções de início, em que situação utilizar, qual suas consequências, entre outros.

- Vídeos demonstrativos (serão gravados por autoria própria)
Como a versão ainda não oferece o máximo para a compreensão, os vídeos, com certeza, são as melhores ferramentas para demonstração dos combos.
## Aprendizados

Basicamente, esse foi o meu primeiro projeto de React.JS da vida. Comecei ele no início de 2020, mas acabei abandonando por focar em outros projetos. O primeiro contato que tive com o JavaScript, então posso dizer que muito do meu aprendizado veio dele e foi aplicado nele. 
Aprendi bastante da manipulação de arrays utilizando lodash, aprendi bastante sobre responsividade e CSS, aprendi a organizar meu código de uma maneira que torne a programação mais ordenada para mim. Porém, ainda tem bastante que eu posso aprender e esse será meu projeto principal, que irei trabalhar sempre que puder para melhorar.
