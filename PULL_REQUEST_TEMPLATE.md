## Envio de solução

Gostariamos de entender como você pensa e as decisões que você tomou durante o desenvolvimento, detalhe um pouco mais sobre:
Para iniciar o projeto, busquei me aprofundar em NestJS e GraphQL, já que ainda não havia trabalhado diretamente com essa combinação. Estudei o assunto por meio de vídeos e criei alguns CRUDs simples para praticar, além de contar com o apoio de ferramentas de IA para tirar dúvidas e anotar pontos importantes. Como essas tecnologias eram exigidas no desafio, aproveitei a oportunidade para aprender mais sobre a criação de APIs GraphQL com NestJS, incluindo conceitos como resolvers, DTOs, schemas e a integração com banco de dados utilizando o TypeORM.

Após entender melhor a stack exigida, avaliei qual banco de dados seria mais adequado para a proposta. Optei pelo SQLite por ser leve, de fácil configuração e ideal para projetos locais ou de teste, o que me permitiu desenvolver com mais agilidade e validar as funcionalidades sem depender de um servidor de banco de dados.

Com a base definida, iniciei o desenvolvimento do backend, estruturando a aplicação com as entidades Board, Column e Card, bem como suas respectivas relações. Organizei o projeto em módulos, seguindo a arquitetura do NestJS, para garantir um código limpo e escalável.

Finalizado o backend, avancei para o frontend, utilizando Angular com Apollo Client para consumir a API GraphQL. Busquei desenvolver uma interface simples, funcional e com suporte a drag and drop, incluindo feedback visual para ações do usuário. Estruturei os componentes de forma modular e utilizei o Angular Material para agilizar a construção da interface e manter a consistência visual.

Ao longo do projeto, todas as decisões foram tomadas com foco na clareza do código, organização da estrutura e facilidade de execução local, já que o sistema seria avaliado por outras pessoas.

**Framework, linguagem e ferramentas**

Descreva ferramentas e bibliotecas (libraries, framework, tools etc) você usou.

BACKEND

NestJS
É um framework que ajuda a organizar o código do backend em partes reutilizáveis. Ele roda com o Node.js e é ótimo para criar APIs bem estruturadas.

GraphQL (Apollo Server)
É uma forma moderna de criar APIs. Diferente do tradicional REST, o GraphQL permite que o frontend peça exatamente os dados que precisa. O Apollo Server é a ferramenta que implementa o GraphQL no backend.

TypeORM
É uma biblioteca que conecta o código com o banco de dados. Com ela, dá pra salvar, buscar e alterar informações no banco usando JavaScript/TypeScript, sem precisar escrever SQL puro o tempo todo.

SQLite
É um banco de dados leve e fácil de usar, ideal para projetos menores ou testes. Ele salva os dados em um arquivo local, sem precisar de um servidor separado.

FRONTEND

Angular
É um framework usado para construir o que o usuário vê e interage na tela. Ele facilita a criação de interfaces modernas e reativas, com boa organização de código.

Angular Material
É uma coleção de componentes visuais (como botões, tabelas, formulários) prontos para usar no Angular. Isso ajuda a criar uma interface bonita, consistente e responsiva.

Apollo Client
É o "par" do Apollo Server no frontend. Ele cuida de buscar e enviar dados da API GraphQL para o Angular, de forma eficiente e fácil.

**Técnologias X e Y**

Justifique porque você optou pela tecnologia X e não a Y?

Optei por utilizar o SQLite em vez de outras opções como MySQL, PostgreSQL ou outros bancos de dados, principalmente por sua facilidade de uso e configuração. O SQLite é um banco leve e local, que não exige a instalação de um servidor separado, o que torna o processo de desenvolvimento e testes muito mais prático e rápido.

Como o foco do projeto era demonstrar as funcionalidades do sistema de forma simples e funcional, o SQLite se mostrou a escolha ideal, já que atende bem projetos menores ou protótipos e permite que o sistema seja facilmente portável para diferentes máquinas sem complicações.

**Princípios de software**

Quais princípios da engenharia de software que você usou?

Separação de responsabilidades:
O projeto foi desenvolvido com uma separação clara entre backend e frontend, onde cada camada tem sua função bem definida, o que melhora a organização e facilita a manutenção.

Modularidade:
Tanto no NestJS quanto no Angular, foi aplicado o conceito de módulos para organizar as funcionalidades. Isso permite dividir o sistema em partes menores, independentes e reutilizáveis.

Princípio da Responsabilidade Única (Single Responsibility Principle - SRP):
Cada serviço, componente e entidade possui uma única responsabilidade, o que torna o sistema mais coeso.

Manutenibilidade:
O projeto foi estruturado com foco em legibilidade e organização, o que torna futuras alterações, correções ou expansões mais simples de serem realizadas.

Desacoplamento:
A comunicação entre o frontend e o backend é feita por meio da API GraphQL, o que garante uma integração eficiente e flexível, sem que uma camada dependa diretamente da outra.

**Desafios e problemas**

Conte um pouco sobre os desafios e problemas que você enfrentou e como você resolveu.

Durante o desenvolvimento do projeto, enfrentei alguns desafios importantes. O primeiro deles foi que eu nunca havia trabalhado com NestJS nem com GraphQL, então precisei estudar a fundo essas tecnologias para entender como estruturar o backend da melhor forma possível.

Outro ponto foi a implementação do painel Kanban, que também era algo novo para mim. Estudei exemplos e explorei como representar visualmente as tarefas e colunas de forma interativa e funcional.

Além disso, enfrentei um problema específico relacionado à atualização das colunas ao mover ou excluir tarefas. Em alguns momentos, as colunas não refletiam as mudanças corretamente. Para resolver isso, precisei analisar cuidadosamente o fluxo do código, entender onde a lógica estava falhando e, com o apoio de ferramentas como IA, consegui encontrar e aplicar uma solução eficiente para garantir que o estado do Kanban se mantivesse sempre sincronizado.

**Melhorias e próximas implementações**

O que você entende que pode ser melhorado e como isso pode ser feito?

Acredito que a atualização das colunas do Kanban ainda pode ser otimizada, garantindo uma sincronização mais precisa e em tempo real, especialmente em ações como movimentações rápidas ou exclusões consecutivas de tarefas.

Além disso, poderia adicionar o recurso de colaboradores, permitindo que cada atividade seja atribuída a um usuário específico. Com isso, seria possível:

Definir responsáveis por cada tarefa.

Adicionar tipos ou categorias nas atividades para melhor organização.

Implementar controle de tempo, registrando quanto tempo cada colaborador passou em uma tarefa.

Gerar uma previsão de conclusão com base no tempo estimado e no progresso de cada tarefa.

**Vídeo de apresentação**

Grave um vídeo do seu projeto rodando e envie o link:
<!-- Dica: você pode usar o https://jam.dev/ para facilitar sua gravação ;) -->

https://youtu.be/7l7pkl4vKRI

**Sobre você**

Queremos te conhecer um pouco melhor, conte um pouco sobre você.

Onde nasceu/De onde você é? Lugares que estudou, empresas que trabalhou, como você se envolveu com desenvolvimento de software.. enfim, Quem é você?

Meu nome é Gustavo Ancete, nasci em São José do Rio Preto e atualmente moro em Bálsamo – SP.

Cursei o ensino fundamental na Coopem, em Mirassol, e o ensino médio no CET, em Tanabi. Atualmente, estou no 6º semestre do curso de Sistemas de Informação no Instituto Federal de Votuporanga (IFSP).

Ao longo da graduação, participei de projetos de extensão, onde tive a oportunidade de ministrar aulas de informática básica para crianças e também de desenvolvimento web (HTML, CSS e JavaScript) para adolescentes, promovendo o primeiro contato deles com a tecnologia.

Profissionalmente, atuei na Martinez & Carvalho, uma filial da Fiorilli, prestando suporte técnico ao sistema de contabilidade SCPI. Minhas responsabilidades incluíam atendimento ao cliente, resolução de erros no sistema, realização de consultas SQL e suporte geral ao funcionamento do software.

Mais recentemente, estagiei na NKN Digital, uma software house, onde atuei como desenvolvedor fullstack em PHP. Nessa experiência, trabalhei desde a criação do banco de dados, passando pelo desenvolvimento do backend e frontend, até a melhoria do sistema interno de ordens de serviço (OS) da empresa. Também fui responsável pelo desenvolvimento de novas telas, incluindo interfaces personalizadas conforme a necessidade dos clientes.

**Outros detalhes**

Se quiser enviar alguma informação adicional sobre o desafio..

Gostei muito de participar deste desafio, pois ele me incentivou a estudar e aplicar tecnologias que eu ainda não havia explorado, como NestJS e GraphQL. Isso despertou ainda mais o meu interesse em aprender e me aprofundar nessas ferramentas.

Agradeço pela oportunidade de mostrar meu trabalho e aprender durante o processo. Foi uma experiência incrivel!

---

Ah, deixe seu e-mail ou telefone para entrarmos em contato com você :) 

email: gustavoaancete@gmail.com

telefone: 17 99674-4970



