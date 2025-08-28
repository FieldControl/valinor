## Kanban - Desafio Field Control ##

---

## Como rodar o projeto ##

Para rodar o projeto, siga os passos abaixo:
1. Clonando o repositório
git clone <URL-DO-REPOSITÓRIO>
cd <Pasta-do-repositório>

2. Instalar as dependências
No diretório backend e frontend, instale as dependências:

Backend (NestJS):
`cd backend`
`npm install`

Frontend (Angular):
`cd frontend`
`npm install`

3. Rodar o Backend (NestJS)

No diretório backend, execute o servidor NestJS:
`npm run start:dev`
Isso vai iniciar o servidor em http://localhost:3000/graphql.

4. Rodar o Frontend (Angular)

No diretório frontend, inicie a aplicação Angular:
`ng serve`
Isso vai rodar a aplicação em http://localhost:4200.

---

## Ferramentas e Bibliotecas Usadas ##

**Typescript**
Motivo da escolha: Essa linguagem foi utilizada tanto no backend quanto no frontend. É uma linguagem baseada em JavaScript, com tipagem estática, o que contribui para uma maior segurança e confiabilidade no desenvolvimento.

**Frontend: Angular**
Motivo da Escolha: O Angular foi escolhido por sua arquitetura robusta, tipagem forte via TypeScript e suporte à componentização. Ele também possui uma grande comunidade e 
recursos para trabalhar com SPA (Single Page Application) de forma eficiente.
**Tecnologias Relacionadas:
Apollo Client: Para comunicação com o backend GraphQL de maneira fluida e tipada.
Angular CDK (Component Dev Kit): Usado para implementar drag-and-drop de cards entre as 
colunas sem precisar de bibliotecas pesadas, respeitando o design com CSS customizado.
**CSS Puro
Motivo da Escolha: Optei pelo CSS puro por permite maior liberdade e evita dependências externas, o que é ideal para este projeto simples.

**Backend: NestJS**
Motivo da Escolha: O NestJS foi escolhido por ser baseado em TypeScript, tendo uma estrutura modular e escalável. Ele também se integra muito bem com GraphQL, o que é crucial para a nossa comunicação eficiente entre frontend e backend.
Tecnologias Relacionadas:
**Apollo Server: Usado para expor uma API GraphQL no NestJS.
**GraphQL: Permite requisições flexíveis e eficientes, retornando apenas os dados necessários.

**GraphQL (Frontend e Backend)**
Motivo da Escolha: O GraphQL foi escolhido por ser altamente flexível, permitindo que o frontend faça consultas específicas e recupere exatamente os dados necessários. Além disso, facilita a integração frontend-backend com uma abordagem declarativa.


---

## Por que a tecnologia X e não a Y? ##

Angular: Angular por conta de sua estrutura mais robusta, tipagem forte com TypeScript e integração natural com ferramentas como o Angular CDK e Apollo. O Angular também oferece um sistema de roteamento e gestão de estado mais completos e escaláveis para aplicações grandes. Além disso, ele facilita a manutenção a longo prazo, o que é importante para empresas que possuem equipes grandes.

NestJS: O NestJS foi escolhido por ser mais modular, baseado em TypeScript, e fornecer um conjunto mais estruturado de ferramentas. O NestJS facilita a escalabilidade e manutenção, e sua integração com GraphQL é simples e poderosa.

GraphQL: O GraphQL foi escolhido para permitir uma comunicação eficiente entre o frontend e o backend, permitindo que o cliente faça requisições precisas, pedindo apenas os dados necessários para a interface. 

---

## Quais princípios da engenharia de software que você usou? ##

Separation of Concerns (SoC):
As responsabilidades foram separadas entre serviços de backend, componentes de frontend e GraphQL resolvers para garantir que cada parte fosse responsável por um aspecto específico do sistema.

Componentização:
O frontend foi construído com uma arquitetura baseada em componentes reutilizáveis, facilitando o desenvolvimento e a manutenção a longo prazo.

Single Responsibility Principle (SRP):
Cada classe e método foi projetado para ter uma única responsabilidade. Por exemplo, o CardService só manipula cards, e o ColumnService lida com colunas. Essa abordagem facilita a manutenção e a extensão do código.

Clean Code:
O código segue boas práticas de legibilidade, com nomes semânticos para funções e variáveis, organização modular. Isso facilita a leitura, manutenção e colaboração no projeto.

---

## Desafios e problemas que você enfrentou e como você resolveu ##

**Problema: Um dos maiores desafios do projeto foi a utilização do NestJS e Angualr, pois nunca tinha trabalhado com essas frameworks antes. Como ele é baseado em TypeScript e utiliza conceitos como injeção de dependência e arquitetura modular, tive que me adaptar a uma nova forma de estruturar a aplicação.
Solução: Para superar esse desafio, fiz uma imersão nos conceitos básicos do NestJS e Angular e explorei sua documentação oficial.

**Desafio: Comunicação entre Colunas e Cards
Solução: Centralizei a lógica de manipulação de cards no CardService e deleguei a gestão das colunas para o ColumnService. Isso garantiu que o estado de todas as colunas e cards fosse sincronizado e consistente.

**Desafio: Drag and drop
Implementação da Lógica de Reordenação (Drag and Drop): Desenvolver a funcionalidade de arrastar e soltar para reordenar os cards e as colunas, garantindo que a nova ordem seja salva. Isso exige um planejamento cuidadoso para evitar inconsistências nos dados. Por isso utlizer a ferramente do Angualar CDK para facilitar o processo.

---

## O que pode ser melhorado ##

**Adicionar Funcionalidade para Criar Colunas Dinamicamente:
Atualmente, as colunas são definidas de forma estática no código. Para melhorar isso, podemos permitir que o usuário crie novas colunas dinamicamente. Isso pode ser feito criando um botão de "Adicionar Coluna", que ao ser clicado, abriria um campo de input para o nome da nova coluna. Após a inserção, a coluna seria adicionada ao KanbanService, permitindo a criação e exibição de novas colunas no frontend sem a necessidade de alterar o código.

**Melhoria no Feedback Visual:
Podemos melhorar o feedback visual ao mover cards, criando animações mais fluídas e indicando o estado de carregamento da interface de usuário, especialmente quando o backend está processando as mudanças.
Refatoração de Código:

**O código está funcional, mas poderia ser mais modular e organizado em termos de reutilização de funções e componentes. Podemos melhorar a aplicação de DRY (Don’t Repeat Yourself), criando funções auxiliares para operações repetitivas.

**Melhoria no Sistema de CRUD:
Embora o sistema de CRUD esteja funcionando, podemos aprimorar a experiência do usuário com feedback visual mais dinâmico, como mensagens de sucesso/erro e atualizações automáticas na interface.

---

## Vídeo de Apresentação ##

**Vídeo de apresentação do projeto:**

https://jam.dev/c/d5c4b5a8-d7f3-4bb9-90cd-5cc5416c1afe

---

## minha visão sobre o projeto ##

Embora o projeto esteja concluído, foi meu primeiro desafio de programação, portanto tive muita dificuldade em finalizá-lo. Mesmo já tendo estudado JavaScript, precisei estudar e entender os conceitos do TypeScript, Angular, Nest e GraphQL, pois nunca tinha utilizado essas linguagens e ferramentas antes. Então, foi algo totalmente desafiador. Tive que buscar ajuda no YouTube para assistir a vídeos sobre como utilizar determinadas funcionalidades, procurar em sites para entender como certas linhas de código funcionam, e também buscar auxílio nas inteligências artificiais para poder entender melhor os erros que estavam aparecendo. Apesar de todo o esforço, agradeço desde já pela oportunidade da Field de me tirar da minha zona de conforto e me fazer estudar outras ferramentas e linguagens, além de me mostrar como é lidar com projetos que precisam ser feitos em um curto período de tempo. Mas, acima de tudo, agradeço por me mostrarem o quanto o mundo da programação é vasto e o que pode ser feito com apenas algumas linhas de código. Agradeço à Field Control pela oportunidade de estudar e aprender algo novo.

## um pouco sobre mim ##

Desde pequeno, já me interessava por tecnologia. Sempre queria saber como as coisas funcionavam e como eram feitas. Lembro que meu primeiro contato com programação foi através de um anúncio no YouTube sobre um curso de JavaScript. Por ser muito novinho, lembro que o máximo que fiz foi criar um `console.log` e realizar algumas operações aritméticas. Hoje, após quase 10 anos desde aquele curso, estou muito surpreso e refletindo sobre o fato de que, mesmo sendo algo tão simples, aquele curso me trouxe até onde estou agora.

---

## Contato ##

Telefone: (17) 99724-6757
Email: lucasbp1302@gmail.com