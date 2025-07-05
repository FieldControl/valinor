## Envio de solução

# Kanban Board - Desafio Técnico

**Framework, linguagem e ferramentas**
Tecnologias utilizadas:

*Frontend:*
- Angular
- TypeScript
- HTML
- CSS
- Font Awesome

*Backend:*
- NestJS
- TypeScript
- Firebase (Firestore)

Utilizei ferramentas e bibliotecas como o Angular CLI, Node.js, Firebase Admin SDK.

**Técnologias X e Y**
A escolha do Firestore como banco de dados se deu pela familiaridade que já possuo com a ferramenta, por já tê-la utilizado em projetos anteriores. Isso me permitiu ganhar tempo no desenvolvimento e lidar melhor com os problemas que surgiram, em vez de partir para bancos de dados que exigiriam curva de aprendizado maior no momento.

**Princípios de software**

Durante o desenvolvimento, apliquei os seguintes princípios:

    Modularidade: O projeto é dividido em componentes (Angular) e módulos (NestJS), facilitando a manutenção e escalabilidade.
    Separation of Concerns: Angular cuida da interface do usuário, enquanto o NestJS lida com a lógica de negócios e persistência de dados.
    Reutilização de código: Componentes como Card e Column foram criados de forma reaproveitável com diretivas como *ngFor. Além disso, os DTOs são reutilizados entre controladores e serviços no backend.

**Desafios e problemas**

Esse foi um projeto desafiador, pois foi a primeira vez que trabalhei com dois frameworks simultaneamente, cada um cuidando de partes essenciais do sistema.

Um dos maiores desafios foi conectar o NestJS ao Firebase (Firestore). Enfrentei diversas falhas de autenticação e formatação do arquivo de credenciais JSON, mas após bastante pesquisa e testes consegui resolver e estabelecer a conexão.

Outro ponto foi estruturar a hierarquia de componentes no Angular. Foi necessário planejar bem a relação entre o componente pai (Kanban) e os filhos (Column e Card), garantindo que cada coluna exibisse apenas os cards correspondentes ao seu ID.

**Melhorias e próximas implementações**

Devido ao período final do semestre na faculdade, precisei conciliar estudos e outros trabalhos, o que acabou impactando no tempo disponível para implementar tudo o que gostaria. Algumas melhorias planejadas:

Implementar funcionalidade de mover os cards entre colunas com drag-and-drop.

Adicionar checkbox ou status para marcar tarefas como concluídas.

Melhorar a cobertura de testes unitários e integrados, tanto no frontend quanto no backend.

**Vídeo de apresentação**

https://jam.dev/c/a59675db-6a73-4b10-b81e-fa0a505ffba3

**Sobre você**

Me chamo Gustavo, sou de Bady Bassitt.
Sou formado em Desenvolvimento de Sistemas (2022) e atualmente estou no quinto semestre da faculdade.
Tenho focado meus estudos e projetos pessoais em JavaScript e seu ecossistema (TypeScript, Node, Angular, etc).
Gosto de programar, criar interfaces funcionais e entender como o backend conversa com o frontend. Busco sempre aprender mais e construir soluções práticas.

**Outros detalhes**
Por motivo de tempo e complexidade na configuração de dependências externas (como Firebase), os testes unitários ainda não foram finalizados.
A estrutura do projeto foi pensada para suportar testes, e os métodos já possuem potencial para testes com mocks adequados.
O foco principal foi garantir o funcionamento completo do sistema (frontend + backend), priorizando a entrega da aplicação funcional.


## Como executar o projeto

# Frontend
cd frontend-kanban
npm install
ng serve

# Backend
cd backend-kanban
npm install
nest start

Alem disso, o projeto foi feito utilizando o firebase, para poder acessar criei um repositorio para teste, na pasta /backend/ você deverá criar um arquivo .env, com o JSON correto, se caso for feito testes me envie um email solicitando a chave, ou crie seu próprio banco no firebase.

**Contato**
Email: henriqueminghetti@gmail.com
Telefone: (17) 99100-8077
