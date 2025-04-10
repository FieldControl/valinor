## Envio de solução

Gostariamos de entender como você pensa e as decisões que você tomou durante o desenvolvimento, detalhe um pouco mais sobre:

Framework, linguagem e ferramentas
Para esse projeto de Kanban, utilizei um conjunto de ferramentas e bibliotecas modernas e bem estabelecidas no ecossistema web, tanto no front-end quanto no back-end. A ideia foi garantir escalabilidade, organização e uma boa experiência de desenvolvimento.
🔧 Back-end:
✅ NestJS
Usei o NestJS como framework principal no back-end. Ele me oferece uma estrutura sólida baseada em TypeScript, com suporte nativo a injeção de dependência, arquitetura modular e decorators — tudo isso favorecendo a escalabilidade e manutenibilidade da aplicação.

✅ UUID
Utilizei a biblioteca uuid para gerar identificadores únicos dos cards e colunas, garantindo integridade sem depender de banco de dados inicialmente.

✅ Node.js & npm
Toda a estrutura de execução e gerenciamento de pacotes foi feita com Node.js e npm. O Nest foi inicializado com @nestjs/cli, e os scripts de execução ficaram centralizados no package.json.

🎨 Front-end:
✅ Angular
Para o front, optei pelo Angular porque ele é robusto, possui arquitetura MVVM, data binding, roteamento poderoso, e é altamente modular. Usei o Angular CLI para gerar os componentes e serviços rapidamente com padrões recomendados.

✅ Tailwind CSS
Tailwind foi a minha escolha para estilização. Ele me permite trabalhar com classes utilitárias que aceleram muito o desenvolvimento de layouts responsivos e customizados, mantendo o CSS enxuto e sem conflitos.

✅ Angular Drag & Drop (CDK)
Para a funcionalidade de mover cards entre colunas, utilizei o módulo DragDropModule da Angular CDK. Ele é confiável, leve e funciona muito bem com a estrutura reativa do Angular.

📦 Extras e Ambiente:
VS Code como editor principal, com extensões como Angular Essentials, Tailwind IntelliSense e ESLint.

Git para controle de versão e organização do código, com commits frequentes e mensagens claras.

Postman para testar as rotas da API do back-end.

Insomnia (opcional) também é ótimo para testar endpoints REST em paralelo com Postman.

npm scripts padronizados para start, build, test, etc.

**Técnologias X e Y**
🎨 Por que escolhi Angular (e não React ou Vue):
1. Arquitetura robusta e pronta para escalar:
Angular já vem com uma arquitetura opinionada e completa, o que me permite organizar melhor o projeto desde o início. Ele fornece ferramentas como roteamento, serviços, dependency injection e CLI poderosos — tudo sem precisar buscar bibliotecas de terceiros como eu teria que fazer no React, por exemplo.

2. TypeScript nativo:
Como gosto muito de trabalhar com TypeScript, o Angular já nasce com suporte total, o que garante mais segurança no código, autocompletar inteligente, tipagem forte e mais facilidade para refatorar e escalar a aplicação.

3. Angular Material / CDK:
Usei a CDK para implementar funcionalidades como Drag and Drop com facilidade. Isso me economizou muito tempo e ainda manteve a performance e a experiência do usuário de forma consistente.

4. Suporte a projetos corporativos:
Angular é muito utilizado em projetos de grande porte e empresas que exigem estrutura forte, testes e padronização. Como o desafio também tem um foco em boas práticas, achei que Angular se encaixava perfeitamente.

🚀 Por que escolhi NestJS (e não Express, Fastify ou AdonisJS):
1. Arquitetura escalável baseada em módulos:
NestJS me dá uma estrutura modular muito parecida com o que encontramos em back-ends de nível corporativo. Isso facilita a organização por domínio, isolamento de responsabilidades e reuso de lógica.

2. Totalmente construído em TypeScript:
A integração nativa com TypeScript ajuda muito a manter a consistência do projeto entre front-end e back-end — principalmente quando usamos contratos e DTOs compartilhados.

3. Facilidade para testes:
NestJS facilita a criação de testes unitários e de integração, com suporte direto ao Jest e boas práticas já embutidas. Isso me ajudou a manter a qualidade do código com segurança.

4. Suporte futuro e comunidade ativa:
NestJS está crescendo muito e tem uma comunidade forte, o que me dá segurança em termos de manutenção e suporte a longo prazo.

**Princípios de software**

🧱 1. Separação de Responsabilidades (SoC - Separation of Concerns)
"Cada módulo, serviço, componente ou controller teve sua responsabilidade bem definida.
No front-end, por exemplo, os componentes só cuidam da interface e da interação do usuário, enquanto os serviços se encarregam de se comunicar com a API.
No back-end com NestJS, utilizei controllers para receber as requisições HTTP, services para a lógica de negócio, e DTOs para a transferência de dados com validação."

🧠 2. Princípios SOLID
"Apliquei os princípios SOLID sempre que possível, especialmente os três mais aplicáveis nesse tipo de projeto:"

S – Single Responsibility Principle:
"Cada classe ou função tinha uma única responsabilidade. Por exemplo, no service de cards, eu centralizei toda a lógica de criação, atualização e remoção de cards — sem misturar com regras de colunas."

O – Open/Closed Principle:
"Deixei a estrutura preparada para ser estendida sem alterar o código original. Por exemplo, se eu quiser no futuro adicionar filtros nos cards ou labels, posso fazer isso adicionando novos métodos ao invés de modificar os existentes."

D – Dependency Inversion Principle:
"Utilizei injeção de dependência tanto no NestJS quanto no Angular. Isso me permitiu criar código mais testável e desacoplado."

🧪 3. DRY (Don’t Repeat Yourself)
"Evitei duplicação de código extraindo lógicas repetidas em funções reutilizáveis ou services, como por exemplo as funções de validação e formatação. Isso aumentou a legibilidade e facilitou a manutenção."

**Desafios e problemas**
⚠️ 1. Conflitos de dependência ao configurar o Angular + Tailwind
Problema:
Ao tentar instalar o Tailwind CSS no projeto Angular, enfrentei erros de dependência entre versões do zone.js e @angular/core. O npm bloqueava a instalação e mostrava o erro ERESOLVE unable to resolve dependency tree.

Como resolvi:
Após analisar o log de erro com calma, percebi que o problema era uma versão incompatível do zone.js.
Resolvi utilizando o seguinte comando:
npm install --legacy-peer-deps
Esse comando ignora conflitos de dependência e permite instalar os pacotes. Após isso, conferi no package.json se não havia nenhuma dependência obsoleta. Com isso, Tailwind funcionou perfeitamente no Angular.

🌀 2. Erro ao usar npm e npx no PowerShell
Problema:
Meu terminal exibia mensagens como:
npx : não é possível carregar scripts neste sistema
Isso acontecia porque o PowerShell estava com a política de execução de scripts desativada por padrão.

Como resolvi:
Alterei a política de execução com o comando:
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

Após confirmar, consegui executar comandos como npx tailwindcss init normalmente.

💻 3. Estruturação inicial do projeto (Organização do Kanban)
Problema:
No início, foi desafiador decidir como representar a relação entre colunas e cards, tanto no back-end quanto no front-end. Eu precisava de um modelo que fosse simples, mas flexível o suficiente para permitir drag-and-drop e ordenação.

Como resolvi:
No NestJS, defini entidades com relacionamento 1:N (uma coluna pode ter vários cards).
Já no Angular, organizei os dados em um array de colunas, cada uma contendo um array de cards. Com isso, o DOM já refletia exatamente a estrutura que eu precisava, o que facilitou a renderização e manipulação no front-end.

🔄 4. Implementar Drag-and-Drop de forma fluida
Problema:
O comportamento de arrastar cards entre colunas nem sempre atualizava corretamente o estado da aplicação.

Como resolvi:
Usei a biblioteca @angular/cdk/drag-drop, que oferece eventos como drop(). Dentro desse método, tratei o reordenamento dos arrays manualmente e atualizei o backend quando necessário. Isso garantiu consistência entre a UI e o banco de dados.

🧪 5. Criação de testes automatizados
Problema:
Nem todas as partes da aplicação estavam fáceis de testar no início, principalmente métodos com lógica de negócios embutida nos componentes.

Como resolvi:
Refatorei os métodos, extraindo a lógica para serviços reutilizáveis. Isso aumentou a testabilidade. Em seguida, usei o Jest no NestJS e o Karma no Angular para escrever os testes unitários básicos (como criação de coluna, adição e remoção de cards, etc).

⚡ 6. Performance e atualização de estado
Problema:
Às vezes, após mover um card, o front-end não atualizava a posição corretamente.

Como resolvi:
Usei trackBy nos *ngFor para garantir que o Angular identificasse corretamente os itens do array. Também me certifiquei de atualizar o estado local com base na resposta da API (evitando inconsistência visual).


**Melhorias e próximas implementações**

✅ 1. Persistência em Tempo Real (WebSockets ou SignalR)
O que pode ser melhorado:
Atualmente, o sistema funciona com chamadas HTTP tradicionais. Ou seja, a cada movimentação de card ou criação de coluna, o front-end faz uma requisição para atualizar os dados. Isso funciona bem, mas em um ambiente colaborativo, onde múltiplos usuários estão usando o Kanban ao mesmo tempo, esse modelo não escala de forma fluida.

Como eu melhoraria:
Implementaria WebSockets usando o módulo @nestjs/websockets no back-end e o Socket.IO no front.
Dessa forma, sempre que um usuário mover um card ou criar uma coluna, todos os outros usuários conectados veriam a atualização em tempo real, sem precisar atualizar a página.

💄 2. Melhorias na UI/UX com microinterações
O que pode ser melhorado:
A interface, apesar de funcional, ainda pode ser mais intuitiva e amigável. Falta feedback visual para ações como "card movido com sucesso", "erro ao salvar", ou animações de carregamento ao adicionar itens.

Como eu melhoraria:
Usaria componentes de feedback visual, como toasts, spinners, snackbars e transições com o @angular/animations ou com Tailwind CSS (transition, ease-in-out, etc.). Isso deixaria a experiência muito mais fluida e profissional.

**Sobre você**
Meu nome é Lucas Delamura, tenho 19 anos e sou um apaixonado por tecnoliga e esportes! Corintiano roxo e nativo de São José do Rio Preto, cresci estudadno no Colégio Santo André, até o oitavo ano, quando fui convidado pelo São Paulo Futebol Clube para ser jogador da equipe de basquete deles, aceitei o convite e o desafio de morar na capital longe dos meus pais e com um apenas um sonho. Durante esse período cresci muito mentalmente e aprendi infinitas coisas que jamais podia ter aprendido sem essa experiência, estude no Colégio Amorim com 100% de bolsa por conta do esporte. Na pandemia retornei para Rio Preto e desenvolvi minha paixão por computador, durante o período da pandemia passava hporas e horas no computador jogando e estudando programação e desenvolvimento. Me formei no Colégio Coeso e fui aprovado na Fatec para o curso de Análise e Desenvolvimento de Sistemas, onde reforço diariamente minha paixão pela tecnologia e a certeza de ter feito a escolha certa. Todas as minhas conquistas são frutos de quem eu sou, um garoto esforçado, sonhador, alegre e sempre otimista! Sem minhas características de trabalho em equipe e foco no meu desenvolvimento pessoal não teria feito tudo que fiz! Em resumo esse sou eu, um garoto focado lutando pelos seus objetivos!

**Outros detalhes**

Foi um projeto extrememante desafiador e devido a dificuldade com o back end e a falta de tempo por conta do meu trabalho atual e a faculdade não consegui finalizar por completo, por isso a falta do vídeo. Porém posso encaminhar uma pasta zip por email com os códigos que ja estão 90% finalizados.


