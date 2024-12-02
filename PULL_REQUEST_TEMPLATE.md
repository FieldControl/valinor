## Envio de solução
Gostariamos de entender como você pensa e as decisões que você tomou durante o desenvolvimento, detalhe um pouco mais sobre:

O projeto foi estruturado com base em duas tabelas principais: uma destinada às colunas e outra para as tarefas, sendo que a tabela de tarefas contém um campo de referência para o ID da coluna correspondente. Inicialmente, foi desenvolvido um CRUD básico na API para suportar a implementação do front-end. Durante o avanço do desenvolvimento do front, ajustes necessários foram realizados na API para alinhar às regras de negócio definidas. Após a conclusão do desenvolvimento, foi elaborado o arquivo README para documentar o projeto.

**Framework, linguagem e ferramentas**
Descreva ferramentas e bibliotecas (libraries, framework, tools etc) você usou.

Utilizei Angular 19 e NestJS, seguindo as especificações do desafio. Na API, implementei GraphQL com Prisma ORM. Para o front-end, utilizei PrimeNG, Apollo Client e Angular CDK. Escolhi o SQLite como banco de dados para este projeto.

**Técnologias X e Y**
Justifique porque você optou pela tecnologia X e não a Y?

Optei por utilizar GraphQL em vez de RESTful para oferecer um diferencial ao projeto, aproveitando minha experiência diária com essa tecnologia. O Prisma ORM foi escolhido por sua simplicidade de configuração e uso, sendo ideal para projetos menores que não demandam a robustez do TypeORM. Para o banco de dados, utilizei o SQLite devido à sua praticidade, já que não requer instalação, apenas configuração.

No front-end, escolhi o PrimeNG pelos componentes intuitivos, fáceis de implementar e estilizar, além de contar com uma biblioteca própria de ícones. Para a comunicação com a API GraphQL, utilizei o Apollo Client. Por fim, para implementar a funcionalidade de Drag and Drop, optei pelo Angular CDK, uma solução nativa e bem integrada ao Angular.

**Princípios de software**
Quais princípios da engenharia de software que você usou?

Adotei os princípios de Clean Code para garantir um código claro e de fácil manutenção, promovendo legibilidade e simplicidade. Além disso, apliquei o padrão SOLID para estruturar o projeto, separando responsabilidades de forma eficiente em cada componente, o que facilita futuras alterações e expansões, tornando o sistema mais escalável.

**Desafios e problemas**
Conte um pouco sobre os desafios e problemas que você enfrentou e como você resolveu.

No início, enfrentei algumas dificuldades para desenvolver o front-end, já que tenho bastante experiência em React.js, mas nunca havia trabalhado em um projeto com Angular. Para estruturar o projeto, consultei a documentação oficial do Angular e, para entender melhor sua funcionalidade, contei com o apoio de amigos desenvolvedores experientes, que também contribuíram com sugestões de melhorias na estrutura elaborada para o projeto.

**Melhorias e próximas implementações**
O que você entende que pode ser melhorado e como isso pode ser feito?

Testes Unitários: Desenvolver a cobertura de testes para garantir a qualidade e a confiabilidade do código, uma tarefa que não foi possível concluir devido ao tempo.
Validações de Duplicidade: Adicionar validações para evitar a criação de colunas e tarefas duplicadas, assegurando a integridade dos dados.
Drag and Drop entre Colunas: Implementar a funcionalidade de arrastar e soltar tarefas de uma coluna para outra, tornando a interação mais dinâmica e intuitiva.
Identificação por Cores: Aplicar cores para identificar as tarefas de acordo com a coluna em que estão. Por exemplo, tarefas na Coluna A serão verdes e na Coluna B, amarelas, facilitando a visualização e organização.

**Vídeo de apresentação**

Grave um vídeo do seu projeto rodando e envie o link:
https://drive.google.com/file/d/1varNrRa1GNW7Bz-8l6l82WfriFpV6Ts4/view?usp=sharing

**Sobre você**

Queremos te conhecer um pouco melhor, conte um pouco sobre você.

Onde nasceu/De onde você é? Lugares que estudou, empresas que trabalhou, como você se envolveu com desenvolvimento de software.. enfim, Quem é você?

Meu nome é Weuller Camargo da Silva, nasci em Cassilândia - MS e atualmente resido em Santa Fé do Sul - SP. Realizei quase todo o ensino fundamental e médio em Cassilândia, concluindo apenas o último ano em Santa Fé do Sul. Possuo formação técnica em Administração pela ETEC e sempre tive uma afinidade natural com tecnologia, especialmente em compreender como sites, aplicativos e sistemas são desenvolvidos.

Me ingressei na faculdade UniFUNEC em Santa Fé do Sul no curso de Análise e Desenvolvimento de Sistemas (ADS) em 2018, formando-me em 2021. A colação de grau, inicialmente prevista para 2020, foi adiada devido à pandemia. Sou uma pessoa curiosa e determinada, valorizando um progresso constante e estruturado, sempre subindo um degrau de cada vez.

Atualmente, trabalho como desenvolvedor na Go4Digital, empresa que oferece dois produtos principais como serviço. O Manfrota, uma solução completa para gestão de frotas, abrangendo controle de combustível, pneus, estoque de peças, manutenção (ordens de serviço), horas trabalhadas de funcionários e equipamentos, entre outras funcionalidades. E o Go4Tracker, um sistema de geolocalização que monitora equipamentos como caminhões, carros, lanchas, jetskis, máquinas de linha amarela, entre outros.

**Outros detalhes**

Se quiser enviar alguma informação adicional sobre o desafio..


---

Ah, deixe seu e-mail ou telefone para entrarmos em contato com você :) 

Email: weuller.silva2508@gmail.com
Telefone: 17 996683718 - Ligações e WhatsApp



