## Envio de solução

Gostariamos de entender como você pensa e as decisões que você tomou durante o desenvolvimento, detalhe um pouco mais sobre:

**Framework, linguagem e ferramentas**

Descreva ferramentas e bibliotecas (libraries, framework, tools etc) você usou.

## Resposta:

Para desenvolver este projeto, usei TypeScript, uma versão mais avançada do JavaScript, que ajuda a tornar o código mais seguro e organizado.

O frontend foi desenvolvido com Angular (Conforme Solicitado), um framework robusto e estruturado que permite a criação de aplicações SPA (Single Page Applications) mais eficientes.

No backend, utilizei NestJS (Conforme Solicitado), um framework para Node.js, que adota conceitos do Angular como injeção de dependências e modularização, tornando o código mais organizado. A API foi desenvolvida com GraphQL usando Apollo Server, permitindo consultas otimizadas e flexíveis.

Ferramentas e Bibliotecas Utilizadas

- Editor de Codigo

  Utilizei o Visual Studio Code (VS Code), um editor poderoso e versátil, amplamente utilizado por desenvolvedores devido à sua personalização, suporte a extensões e integração com diversas tecnologias.

- Frontend (Angular)

  @angular/core, @angular/common, @angular/forms, @angular/router – Módulos essenciais do Angular.
  @apollo/client, apollo-angular, graphql – Para integração com a API GraphQL.
  rxjs – Para manipulação de dados reativos e programação assíncrona.
  zone.js – Gerenciamento do contexto de execução do Angular.
  scss – Utilizado para estilização, pois permite funcionalidades avançadas sobre o CSS padrão.

- Backend (NestJS + GraphQL + Prisma)

  @nestjs/core, @nestjs/common, @nestjs/platform-express – Componentes principais do NestJS.
  @nestjs/graphql, apollo-server-express, graphql – Para criação da API GraphQL.
  @prisma/client, prisma – ORM utilizado para modelagem e interação com o banco de dados PostgreSQL.
  Ferramentas de Teste e Qualidade: Jest

- Infraestrutura e Deploy

  Vercel – Para hospedagem do frontend Angular.
  Railway – Para hospedagem do backend e banco de dados PostgreSQL.

**Técnologias X e Y**

Justifique porque você optou pela tecnologia X e não a Y?

## Reposta:

Por que escolhi essas tecnologias?

- TypeScript vs. JavaScript

  Mesmo que vem por por padrão ainda assim optaria pelo TypeScript porque oferece uma tipagem estática, o que melhora a legibilidade e reduz erros em tempo de execução, não sei se nesse projeto consegui aplicar muito bem o conceito de Tipagem vamos dizer assim aproveitar 100% dele mas pouco a pouco eu já estou com foco nisso. Além disso ele facilita o trabalho com grandes projetos ao permitir um código mais organizado e escalável.

- Angular vs. React

  Conforme pedido o projeto foi feito em Angular acredito eu que é por causa da sua estrutura mais opinativa, ele promove boas práticas como injeção de dependências e modularização.

- NestJS vs. Express

  Conforme pedido o projeto foi feito em NestJS acredito que é porque oferece uma estrutura mais organizada baseada em módulos e uma melhor integração com Angular. Até porque aonde eu pesquisei o Nestjs foi "criado" pensando na estrutura do Angular.

- GraphQL vs. REST

  Conforme "solicitado" optei por GraphQL porque pelo o que eu entendi ele permite buscar apenas os dados necessários em uma única requisição, tornando a API mais eficiente e flexível para o consumo no frontend. E também porque sempre usei o API Rest achei que seria interressante eu me desafiar usar o GraphQL para eu conhecer

- Prisma vs. Sequelize

  Não vou mentir escolhi Prisma mais pelo "conhecimento" que eu já tenho da ferramento eu acho um ORM bem simples e fácil de usar.

- PostgreSQL vs. MongoDB

  Escolhi PostgreSQL porque queria me desafiar a utilizar um banco de dados SQL, em vez de um NoSQL, como o MongoDB que é o que estava usando ultimamente. E também devido ao mercado vejo que o conhecimento em postgres é algo mais vantajoso do que MongoDB.

- Vercel

  Escolhi a Vercel para hospedar o frontend em Angular devido à sua facilidade de configuração, integração contínua com repositórios Git e suporte nativo para aplicações frontend modernas. Além disso, a plataforma oferece deploys rápidos e previews automáticos de branche.

- Railway

  Optei pelo Railway para hospedar o backend e o banco de dados PostgreSQL devido à sua simplicidade na configuração.

**Princípios de software**

Quais princípios da engenharia de software que você usou?

## Respota:

Princípios da Engenharia de Software Utilizados

Modularidade :

- No frontend, tentei utilizar componentes independentes no Angular, organizando o código de forma modular para facilitar a manutenção e reutilização. Porém como o frontend foi algo bem simples acabou que eu não consegui demonstrar muito bem isso.

KISS (Keep It Simple, Stupid)

- Tentei manter a estrutura do código o mais simples possível, evitando soluções complexas desnecessárias.

Boas Práticas de Banco de Dados

- Escolhi PostgreSQL para trabalhar com um banco relacional e usei Prisma para garantir que as interações com o banco fossem seguras e eficientes.

Testabilidade

- Implementei testes unitários com Jest no backend para garantir a qualidade do código.

Scrum:

- Além dos princípios de engenharia de software, utilizei práticas ágeis baseadas no Scrum, organizando o desenvolvimento em pequenas entregas e priorizando tarefas em um backlog.

**Desafios e problemas**

Conte um pouco sobre os desafios e problemas que você enfrentou e como você resolveu.

## Reposta

### Desafios

Adaptação ao Angular

- Como desenvolvedor acostumado com Next.js e React, tive bastante dificuldade em me adaptar ao modelo do Angular, principalmente devido à sua estrutura baseada em módulos, injeção de dependências e toda a estrutura de pastas.
- Essa curva de aprendizado impactou um BASTANTE a qualidade final do front-end.

Aprendizado do NestJS

- Nunca havia trabalhado com NestJS, então tive que aprender do zero. No início, a estrutura de pastas, a forma de organizar os serviços e a forte orientação a arquitetura modular foram desafios.
- No entanto, difrente do Angular o NestJS foi interessante, gostei bastante de usar ele, pensando até em projetos futuros usar ele como o backend.

Uso do GraphQL

- Até então, eu só havia trabalhado com RESTful APIs, então implementar GraphQL foi um grande desafio.
- A estrutura de schemas, resolvers e mutations exigiu um tempo de aprendizado, mas no final, consegui entender suas vantagens, como a flexibilidade na obtenção de dados.

Banco de Dados PostgreSQL

- Embora já tivesse estudado PostgreSQL, nunca o utilizei como banco principal em um projeto. Minhas experiências anteriores foram com MySQL, MongoDB e Firebase,m então tive que me adaptar a usá-lo.

### Problemas

Problema ao obter dados no Frontend

- Tive dificuldades para enviar solicitações do frontend para o backend, especialmente ao tentar excluir e editar cards.
  Acredito que o problema estava na escrita das queries/mutations do GraphQL, o que fazia com que as requisições não fossem processadas corretamente.
  Para resolver, revisei as mutations do Apollo Client no Angular, corrigi os parâmetros que estavam sendo passados e validei os resolvers no backend.

Problema no Deploy do Frontend (Vercel)

- O deploy do frontend me deu bastante dor de cabeça! O site compilava, mas retornava erro 404.
  Descobri que o problema estava no output directory. A Vercel não estava encontrando corretamente os arquivos de saída da build do Angular.
- Resolvi isso ajustando o build output na configuração da Vercel, garantindo que ela apontasse para o diretório correto.

Conflitos de Versão no Backend (Apollo Server e dependências)

- Outro problema foi relacionado a versões conflitantes do Apollo Server com outras dependências do NestJS.
  Algumas funcionalidades simplesmente não funcionavam por incompatibilidade entre pacotes.
  A solução foi revisar as versões, atualizar dependências e testar diferentes versões até encontrar uma combinação estável.

**Melhorias e próximas implementações**

O que você entende que pode ser melhorado e como isso pode ser feito?

## Resposta:

Front-end - Aperfeiçoar a Interface e a Usabilidade

- Embora o frontend tenha sido desenvolvido utilizando Angular, a interface do usuário ainda poderia ser mais melhora e principalemnte responsiva. (sim tem coisa na página que da agonia só de olhar kk) A adaptação ao modelo do Angular foi um pouco desafiadora, e a experiência de design ficou muito abaixo do eu esperava.
  Solução: Melhorar a UI/UX utilizando bibliotecas como o Angular Material ou Tailwind CSS para tornar a interface mais moderna e responsiva.

Backend - Organização e Testabilidade do Código

- Apesar de ter explorado o NestJS com GraphQL, poderia haver uma melhor organização e padronização do código. Além disso, a testabilidade poderia ser aprimorada para garantir que a aplicação esteja funcionando de forma robusta e sem erros.
  Solução: Investir mais em testes, como testes de integração e testes end-to-end, para garantir que o sistema como um todo está funcionando corretamente.

Deploy - Automação e Processos de Build

- O deploy na Vercel foi um processo que causou alguns problemas devido à configuração do diretório de build, o que atrasou a entrega.
  Solução: Criar um pipeline de CI/CD lá no GitHub Actions. Isso ajudaria a automatizar o processo de build e deploy, além de garantir que todas as configurações fossem feitas de forma eficiente.

Banco de Dados - PostgreSQL e Prisma

- Embora tenha utilizado PostgreSQL com o Prisma pela primeira vez, percebo que alguns aspectos da modelagem de dados poderiam ter sido mais bem planejados, especialmente em relação às relação entre tabelas e consultas complexas.
  Solução: Investir em um melhor planejamento da modelagem de dados para evitar redundâncias e otimizar as consultas. Além disso, aprender mais sobre as melhores práticas do PostgreSQL, como indexação, normalização de dados e consultas otimizadas, para melhorar a performance e outras coisas que me falta ainda.

Sistema de Login

- Atualmente, o sistema não possui autenticação, o que significa que todos os usuários acessam os mesmos quadros no Kanban. Isso limita a usabilidade e impede uma experiência personalizada.
  Solução: Implementar um sistema de login utilizando o Firebase Authentication (FireAuth). Assim, cada usuário teria seu próprio Kanban, e os quadros só seriam mostrados quando o ID do usuário logado coincidisse com o registrado no banco de dados. Isso traria mais segurança e personalização ao sistema, e mostraria um profissionalismo maior.

**Vídeo de apresentação**

Grave um vídeo do seu projeto rodando e envie o link:

Segue o link da gravação: https://drive.google.com/file/d/1PXf0jTklCWsJN-e50njozBEHh_N4rjIF/view?usp=sharing

**Sobre você**

Queremos te conhecer um pouco melhor, conte um pouco sobre você.

Onde nasceu/De onde você é? Lugares que estudou, empresas que trabalhou, como você se envolveu com desenvolvimento de software.. enfim, Quem é você?

## Resposta:

Meu nome é Samuel, sou natural de São Paulo, mas moro em São José do Rio Preto desde pequeno. Minha trajetória na tecnologia começou cedo, já que sempre tive um computador em casa e gostava de explorar tudo o que fosse possível. Quando ganhei meu primeiro celular Android, minha curiosidade só aumentou. Eu adorava entender como as coisas funcionavam, teve uma época que eu sabia todas as pastas e arquivos do sistema haha.

Com o tempo, decidi aprofundar esse interesse e fiz um curso de Web Designer no Senai Rio Preto, onde tive meu primeiro contato mais técnico com HTML, CSS e JavaScript. Foi nessa época que me interessei pelo funcionamento da internet e percebi que queria seguir carreira como programador. Para dar continuidade a esse sonho, me formei em Análise e Desenvolvimento de Sistemas pela Fatec Rio Preto. ( antes disso eu fiz cursos de inglês, curso de informática e curso de eletricista de manutenção eletroeletrônica.)

Durante a faculdade, trabalhei em projetos acadêmicos que envolveram tecnologias como Git, C#, .NET, MySQL, Flutter, Dart, Python, Firebase, PostgreSQL, Scrum, entre outras. Isso me ajudou a construir uma base teórica sólida em programação e arquitetura de software. No final da faculdade, comecei a me aprofundar em React, e foi aí que descobri o Next.js, tecnologia pela qual me apaixonei e que estudo continuamente para aprimorar minhas habilidades no desenvolvimento web.

Atualmente, meu foco é criar aplicações escaláveis e eficientes, sempre buscando desafios que me permitam aprender e evoluir. Além disso, tenho grande interesse por desenvolvimento de jogos e estou constantemente explorando novas tecnologias, como Docker, CI/CD, Redux, entre outras que fazem sentido no mercado.

Meu primeiro contato profissional com a tecnologia foi como suporte de TI na Cânovas Bebedouros, onde atuo há mais de um ano no atendimento de chamados e na resolução de problemas técnicos. Hoje, sou responsável por todo o setor de TI da empresa, lidando desde manutenção de periféricos como impressoras, instalação de sistemas de telecomunicação e implementação de soluções tecnológicas, como a recente implantação de um novo CRM na empresa.

Com o tempo, fui direcionando minha carreira para desenvolvimento full stack, especializando-me em Next.js, TypeScript, Tailwind, Prisma e MongoDB. Faço estudos semanais para aprimorar minhas habilidades nessas tecnologias e melhorar minha experiência no desenvolvimento web.

Meu maior objetivo agora é ingressar em uma empresa de desenvolvimento, onde eu possa aplicar na prática o conhecimento adquirido na faculdade e vivenciar o dia a dia do mercado, participando de sprints, dailys e processos reais de desenvolvimento. Até agora, só tive contato com essas metodologias por meio do YouTube e LinkedIn, e sei que aplicá-las em projetos pessoais tem suas limitações e muitas vezes não fazem sentido mas… quero estar perto de pessoas experientes, aprender com elas, quero de fato evoluir , entender quais tecnologias fazem sentido em certas situações, como resolver problemas do dia a dia e, principalmente, crescer profissionalmente dentro do ambiente certo.


**Outros detalhes**

Se quiser enviar alguma informação adicional sobre o desafio..

## Resposta:

Sei que a empresa não trabalha com essas tecnologias, mas, se pudesse, com certeza teria desenvolvido esse Kanban usando Next.js! 😆 Ainda assim, foi uma experiência muito boa sair da minha zona de conforto e aprender Angular e NestJS(Nestjs é bem legal de trabalhar) para realizar esse desafio.

Além disso, essa foi uma semana bem corrida para mim. Se tivesse tido mais tempo livre durante o dia, certamente poderia ter refinado várias partes do projeto, PRINCIPALEMNTE no frontend e na experiência do usuário. E também nos testes acho que eu pequei bastante nessa parte e com mais tempo eu gostaria de melhorar principalmente a parte de testes automatizados.

Mesmo assim, fiquei satisfeito com o aprendizado que tive ao longo do processo e com os desafios que enfrentei.

---

Ah, deixe seu e-mail ou telefone para entrarmos em contato com você :)

- Email: samuelbrito.dev@gmail.com

- Portifolio: https://www.devsamuelbrito.com.br/

- WhatsApp: 17 98229-9393
