## Para iniciar o desafio deve-se abrir a pasta backend e rodar os comandos:

`pnpm install`
`docker-compose up`
`cp .env.example .env`
`pnpm run migrate dev` && escolher um nome pra migrate
`pnpm run test:e2e`
`pnpm run start:dev`

## Para iniciar o desafio deve-se abrir a pasta frontend e rodar os comandos:

`pnpm install`
`pnpm run start`

## Envio de solução

Gostariamos de entender como você pensa e as decisões que você tomou durante o desenvolvimento, detalhe um pouco mais sobre:

**Framework, linguagem e ferramentas**

Descreva ferramentas e bibliotecas (libraries, framework, tools etc) você usou.

Bom, de acordo com minha experiencia e conhecimento optei por utilizar na api o NestJs com Prisma ORM e PostgreSQL, pois o NestJs é um framework que utiliza o TypeScript e é baseado no Angular, o que facilita a criação de aplicações escaláveis e de fácil manutenção. O Prisma ORM é uma ferramenta que facilita a comunicação com o banco de dados e o PostgreSQL é um banco de dados relacional que é muito utilizado em aplicações de grande porte. Para realização de testes e2e utilizei o Vitest que é um framework de testes e2e para aplicações NodeJs bem parecido com Jest, porem com uma configuração mais simples.

**Técnologias X e Y**

Justifique porque você optou pela tecnologia X e não a Y?

Optei pelo desenvolvimento de desenvolvimento com Prisma pois seria um ORM no qual ja tenho familiariedade e por ser uma ferramenta que facilita a comunicação com o banco de dados, o que me permitiria focar mais no desenvolvimento da aplicação em si.
Para os testes, como dito, optei pela utilização do Vitest ao invés do Jest por ser algo mais atual e simples de configurar.

**Princípios de software**

Quais princípios da engenharia de software que você usou?

Clean Arch, DDD, SOLID, TDD.

**Desafios e problemas**

Conte um pouco sobre os desafios e problemas que você enfrentou e como você resolveu.

Bom, enfrentei desafios na hora de desenvolver o frontend com o Angular, pois nunca ceguei a desenvolver uma aplicação Angular do zero. Minha experiencia no framework era apenas com manutenção de aplicações já existentes. Para resolver esse problema, utilizei a documentação oficial do Angular e alguns tutoriais que encontrei na internet.

**Melhorias e próximas implementações**

O que você entende que pode ser melhorado e como isso pode ser feito?

Bom, entendo que a aplicação deveria ter testes unitários, mudança de layout e melhorias na usabilidade. Creio que uma parte de templates de Kanbam também. Uma área com integração com o chat GPT para gerar descrições de cards personalizados de acordo o titulo. Devido a falta de tempo não consegui implementar essas funcionalidades, mas acredito que seriam um diferencial para a aplicação.

**Sobre você**

Queremos te conhecer um pouco melhor, conte um pouco sobre você.

Onde nasceu/De onde você é? Lugares que estudou, empresas que trabalhou, como você se envolveu com desenvolvimento de software.. enfim, Quem é você?

Bom, sou de Campina Grande - Paraíba, completarei 20 anos em maio e estudo Sistemas de Informação pela Estácio de Sá. Sobre locais no qual estudei, já passei por UEPB e IFPB mas nunca cheguei a concluir o ensino nessas faculdades. Atualmente busco um trabalho de período integral como Engenheiro de Software, já atuei como desenvolvedor por cerca de 3 anos, onde ja trabalhei com ReactJs, NodeJs, NestJs, Angular, Ionic, React Native, Prisma, MySQL, Mongo, AWS, Redis, Docker, Python, C#... e por ai vai. Minha maior área de atuação até agora foram por startups, onde ja atuei em empresas como BizCommerce, Cognum, iTechMed, Truck Help, LAB510, SinteseBI... Fora alguns freelancers que fiz.
Como dito, atualmente estou em busca de uma oportunidade de trabalho para me dedicar integralmente a uma empresa.

**Outros detalhes**

Se quiser enviar alguma informação adicional sobre o desafio..

---

Ah, deixe seu e-mail ou telefone para entrarmos em contato com você :)

email: fragosooliveira773@gmail.com
telefone: (83) 9 9830-4284
