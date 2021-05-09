## Bem vindo ao repositório do Desafio Field Control Fron-End 2021

Este é o reposítório de uma aplicação front-end que foi desenvolvida a pedido da Field Control.
O deasfio consiste em replicar uma página de busca do GitHub. Construir uma interface de usuário e integrar
com a API do GitHub. Uma `Single Page Aplication` desenvolvida com tecnologias de ponta do mercado. Entre
elas o React.
### Por que React?

É um dos framworks mais modernos do mundo. Principalmente para `Single Page Aplications`. Possui inúmeras vantagens. Que vão desde a quantidade de processamento até a experiencia do usuário final. Por ser desenvolvido e mantido por uma das maiores empresas de tecnologia do mundo, está em constante atualização e manutenção. É muito popular. Está entre os mais usados no mundo todo. Tem uma comunidade bastante
ativa. Não é dificil encontrar artigos, textos, vídeos, aulas, etc. A documentção também é muito clara e objetiva. E está em várias línguas. Inclusive português. Possui diversos recursos avançados para otizmiação como o Lazy Load, exemplo. Tudo isso sem contar todo o ecossistema de bibliotecas oficias e de terceiros. `Jest`, `Redux` e `Testing Library` incluidos. Também é um framework para aplicações mobile. Com praticamente a mesma API para web.

### Bibliotecas

[@sheerun/mutationobserver-shim](https://www.npmjs.com/package/@sheerun/mutationobserver-shim): uma biblioteca que otimiza o osbervador de mutações do DOM

[Testing Library](https://testing-library.com/): oficial React Testing Library, ótima documentação e relativamente tranquila de se trabalhar

[Reactstrap](https://reactstrap.github.io/): biblioteca de componentes React do Bootstrap. Todos os componentes são funcionais. Tornando a perfeita para trabalhar com React principalmente com hooks, context e até mesmo redux. Possui vários tipos de componentes. Todos muito modernos e elegantes. Muito fácil de customizar e vem com várias features imbutidas nos componentes. Ajuda a ganhar tempo na hora de produzir. Precisa do `Bootstrap` para rodar.

[Moment](https://momentjs.com/): uma biblioteca criada por um brasileiro. é idela para calcular a diferença de tempo em relação a horas, dias, meses e anos muito boa pra várias ocasiões. Como essa de criar uma interface de usuário com muitas informações.

[PropTypes](https://reactjs.org/docs/typechecking-with-proptypes.html): checagem de tipos de props passadas de componente pai para filho ajuda muito no desenvolvimento e a manter um código limpo e organizado

[Redux](https://redux.js.org/): pra mim é a melhor forma de gerenciamente de estado de uma aplicação React.
faz coisas que o React sozinho não faz. Oferece uma estrutura modularizada. O que facilita muito a manutenção e correção de bugs. É um upgrade para as  `devTools`. Possibilita mapear e distribuir funções e props para qualquer parte da aplicação. Enfim. Redux é muito lindo.

[Redux Thunk](https://github.com/reduxjs/redux-thunk): um `middleware` para Redux lidar com actions assíncronas.

[ES LInt](https://reactjs.org/docs/hooks-rules.html#eslint-plugin): formatção de código, padronização, correção automática, avisos e erros relacionados a escrita e organização do código. Também é indicado pelo pessoal do React. Avisa quando um useEffect está com array de dependencias exausto. O que ajuda a previnir loops, renderização desnecessária e processamento de dados repetidos.

[Jest](https://jestjs.io/pt-BR/): melhor framewok de testes. pricipalmente por causa do modo `watchAll`. que
permite desenvolver e testar em tempo real. E ir acompanhando os impactos de mudanças no código da apliação. Também é necessário para configurar e testar o React junto com Redux.

[babel-jest](https://redux.js.org/recipes/writing-tests): também necessário para configurar o `Redux`

[Insomnia](https://insomnia.rest/download): para realizar requisições GET a api do GitHub, detalhar objetos e montar queries

[CodeSandBox](https://codesandbox.io/u/hugoleonardo.dev): ambiente virtual para desenvolvimento, uso muito para pesquisar componentes, bibliotecas e frameworks. Ou quando quero testar algum componente. Só renderizar.
Para não ter que crair um React App toda vez que tiver uma idéia ou pesquiser uma tecnologia nova.

[VS Code](https://code.visualstudio.com/): melhor editor de texto que eu conheço


[git](https://git-scm.com/): versionamento de código

[GitHub](https://github.com/): api, documentação e serviços como o oauth.

### Tecnologia X e não Y?

Optei por `Redux` por que considero o `Context API` meio caótico. Emora seja a forma mais moderna de se trabalhar com React, o Context ainda deixa muito a desejar em relação ao gerenciamente global da aplicação. Gosto muito de usar `Hooks`. Também junto com Redux. Mas Contet me desanima. Só a parte do devTools do Redux já me deixa animado. Mas tem muito mais coisas que me atraem no Redux. Context também é mais verboso. Redux é meio assustador no começo. Mas depois é só alegrias.

O Reactstrap foi de última hora. Estava com um protótipo pronto usando Twitter Boostrap. Criei este protótipo na plataforma CodeSandBox. Mas lá o ambiente já está configurado para transpiling de várias aplicações. Incluido aplicações em `jQuery`. O Twitter Bootstrap usa jQuery. E quando fui transferir o protótipo do ambiente do CodeSandBox para  o meu, não deu certo. Tentei ainda usar o `Babel` pra tranpilar e `Webpack`. Mas não deu certo. Precisaria de mais tempo para pesquisar e resolver o problema. Já que não tenho familiaridade com jQuery. Então corri e refiz a aplicação do zero. Usando `Reactstrap`. Que eu já conhecia.

Sou fan do `Jest` e da `React Testing Library`. Pelo menos o Facebook contribui com algumas coisas para humanidade. E entre elas estão o React, Jest, RTL, React Native, etc. Também gosto de criar meus protótipos no CodeSandBox. É uma ferramente muito interessante pra quem programa. Principalmente em React. Perfeita pra quem está perquisando uma biblioteca ou framework. E quer ver tudo funcionando com cóigo e em tempo real.

### Engenharia de software:

Bem, ainda não sou o melhor arquiteto de software. São tantos padrões que a gente fica meio perdido. Mas saber
observar e identicar padrões são virtudes do programador. Quando vi arquitetura MVC nos requisitos, não entendi muito bem como isso se aplica no React. Porém o que posso garantir é que tentei respeitar ao máximo os princípios do `DRY`. Não repetir código é uma coisa maravilhosa. Também tento modularizar e organizr tudo da melhor forma. Incorporando pricípios do `SOLID`. Principalmente com a parte de responsabilidade única. Tentando ao máximo não atribuir muitas responsabilidades para uma única função. Reutilizar código e componentes, reafatoração, testar e debugar software, também são princípios básicos que devem estar no nosso dia a dia. `Responsive Design` e `Mobile First`, também foram levados em consireção. Além des aspectos semânticos e outras práticas.

### Desafios e problemas:

O maior desafio era fazer um transpling e usar o `jQuery` com o protótipo que eu tinha feito. Porém o tempo foi passando e nada de conseguir resolver. Então descidi começar tudo do zero. Claro que a segunda vez que eu fiz foi mais tranquilo. Já havia quebrado a cabeça antes. Mas deu muito medo ter que refazer tudo. Estava muito animado com o resultado do protótipo. Porém foi uma experiencia boa. Eu deveria ter feito desde o inicio com Reactstrap. E o projeto já  estaria pronto agora. Mas aceitei o desafio de conhecer uma bibliteca nova. Gostei muito. Mas teve esse problema do `jQuery`.

Implementar a paginação e a ordeneção também não foi tarefa fácil. Pensei que seria mais tranquilo. O mais desafiador, como sempre são os testes. Também perdi um dia inteiro acertando as configurações. Lendo documentação e tudo mais. Já testei muitas vezes. Mas é sempre desafiado. Cada aplicação é de um jeito. E quando envolve ações assíncronas então, aí é um Deus nos acuda. Só que eu gosto demais. É muito estimulando e desafiado. Estou com problemas para chegar nos `100% de cobertura de testes`. Mas vou conseguir. Já estou em 94%.

### Melhorias e implementações:

Logo de cara, a primeira melhoria que eu faria seria na parte da interface. Implementar algumas features. Como
por exemplo um botão flutuante que retorna para o topo. É muito importante. Principalmente no mobile.
Persistir o estado depois que ocorre um erro e voltar para a tela anterior. Transpilar para que possa rodar
em ambientes com código legado. Empacotar conteúdos `dinámicos e torná-los estáticos`. Armazenando informação no `cache`. Implementar `Lazy Load` onde for possível. Otimização da engine de busca. Transformar em `Progressive Web Aplication` com modo `off-line` e dowload na máquina.Testes `end-to-end` e testes manuais. Dark mode. Melhorias na acecibilidade. Entre outros.

### Sobre mim:

Sou desenvolvedor de software de Belo Horizonte, MG. Antes da pandemia eu estava estudando Engenharia Metalúrgica. Na Universidade Federal de Ouro Preto. Logo no início, quando pararam as aulas, fiquei pensando em um jeito de não parar de estudar e estar caminahdo para um progresso pessoal. Olhei a minha volta e vi que tudo que eu tinha era um computador velho, acesso a internet e vontade de aprender.
Sempre gostei de tecnologia. Porém, quando era adolescente, acabei criando um medo de tecnologia. Principalmente, por causa do meu pai. Que é outro doido com tecnologia. Mas ele não sabia passar as coisas para mim. Ele me deixava mais com medo do que com curiosidade e vontade de aprender. Mesmo assim, ainda passei em 3 universidades federais. E fui estudar Engenharia. Foi quando tiver um contato mais de perto com programação. Nas difciplinas obrigatórias. Alí deu pra sentir que não era tão difícil assim. Mas como já estava do meio pra frente no curso, não abandonei. Só que a pandemia mudou todo este contexto. Não só o contexto como as fobias também. Já trabalhei como motorista de taxi, recepcionista de hotel noturno, atendente de telemarkeing, professor de ingles na rede estadual, garçom, entrevistador remoto e até de Uber. Também fui monitar nas diciplinas de introdução a ciência dos materias e quimica. Na Universidade Federal da Paraíba. Já vi que meu futuro não é na engenharia. Só se for engenharia de software. Me vejo fazendo isso bem velhinho. Já sei o que vou fazer antes de morrer.
Um commit.

### Considerações finais

Agradeço desde já a oportunidade para mostrar minhas skills. Me identifico muito com a filosofia da empresa. Faz tempo que não vejo em numa vaga nem sequer menção a pair-programming. Uma prática que considero a mais importante no desenvolvimento de software. Aprendi muita coisa em pouco tempo porque tive oportunidade de trabalhar e conviver (mesmo que vitualmente) com pessoas desenvolvedoras. O olhar de fora sempre enxerga coisas que não estamos vendo.
Senti na abordagem do Luiz que vocês tem um tratamento mais, digamos assim, humano. Menos formal. O que eu considero importante também. A vida já anda tão complicada e chata. Não precisamos criar mais barreiras que afastam as pessoas. Espero pelo menos chega na entrevista final. E ter um feedback. Positivo ou negativo.
Tenho certeza que, por se tratar de uma empresa de desenvolvedores para desenvolvedores, vocês vão olhar com carinho meu projeto.
Desculpe pelo atraso. Realmente tive problemas com o jQuery. Fiz tudo meio que na correria. E estou morrendo de sono. Tem dois dias que não durmo. Estava tentando remover o CSS in line... Mas to com medo de tirar algo e não lembrar de colocar de volta. Também acho desnecessário criar um arquivo CSS só para uma linah de estilo.
Estou indo dormir agora. Aproveitei e fiz um deploy na Amazon. Vou deixar o link do deploy e o link do protótipo que eu estava fazendo antes de ter problemas com jQuery.

[Protótipo](https://codesandbox.io/s/agitated-moon-pmkgv)

[Deploy Amazon](https://main.d1w0urkkuf4jt2.amplifyapp.com/)

### Contatos

**Telefone**: `31999699361` também é whatsapp
**Email**: `hugoleonardo.dev@gmail.com`

[LinkedIn](https://www.linkedin.com/in/hugo-leonardo-matosinhos-de-souza/)

[GitHub](https://github.com/hugoleonardodev)

[CodeSandBox](https://codesandbox.io/u/hugoleonardo.dev)
