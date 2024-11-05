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

