## Envio de solução

Este projeto é uma aplicação de Kanban, desenvolvida utilizando Angular para o front-end e NestJS para o back-end. A aplicação permite criar e excluir colunas e tarefas, podendo-se mover as tarefas entre as colunas e criar subtarefas dentro de cada tarefa. Durante o desenvolvimento, foquei em aprender as melhores práticas e explorar o potencial das tecnologias utilizadas.

**Link do deploy**

https://kanban-fieldcontrol.netlify.app/

obs: A aplicação pode apresentar um pouco de lentidão porque o deploy foi realizado em uma plataforma gratuita, que possui limitações de recursos.

**Framework, linguagem e ferramentas**

+ Front-end Angular
  + Apollo Client para gerenciar o GraphQL no front-end
  + Apollo-angular para integrar o Apollo com o Angular
  + Lib graphql para implementar o padrão GraphQL
  + Testes unitários escritos comm Jasmine e executados com Karma

+ Back-end NestJS
  + Apollo Server com o @nestjs/apollo para gerenciar o GraphQL no back-end e integrar com o NestJS
  + nestjs/graphql para o suporte do GraphQL no NestJS
  + Mongoose e nestjs/mongoose para trabalhar com o MongoDB
  + Testes unitários com Jest

+ RxJS para programação reativa, fluxos assíncronos e operadores funcionais
+ Prettier para a formatação
+ ESLint para verificar qualidade do código

**Técnologias X e Y**

Justifique porque você optou pela tecnologia X e não a Y?

+ GraphQL foi escolhido em vez de REST para a API, pois ele oferece maior flexibilidade na consulta de dados, permitindo que os usuários solicitem exatamente as informações necessárias, sem super ou subcarregamento de dados.

+ O MongoDB foi escolhido como banco de dados devido à sua facilidade de uso e gerenciamento. Sua estrutura torna o desenvolvimento mais intuitivo e ágil para projetos onde as relações entre os dados são simples e não requerem a complexidade de um banco relacional. Além disso, minha experiência prévia com MongoDB me permite implementar e manter o banco de forma eficiente, atendendo às necessidades do projeto de maneira prática e confiável.

+ Para interação com o MongoDB, usei Mongoose, que facilita a criação de esquemas e validações no banco, além de ser amplamente suportado e integrado ao NestJS e Angular.

**Princípios e práticaas da engenharia de software**

+ SOLID: Estruturei o projeto separando responsabilidades em módulos e serviços distintos, o que torna o código mais escalável e fácil de manter.

+ DRY (Don’t Repeat Yourself): Centralizei lógicas reutilizáveis no back-end e organizei o front-end em serviços e módulos reutilizáveis.

+ Componentização: No front-end, dividi a aplicação em componentes independentes para facilitar testes e alterações futuras.

+ Clean Code: Escrevi o código com clareza, utilizando boas práticas para garantir a legibilidade e facilidade de manutenção.

**Desafios e problemas**

O principal desafio foi me aprofundar nos frameworks Angular e NestJS, com os quais eu tinha apenas conhecimentos básicos, já que geralmente trabalho com Next.js e a arquitetura MERN. Essa transição exigiu esforço para entender suas particularidades e aplicar boas práticas.

No GraphQL, optei por configurar o cache das queries de forma personalizada em vez de depender do refetch, para evitar chamadas desnecessárias ao servidor, garantindo dados atualizados e melhor performance.

Essas dificuldades me proporcionaram um grande aprendizado técnico e prático.

**Melhorias e próximas implementações**

+ Adicionar autenticação: Implementar um sistema de autenticação, com JWT por exemplo, para controlar o acesso e permitir alterações apenas por usuários autenticados. Isso também ajudaria a identificar quem criou ou modificou dados na aplicação.

+ Testes E2E: Desenvolver testes de ponta a ponta utilizando ferramentas como Cypress para garantir que a aplicação funcione corretamente em cenários reais.

+ Integração com Socket.io para permitir atualizações em tempo real na aplicação.

+ Tornar a aplicação responsiva: Adaptar a aplicação para dispositivos menores.

**Vídeo de apresentação**

https://drive.google.com/file/d/11i7lqIlq-fE8b8mbERQTPBC0T5YfqB_p/view?usp=drive_link

**Sobre você**

Meu nome é Arthur Nunes, tenho 21 anos e sou de São José do Rio Preto, SP. Minha jornada na área de desenvolvimento de software começou após uma mudança de trajetória acadêmica. Iniciei meus estudos em Ciências Econômicas na UNESP de Araraquara, onde estudei por dois anos. No entanto, percebi que minha verdadeira paixão estava na tecnologia e no desenvolvimento de software.

Foi então que decidi mudar de rumo e comecei a cursar Análise e Desenvolvimento de Sistemas na UNIP daqui de Rio Preto. Desde então, venho me dedicando ao aprendizado e à prática no desenvolvimento de software. Trabalhei como freelancer, criando e desenvolvendo sites, o que me permitiu ganhar experiência prática e aprimorar minhas habilidades técnicas enquanto explorava diferentes tecnologias e desafios no mundo da programação.

**Outros detalhes**

Agradeço muito pela oportunidade de participar deste processo e de demonstrar minhas habilidades. Fiquei orgulhoso do projeto que consegui realizar e de todo o aprendizado que adquiri ao longo do desafio. Foi um processo desafiador, especialmente porque tive que aprender muita coisa nova sobre os frameworks em um curto período de uma semana. Essa experiência foi extremamente enriquecedora e motivadora para meu crescimento profissional.

**Contato**

Email: arthurnunesdev@gmail.com

Telefone: 17 99167-7556



