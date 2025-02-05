**Kaban Angular - Drag & Drop e Gerenciamento de Tarefas*

Bem vindo! Esse é um projeto simples, para organizar tarefas de modo visual e intuitiva.
Criado com Angular e utilizando CDK Drag & Drop, ele permite arrastar e soltar tarefas, além
de criar e excluir colunas e tarefas. 

**O que você pode fazer?**

-> Arrastar e soltar tarefas entre colunas
-> Criar novas tarefas
-> Excluir tarefas que não são mais necessárias
-> Criar novas colunas
-> Remover colunas

**O que foi usado nesse projeto?**

* Angular
* Angular CDK Drag & Drop
* Typescript
* HTML5 + CSS3

**Como instalar e rodar o projeto**

1- Clone o repositório
   Baixe os arquivos do projeto:
   https://github.com/melissaabilio/kanban.git
   cd kanban-angular

2- Instale as depedências
   Antes de rodar, instale os pacotes necessários:
   npm install
   Se você não tiver o Angular CDK, instale com:
   npm install @angular/cdk

3- Rode o projeto
   Agora é só inciar o servidor Angular:
   ng serve

Acesse no navegador:
http://localhost:4200

**Como usar o Kanban?**

1- Adicione uma nova tarefa -> Clique no botão "+ Adicionar Tarefa" dentro da coluna desejada.
2- Arraste e solte tarefas -> Clique e arraste uma tarefa para movê-la entre colunas.
3- Remova uma tarefa -> Clique no ícone de lixeira (🗑️) dentro do card para excluir.
4- Crie uma nova coluna -> Clique no botão "+ Adicionar Coluna" para organizar melhor.~
5- Exclua uma coluna → Se não precisar mais dela, clique no botão "❌" para removê-la.

**Como o projeto está organizado**

>src/
  >app/
    >components/kanban
       kanban.component.css             #Estilização
       kanban.component.html            #Estrutua visual
       kanban.component.ts              #Lógica principal
    
   app.component.html
   app.component.ts
   app.routes.ts

 index.html
 main.ts

