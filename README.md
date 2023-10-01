# PokeFinder

# Documentação do Projeto PokeFinder

## Objetivo do Projeto
O objetivo do projeto é criar uma aplicação que permita ao usuário encontrar pokemons pesquisando pela barra de pesquisa usando a API do pokeapi.co

### Principais Funcionalidades da aplicação
- Pesquisar pokemons pelo nome usando a api
- Listar pokemons da api 
- Paginação dos pokemons
- Ver as Estátistica dos pokémons no pokecard
- Ver os tipos dos pokémons

## Como Usar o Projeto

Para utilizar o projeto PokeFinder, siga os passos abaixo:

1. **Clonar o Repositório**
 ```
git clone https://github.com/matheustatangelo/valinor
```

2. **Instalar as Dependências**:
```
npm install
```

3. **Iniciando a Aplicação**: 
```
 ng serve
```
4. **Como acessar a Aplicação**: 
```
Quando você der o comando ng serve, o terminal vai mostrar o endereço que você deve acessar para usar a aplicação.
Que normalmente é: http://localhost:4200/
```
#### Quais ferramentas e bibliotecas (libraries, framework, tools etc) eu usei?
Angular: v16.2
Jasmine: v5.1.0
Karma: v6.4.0
typescript: v5.1.3
ngx-pagination: v6.0.3
rxjs: v7.8.0
tslib: v2.3.0
Node: v20.6.1
Scss: v1.64.1

#### Porque você optou pela tecnologia X e não a Y?
Eu optei por usar o Angular pois é o framework que eu menos tenho experiência, nunca tinha utilizado ele e eu amo testar coisas novas e estudar coisas novas, gosto de me desafiar a ser melhor a cada dia, e também por ser um framework que tem uma curva de aprendizado muito curta e que é muito utilizado no mercado de trabalho, principalmente em grandes empresas.

#### Quais princípios da engenharia de software que você usou?
Usei a maioria dos princípios propostos pelo cientista David Hooker, que nós ensinam nas nossas aulas na faculdade, que são eles:

###### A razão de existir: Um sistema de software existe por um motivo: agregar valor para seus usuários. Todas as decisões devem ser tomadas com esse princípio em mente.

###### KISS (Keep It Simple, Stupid): Um sistema de software deve ser o mais simples possível, mas não mais simples do que isso. A complexidade desnecessária deve ser evitada ou eliminada, pois ela aumenta os custos, os riscos e as dificuldades de manutenção.

###### YAGNI (You Aren’t Gonna Need It): Um sistema de software deve implementar apenas as funcionalidades que são realmente necessárias e solicitadas pelos usuários ou clientes. Funcionalidades supérfluas ou especulativas devem ser adiadas ou descartadas, pois elas consomem recursos, tempo e espaço sem agregar valor.

###### DRY (Don’t Repeat Yourself): Um sistema de software deve evitar a repetição de informações ou código em diferentes partes do sistema. A repetição gera redundância, inconsistência e desperdício. Cada informação ou código deve ter uma única fonte de verdade no sistema.

###### Separation of Concerns: Um sistema de software deve ser dividido em módulos ou componentes que sejam coesos e acoplados fracamente. Cada módulo ou componente deve ter uma responsabilidade clara e bem definida, e não interferir nas responsabilidades dos outros. Isso facilita o entendimento, o reuso, a modificação e a integração do sistema.

###### Abstraction: Um sistema de software deve usar abstrações para representar as entidades e os conceitos do domínio do problema e da solução. As abstrações permitem ocultar os detalhes irrelevantes ou complexos, e focar nos aspectos essenciais e importantes. As abstrações também facilitam a comunicação entre os envolvidos no projeto do sistema.

###### Encapsulation: Um sistema de software deve usar encapsulamento para esconder os detalhes internos de cada módulo ou componente, e expor apenas uma interface simples e bem definida. Isso permite que cada módulo ou componente seja desenvolvido, testado e mantido de forma independente, sem interferir nos outros.

###### Anticipation of Change: Um sistema de software deve ser projetado e implementado de forma que possa se adaptar às mudanças nos requisitos, nas tecnologias, nos ambientes ou nas expectativas dos usuários ou clientes. As mudanças são inevitáveis e frequentes no desenvolvimento de software, e devem ser consideradas desde o início do projeto.

###### Think!: Pensar bem e de forma clara antes de agir quase sempre produz melhores resultados. Quando se analisa alguma coisa, provavelmente ela sairá correta. Ganha-se também conhecimento de como fazer correto novamente. Se você realmente analisar algo e mesmo assim o fizer da forma errada, isso se tornará uma valiosa experiência. Um efeito colateral da análise é aprender a reconhecer quando não se sabe algo, e até que ponto poderá buscar o conhecimento. Quando a análise clara faz parte de um sistema, seu valor aflora. Aplicar os seis primeiros princípios exige intensa reflexão, para a qual as recompensas em potencial são enormes.

### Desafios e problemas que eu enfrentei e como eu resolvi
Um maior desafio que eu enfrentei foi a falta de tempo, pois eu estudo e estou em época de provas, então tive que me organizar para conseguir entregar o projeto no prazo, e também tive que me organizar para conseguir estudar o Angular, pois eu nunca tinha utilizado ele, então tive que estudar ele e fazer o projeto ao mesmo tempo, mas eu consegui me organizar e entregar o projeto no prazo.
Outro problema que eu enfrentei foi a dificuldade em fazer a api do github e a entender ela, eu até tentei por uns 3 dias tentar utilizar ela com angular, mas como eu nunca havia mexido com angular e nem com a api do github, isso foi mais díficil, então mudei de ideia e decidi fazer com uma API que fosse mais fácil de entender
Tive alguns problemas ao longo do caminho, como funções que não funcionavam por estarem depreciadas, mas eu consegui resolver todos eles, pesquisando na internet e estudando mais sobre o angular e olhando a documentação.

### O que eu entendo que pode ser melhorado e como fazer isso?
Posso melhorar o jeito como lido com o angular e também posso usar funções novas que os desenvolvedores adicionarem-lhe, isso facilitaria muito o desenvolvimento da aplicação, e também posso melhorar o meu código, deixando ele mais limpo e mais organizado, como: criar uma pasta model, entity, por exemplo, e também posso melhorar a minha organização, para conseguir entregar o projeto em um prazo mais curto e também estudar mais sobre o angular e sobre outras tecnologias que eu poderia utilizar com ele, eu ia utilizar o tailwind na parte do front-end, mas como eu não tinha experiência com angular, decidi deixar pra uma outra hora, pra testar e ver como fica.

