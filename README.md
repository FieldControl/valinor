Esse é um projeto desenvolvido como desafio para uma vaga de Desenvolvedor na empresa Field Control pelo candidato Gabriel Naves

Perceba que o front ent se encontra com um erro (✘ [ERROR] NG8001: 'app-board' is not a known element:
1. If 'app-board' is an Angular component, then verify that it is included in the '@Component.imports' of this component.
2. If 'app-board' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@Component.schemas' of this component to suppress this message. [plugin angular-compiler])
não conseguido resolver pelo candidato. 


Kanban API

API desenvolvida com NestJS e Prisma para gerenciar colunas e cards em um sistema Kanban. A API permite criar e listar colunas e cards organizados dentro de colunas, sendo ideal para aplicações de organização de tarefas e fluxos.

Funcionalidades

•	Colunas: Criação e listagem de colunas.
•	Cards: Criação e listagem de cards vinculados a colunas.

A API está documentada utilizando o Swagger, o que permite visualizar e testar os endpoints diretamente.

Tecnologias Utilizadas

•	Node.js
•	NestJS: Framework usado para construir a API.
•	Prisma ORM: ORM utilizado para facilitar o acesso ao banco de dados.
•	Swagger: Documentação interativa da API.
•	Class-validator: Utilizado para validação de dados de entrada.

Optei por utilizar o NestJS em vez de frameworks como Express ou Koa, pois NestJS oferece uma estrutura baseada em módulos e uma arquitetura inspirada no Angular, que facilita a organização do código e o desenvolvimento de projetos escaláveis. NestJS também suporta TypeScript de forma nativa, permitindo uma maior segurança no desenvolvimento.

O Prisma foi escolhido como ORM em vez do TypeORM devido à sua abordagem baseada em esquemas, que facilita a manutenção e integração de novos recursos no banco de dados, além de ser altamente performático e bem integrado com TypeScript.

Princípios de Software

Para o desenvolvimento deste projeto, apliquei os seguintes princípios de engenharia de software:

SOLID: Os princípios SOLID foram aplicados para garantir que cada classe e serviço tivessem uma responsabilidade bem definida. O uso de módulos e injeção de dependência no NestJS ajuda a manter um código desacoplado e modular.
DRY (Don't Repeat Yourself): Reutilizamos a lógica de validação e persistência para evitar redundâncias, concentrando as funcionalidades principais dentro de serviços que podem ser chamados pelos controladores.

Melhorias e Próximas Implementações

Paginação e Filtros nos Endpoints: Adicionar suporte para paginação e filtros nos endpoints de listagem de colunas e cards para permitir uma busca mais otimizada, especialmente em situações de grandes volumes de dados.

Autenticação e Autorização: A implementação de um sistema de autenticação, como JWT, e permissões de usuário para que diferentes usuários possam interagir com o sistema com níveis de acesso distintos.

Logs e Monitoramento: Incluir logs detalhados para rastrear erros e um sistema de monitoramento (como o Prometheus ou Grafana) para observar o desempenho da aplicação em produção.

Implementação de Websockets: Uma futura implementação de Websockets permitiria a atualização em tempo real dos cards e colunas, oferecendo uma experiência mais dinâmica para os usuários.

Pré-requisitos

•	Node.js (versão 14 ou superior)
•	Banco de Dados: A aplicação espera um banco de dados suportado pelo Prisma, como PostgreSQL. Configure o banco no arquivo .env.
•	Prisma: Instale o Prisma globalmente se não tiver: npm install -g prisma

Instalação

1.	Clone o repositório:
Realizar o git clone a partir do repositório.

2.	Instale as dependências:
npm install
  
3.	Configure o banco de dados: Configure o arquivo .env com as informações do banco de dados. Exemplo de .env:
DATABASE_URL="postgresql://usuario:senha@localhost:5432/nome_do_banco"

4.	Execute as migrações do banco:	
npx prisma migrate dev

Iniciando o Projeto

1.	Ambiente de Desenvolvimento: Para iniciar o servidor em modo de desenvolvimento:
npm run start:dev

A API estará disponível em http://localhost:3000, ou na porta configurada no arquivo .env.

Documentação da API

A documentação Swagger estará disponível em:
http://localhost:3000/api

Endpoints Principais

Colunas
•	POST /columns: Cria uma nova coluna.
{
  "title": "Nova Coluna"
}

GET /columns: Retorna todas as colunas com seus respectivos cards.

Cards

  POST /cards: Cria um novo card em uma coluna específica.
{
  "title": "Novo Card",
  "content": "Descrição do card",
  "columnId": 1
}

GET /cards: Retorna todos os cards com suas respectivas colunas.

Estrutura do Projeto

•	/src: Código-fonte principal da aplicação.
o	/app.module.ts: Módulo principal que importa outros módulos.
o	/card e /column: Módulos responsáveis pelas funcionalidades de cards e colunas, respectivamente.
o	/prisma: Configurações do Prisma.

Kanban Frontend

Este é o frontend de uma aplicação Kanban desenvolvida em Angular para gerenciar colunas e cartões, como em um quadro Kanban tradicional.

Funcionalidades

•	Criar e visualizar colunas: Os usuários podem adicionar novas colunas ao quadro.
•	Criar e visualizar cartões: Cada coluna pode ter múltiplos cartões, representando tarefas ou itens de trabalho.
•	Organização visual do fluxo de trabalho: A estrutura de colunas e cartões facilita a organização de tarefas em diferentes fases.

Tecnologias utilizadas

•	Angular - Framework principal para desenvolvimento frontend.
•	NestJS - Para a API backend (o backend é documentado separadamente).
•	Prisma - ORM para acesso ao banco de dados.
•	SQLite - Banco de dados local.
•	HttpClientModule - Para integração e comunicação com a API.

Angular vs React: Optamos pelo Angular devido à sua arquitetura mais estruturada, que inclui padrões de diretivas e serviços para facilitar a divisão de responsabilidades. O Angular também já inclui o CLI e ferramentas robustas para criar e testar a aplicação, enquanto o React geralmente requer a adição de outras bibliotecas para obter funcionalidades similares.

Princípios de Software

DRY (Don't Repeat Yourself): Em várias partes do código, como nos componentes de Board, Column e Card, apliquei o princípio DRY, para evitar duplicação de lógica. Componentes foram criados para serem reutilizáveis e centralizaram a lógica de manipulação de tarefas e colunas.

Componentização e Separação de Responsabilidades: Dividi a aplicação em componentes específicos (Board, Column, Card), cada um com sua responsabilidade, facilitando a escalabilidade e a manutenção do código.

SOLID: Os princípios SOLID foram aplicados sempre que possível, principalmente o princípio de responsabilidade única (SRP) para garantir que cada componente e serviço tivesse uma única responsabilidade e pudesse ser modificado ou substituído sem afetar outros.

desafios e problemas

Durante o desenvolvimento do front end da aplicação Kanban, um dos principais desafios foi o uso do Angular. Como era minha primeira experiência com o framework, enfrentei dificuldades em compreender a estrutura dos módulos, a configuração de componentes e o uso correto de diretivas e serviços. Muitas vezes, o surgimento de bugs inesperados aumentou a complexidade do projeto, exigindo pesquisas e testes frequentes para identificar e corrigir os problemas.

Alguns erros específicos, como aqueles relacionados à importação de componentes e à comunicação entre módulos. Apesar de várias tentativas, alguns bugs persistiram e ficaram sem solução, o que ressalta a importância de aprimorar meus conhecimentos em Angular para futuros projetos.

Melhorias e Próximas Implementações

Autenticação e Autorização: Implementar um sistema de login para que cada usuário tenha seu próprio board e permissões específicas, adicionando segurança e personalização à aplicação.

Sistema de Notificações: Adicionar notificações para alertar o usuário sobre mudanças, como uma tarefa sendo movida ou excluída, melhorando a experiência de uso.


Pré-requisitos

Antes de iniciar, certifique-se de ter o seguinte instalado em seu ambiente de desenvolvimento:
•	Node.js - v14 ou superior
•	Angular CLI - Ferramenta de linha de comando do Angular

Como iniciar o projeto

1.	Clone o repositório:
Realizar o git clone a partir do repositório.

2.	Instale as dependências:
Execute o comando abaixo para instalar todas as dependências necessárias listadas no package.json:
npm install

3.	Inicie o servidor de desenvolvimento:
Inicie o projeto Angular usando o comando:
ng serve

Por padrão, o aplicativo estará disponível em http://localhost:4200.

Como usar a aplicação

1.	Abra o navegador e acesse http://localhost:4200.
2.	No painel inicial, você verá um quadro vazio.
3.	Clique em "Adicionar Coluna" para criar uma nova coluna.
4.	Em cada coluna, você pode adicionar cartões com detalhes específicos.

Estrutura do Projeto

O projeto está organizado da seguinte forma:

src/
├── app/
│   ├── board/           
│   ├── column/           
│   ├── card/             
│   ├── services/         
│   ├── models/           
│   ├── app.component.*   
│   └── app.module.ts     
└── 

link do video

https://youtu.be/iWYnCOZQzvA

Sobre você

Me chamo Gabriel de Souza Naves, sou natural de São José do Rio Preto, tenho 24 anos e estou atualmente no 4º período de Análise e Desenvolvimento de Sistemas (ADS) na Unilago, em São José do Rio Preto. Trabalho como desenvolvedor de software full-stack júnior há 8 meses, e nesse tempo tenho aprendido bastante no dia a dia, aprimorando minhas habilidades e me desenvolvendo cada vez mais na área.

Um dos motivos que me levaram a entrar na área de tecnologia foi a minha familiaridade com computadores desde criança. Sempre fui atraído por jogos eletrônicos e tudo que envolvia tecnologia, o que aumentava meu interesse a cada dia. Além disso, meu irmão também escolheu cursar ADS e, ao me contar sobre a faculdade, despertou ainda mais meu interesse, influenciado também por filmes e séries sobre hackers e tecnologia.

Tenho alguns hobbies, como ir à academia, jogar futebol e praticar atividades ao ar livre. Acredito que todos devemos praticar exercícios para melhorar nosso foco no dia a dia, especialmente em áreas que exigem muito do pensamento e da resolução de problemas, onde sabemos como pode ser frustrante não resolver desafios no tempo desejado.

email: gabrielnaves60@gmail.com
telefone: (17)99761-9950