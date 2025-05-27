**Framework, linguagem e ferramentas**

Descreva ferramentas e bibliotecas (libraries, framework, tools etc) você usou.
- 🔧 Utilizei NestJS que é um framework para Node.js que utiliza TypeScript e traz uma arquitetura baseada em módulos e injeção de dependência. Ele facilita a construção de aplicações escaláveis e bem estruturadas, especialmente APIs RESTful e GraphQL.

- 💻 Utilizei Angular que é um framework front-end mantido pelo Google, usado para criar aplicações web modernas e dinâmicas. Com TypeScript, arquitetura baseada em componentes e poderosas ferramentas de desenvolvimento, permite criar interfaces reativas e responsivas com alta produtividade.

- 🐘 Utilizei Postgres por que PostgreSQL é um sistema de gerenciamento de banco de dados relacional, robusto e open-source. Sendo uma escolha confiável para aplicações de qualquer porte.

- 🐳 Docker é uma plataforma de containers que permite empacotar aplicações e suas dependências em ambientes isolados. No projeto, foi utilizado para facilitar a configuração e execução do ambiente de desenvolvimento, garantindo consistência e portabilidade.

- 🔄 Prisma é um ORM (Object-Relational Mapping) moderno para Node.js e TypeScript. Ele simplifica o acesso e manipulação de dados no banco PostgreSQL, oferecendo tipagem segura, migrações automatizadas e uma experiência de desenvolvimento mais produtiva.

- 🧩 Utilizei a biblioteca class-validator no NestJS para aplicar validações automáticas nos DTOs (Data Transfer Objects), garantindo que os dados recebidos pelas rotas da API estivessem no formato esperado antes de serem processados. Isso ajudou a prevenir erros de entrada e a manter a integridade dos dados desde o início do fluxo.

- 👽 Para finalizar o projeto, realizei a publicação da aplicação em ambiente de produção. Utilizei a plataforma Render para hospedar tanto a API NestJS quanto o banco de dados PostgreSQL, aproveitando a integração simples e o suporte a deploy contínuo. Já o frontend em Angular foi publicado na Vercel, por ser uma plataforma otimizada para aplicações web, com deploy rápido e integração direta com repositórios Git. Com isso, consegui disponibilizar o sistema online de forma gratuita, com domínio próprio e integração completa entre o backend e o frontend em produção.

**Técnologias X e Y**

Justifique porque você optou pela tecnologia X e não a Y?

- Optei pelo Prisma no lugar do TypeORM principalmente pela produtividade, performance e experiência de desenvolvimento. Aqui estão os principais motivos:

- Tipagem mais segura e completa
O Prisma gera tipos automaticamente com base no schema do banco de dados, garantindo autocompletar e validações em tempo de desenvolvimento. Isso reduz erros e acelera o desenvolvimento.

- Migrações controladas e previsíveis
O sistema de migração do Prisma é simples, transparente e menos propenso a erros. As mudanças no schema são feitas em um único lugar (schema.prisma), e a CLI gera as migrações automaticamente com base nessas alterações.

- Experiência de DX (Developer Experience) superior
A sintaxe do Prisma Client é mais clara, moderna e fácil de usar em comparação ao TypeORM, especialmente para quem trabalha com TypeScript.

**Princípios de software**

Quais princípios da engenharia de software que você usou?

- Embora eu não tenha seguido conscientemente princípios formais durante o desenvolvimento, muitos deles foram aplicados de forma natural, guiado pelas boas práticas do próprio ecossistema (NestJS, Angular, etc). Alguns dos princípios que se refletem no projeto:

- Modularidade e reutilização de código
Utilizei a estrutura modular do NestJS e do Angular para organizar o projeto em partes isoladas, reutilizáveis e fáceis de manter.

- Injeção de dependência
Esse é um princípio forte no NestJS e foi utilizado automaticamente ao criar e injetar serviços, contribuindo para um acoplamento fraco entre as partes do sistema.

**Desafios e problemas**

Conte um pouco sobre os desafios e problemas que você enfrentou e como você resolveu.

- Um dos principais desafios que enfrentei foi aprender e me adaptar ao NestJS e ao Angular, já que eram tecnologias novas para mim. Estudei a documentação, vi muitos tutoriais e exemplos para entender a estrutura dos frameworks, a injeção de dependência e o uso de componentes e serviços.

- Outro desafio importante foi integrar corretamente o backend com o frontend — lidar com CORS, garantir que o frontend conseguisse consumir os dados da API e que tudo funcionasse em conjunto, especialmente ao subir para produção. Tive que revisar configurações, ajustar URLs, e garantir que as requisições estavam batendo nos endpoints certos.

- Esses obstáculos me ajudaram a entender melhor não só os frameworks, mas também como funciona uma aplicação fullstack na prática, da configuração inicial até a comunicação entre as camadas.

**Melhorias e próximas implementações**

O que você entende que pode ser melhorado e como isso pode ser feito?

- Tratamento de erros mais detalhado:
Melhorar o tratamento de erros e mensagens retornadas pela API, diferenciando melhor erros de validação, de banco de dados ou de autenticação, para facilitar o debug e melhorar a experiência do usuário.

- Autenticação e autorização:
Implementar um sistema de autenticação (JWT, por exemplo) para proteger rotas sensíveis e permitir diferentes níveis de acesso conforme o tipo de usuário.

- Responsividade e usabilidade:
Melhorar o layout do frontend para se adaptar melhor a diferentes tamanhos de tela e tornar a navegação mais fluida.

- Testes automatizados:
Incluir testes unitários e/ou de integração, principalmente no backend, para garantir a estabilidade e facilitar manutenção futura.

**Vídeo de apresentação**

Grave um vídeo do seu projeto rodando e envie o link:

- Vídeo da aplicação rodando em produção: https://www.youtube.com/watch?v=kai1thbo9ow
<!-- Dica: você pode usar o https://jam.dev/ para facilitar sua gravação ;) -->

**Sobre você**
Queremos te conhecer um pouco melhor, conte um pouco sobre você.

Onde nasceu/De onde você é? Lugares que estudou, empresas que trabalhou, como você se envolveu com desenvolvimento de software.. enfim, Quem é você?

**Outros detalhes**
- Olá! Meu nome é André Trevizam, sou de Cedral (bem perto de São José Do Rio Preto), e desde pequeno sempre fui curioso com tecnologia. Comecei a me interessar por desenvolvimento de software quando tive meu primeiro contato com programação na faculdade (sim, cai de paraquedas lá), e isso rapidamente virou algo que eu quero aprofundar cada vez mais. Principalmente em Desenvolvimento Web.

Se quiser enviar alguma informação adicional sobre o desafio..
- Estou no quarto semestre em Análise e Desenvolvimento de Sistemas pela FATEC Rio Preto, e desde então venho aprofundando meus conhecimentos em desenvolvimento web. Tenho estudado bastante por conta própria, fazendo projetos práticos para aplicar o que aprendo. Recentemente, me desafiei a construir essa aplicação fullstack usando NestJS e Angular, duas tecnologias que ainda não conhecia, e consegui superar os obstáculos com bastante pesquisa e dedicação.

- Ainda não trabalhei em empresas da área, mas estou muito motivado para entrar no mercado e aprender com profissionais mais experientes. Gosto de trabalhar em equipe, trocar conhecimento e estou sempre buscando evoluir tanto tecnicamente quanto como pessoa.

---

Ah, deixe seu e-mail ou telefone para entrarmos em contato com você :) 
- E-mail: andretrevizam264@gmail.com
- Whatsapp: 17 99206-1156
