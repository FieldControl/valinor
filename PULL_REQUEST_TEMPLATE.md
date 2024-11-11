## Envio de solução

Gostariamos de entender como você pensa e as decisões que você tomou durante o desenvolvimento, detalhe um pouco mais sobre:

**Framework, linguagem e ferramentas**

Descreva ferramentas e bibliotecas (libraries, framework, tools etc) você usou.

Framework:
Começando pelo NestJs, foi o meu primeiro contato com esse framework super estruturado e robusto como a sua fama já diz. Me senti em casa com o Nest por já trabalhar com arquitetura MVC com Django (framework Python), que é aplicado também o conceito de arquitetura modular. Decidi tranquilamente em organizar a estrutura de pastas como sugere o framework, e materiais de estudo não faltou na nossa vasta internet.

Já o Angular, também foi o meu primeiro contato com esse framework sensacional! E claro, alguns fios brancos surgiram, mas, gostei demais de desenvolver um kanban em Angular e me (senti em casa)² por se falar em JavaScript. Sobre materiais de estudos, há mais informações sobre ngModule component do que standalone component que foi a escolha para esse projeto. No fim, deu tudo certo e não me arrependo da escolha, standalone component facilita muito a vida em projetos menores.

linguagem:
Comecei meus estudos com JavaScript, foi meu início de tudo na programação, e atualmente a minha base. Pelo fato de não ser uma linguagem tipada, o início do entendimento sobre lógica de todos que inicia os estudos, acredito que ajuda no avanço da compreensão na programação. Sem falar que é uma linguagem beeeeeeeem versátil. Acrescentando então esse famoso super set, o TypeScript... a linguagem fica show! Bem tipada, aumentando muito a segurança do código. E já atuo com TypeScript a mais de 7 meses, onde já me adaptei.

ferramentas:
Frontend:
    Angular 18
    Angular CDK
    Sass
    NG-Zorro

Angular 18:
    Última versão do Angular optando por standalone component e testes com Jasmine que o Angular provê nativamente.
Angular CDK:
    Biblioteca do Angular Material para implementação de drag and drop de cards e colunas.
Sass:
    Foi escolhida essa opção por eu já ter usado em outros projetos, e por gosto pessoal mesmo.
NG-Zorro:
    Bibliotecas de estilo com componentes pré-construídos, que permite criar interfaces rapidamente e com consistência visual. A biblioteca cuida de detalhes de layout e responsividade, evitando a necessidade de implementar manualmente, economizando tempo e esforço em estilizações.

Backend:
    NestJs
    PostgreSQL
    Apollo Server
    GraphQL
    JWT
    Passport
    Bcrypt
    Prisma ORM
    Class Validator
    Class Transformer

NestJs:
    Versão 10 do Nest com poucas configs manuais no ESLint, testes com Jest que é uma ferramenta nativa do próprio framework.
PostgreSQL:
    Banco de dados relacional, com bom suporte a JSON caso queira armazenar alguns dados de forma flexível futuramente.
Apollo Server:
    Usado como servidor JavaScript GraphQL para conectar a qualquer API, microservice ou banco de dados.
GraphQL:
    Construção APIs que é projetada para fornecer em um único endpoint, requisições complexas obtendo apenas as informações desejadas, impedindo informações irrelevantes.
JWT, Bcrypt e Passport:
    A tríade para lidar com autenticação de usuários, onde, JWT encadeia informações criptografadas usando Bcrypt e aplica em autenticação e autorização. E o Passport é quem implementa a estratégia JWT e permite autenticar endpoints.
Prisma ORM:
    Kit de ferramentas que permite acessar o banco de dados por meio de métodos e objetos TypeScript/JavaScript.
Class Validator e Class Transformer:
    Usados para validar os dados no backend.

**Técnologias X e Y**

Justifique porque você optou pela tecnologia X e não a Y?

No backend, optei por API GraphQL e não API REST, pela facilidade de requisições complexas como até encadear queries e mutations em cascata, e ser flexível os dados de retorno, tornando assim, em um único endpoint, resultados previsíveis e em JSON, em uma única consulta. Acredito eu, com meus estudos, que ganhamos muito em desempenho e performance.
Ainda no backend, optei Prisma como ORM e não TypeORM ou Sequelize, por ter sido projetado com TypeScript, e possui o sistema de tipos altamente rigoroso garantindo segurança nos dados. Uma vantagem também que percebi, foi uma experiência mais simples e rápida do que o TypeORM.
Optei por PostgreSQL e não outros bancos por ser relacional, free e ter suporte a JSON para futuras implementações como uma tabela de log ou histórico.
Optei também por JWT, Bcrypt e Passport, para autenticação pensando em escalabilidade e segurança.
E escolhi libs Class Validator e Class Transformer e não escolhi implementar validações em VanilaJs pela facilidade na manutenção.

No frontend, optei por standalone component para facilitar o aprendizado do fluxo das importações dos módulos nos componentes, já que foi os meus primeiros codes com Angular.
Escolhi Sass e não CSS ou less, por já ter experiência anterior e para não entrar no esquecimento com a ferramenta.
Optei por implementar drag and drop usando CDK do Angular Material, pela facilidade de desenvolvimento da funcionalidade.
E finalmente o NG-Zorro para estilização de componentes pré-prontos. Utilizei o ANT Design que é a mesma biblioteca só que para o ecossistema React. Vantagem disso é a falicidade de desenvolvimento, produtividade e um design mais padronizado, ajudando na manutenção do projeto.

**Princípios de software**

Quais princípios da engenharia de software que você usou?

Estudando rapidamente sobre princípios da engenharia de software, posso dizer o que se encaixa após ter desenvolvido a aplicação do desafio, e deixando claro que não parti desde o início do desenvolvimento, aplicar princípios da engenharia de software. Dito isso, peço desculpas de antemão, se eu cometer alguma gafe a respeito de conceitos de engenharia de software.
A Modularidade, presente nos frameworks NestJs e Angular foi fundamental para ser dividido um sistema em peças menores, que por sua vez, facilita na execução da Incrementação, um princípio que visa a evolução incremental de um sofware.
Acredito ter aplicado a Abstração no início do desenvolvimento. Gosto geralmente de iniciar um projeto usando o drawer.io para desenhar fluxogramas e tabelas do banco de dados e fazer anotações das funcionalidades no bloco de notas e/ou Trello.

**Desafios e problemas**

Conte um pouco sobre os desafios e problemas que você enfrentou e como você resolveu.

Os desafios foram:
    Criar uma API GraphQL, implementar autenticação no Nest e criar Middlewares (UseGuards) para proteger todas as queries e mutations, implementar testes unitários com Jest e Jasmine, requisições para API GraphQL a partir do frontend.

As soluções foram:
    Tutoriais no YT, documentações oficiais das ferramentas, chat-GPT e stackOverflow.

**Melhorias e próximas implementações**

O que você entende que pode ser melhorado e como isso pode ser feito?

Implementar teste de integração, melhorar testes unitários com Jest no backend, habilitar UseGuards em todas as queries e mutations, criar tela de login e signup para autenticação no frontend, implementar a autenticação no frontend salvando o token no localstorage.

**Vídeo de apresentação**

Grave um vídeo do seu projeto rodando e envie o link:

https://jam.dev/c/52a15a14-f879-4aa9-b019-1c63b474c03f

**Sobre você**

Queremos te conhecer um pouco melhor, conte um pouco sobre você.

Onde nasceu/De onde você é? Lugares que estudou, empresas que trabalhou, como você se envolveu com desenvolvimento de software.. enfim, Quem é você?

Nasci em São Paulo capital (mas nunca morei lá, rs), tenho 36 anos. Aos 16, fiz curso técnico em Mecatrônica, e trabalhei como operador e programador de CNC em metalúrgica num total de 15 anos. Ao longo desse tempinho percebi que não queria passar por mais tempo nessa rotina ruim de fábrica, por muitas vezes pesado, exigindo muito do físico. Então, no início de 2022, tive aquela virada de chave, ou, se quiserem chamar de "crise dos 30", tudo bem.

Comecei então a estudar JavaScript, por já ter curiosidade com a programação, onde tive aulas de C++ no curso técnico em 2007, abrangendo o superficial da linguagem.
Passei a gostar de codar e percebi a minha facilidade de aprender coisas novas, e usar e abusar da criatividade, que foi o motivo principal de ter escolhido essa profissão para transição de carreira.

Atuo desde abril deste ano como Desenvolvedor fullstack, com React/TypeScript no front e Django/Python no back em uma startup de Rio Preto na manutenção e criação de novas funcionalidades de um sistema ERP de gerenciamento de franquias.

Com um perfil detalhista, estou sempre em busca de novas possibilidades que possam agregar valor aos projetos. Acredito que essa combinação de qualidades me permite contribuir de forma versátil e competente, entregando resultados alinhados com os objetivos de cada projeto.

**Outros detalhes**

Se quiser enviar alguma informação adicional sobre o desafio..

Primeiramente, gostaria de agradecer do fundo do meu coração pela oportunidade de fazer esse desafio. Que uniu, como mencionei a pouco, alguns fios brancos, muitos estudos, e um prazer enorme de trabalhar com Angular e NestJs, e criar uma API em GraphQL. Sério, fiquei muito feliz! Tive muitos insights com essas tecnologias e a cada dia percebo que tem um universo de ferramentas e soluções imenso no mercado de TI.
E é por isso que quero fortemente mergulhar mais fundo na área, e poder crescer ainda mais e trabalhar com colegas capacitados em uma empresa que pode me agregar muito e também fazer a diferença como dev na Field.
Grato.

---

Ah, deixe seu e-mail ou telefone para entrarmos em contato com você :) 

rafaelnagatomo@gmail.com
(17)98161-5440
