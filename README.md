# Kanban Field Control

Este projeto é um sistema Kanban, com funcionalidades para gerenciar colunas, tarefas e subtarefas. A seguir estão as instruções para iniciar o projeto e uma descrição das principais funcionalidades.

pode-se acessar o deploy do projeto nesse link: 
https://kanban-fieldcontrol.netlify.app

---

## **Como iniciar o projeto**

### **Backend (Servidor)**

+ **Comandos para iniciar o servidor:**
  ```bash
  # Acesse a pasta do servidor
  cd server

  # Instale as dependências
  npm install

  # Configure as variáveis de ambiente
  # Crie um arquivo .env na raiz do servidor e adicione:
  DATABASE=<sua_connection_string_do_mongodb>
  PORT=3000

  # Inicie o servidor
  npm start

### **Frontend (cliente)**

+ **Comandos para iniciar o cliente:**
  ```bash
  # Acesse a pasta do cliente
  cd client

  # Instale as dependências
  npm install

  # Inicie o servidor
  npm start:dev

---

## **Funcionalidades**

### **Gerenciamento de colunas**
+ É possível **criar colunas** clicando no botão **Adicionar Coluna**, onde você poderá:
  + Escrever o nome da coluna.
  + Escolher uma cor para a coluna.

  + **Excluir uma coluna:**
  + Clique no botão com o **Deletar Coluna** e clique em **Ok** na caixa de confirmação do navegador para removê-la.

### **Gerenciamento de tarefas**
+ **Criar uma tarefa:**
  + Clique no botão **Criar Tarefa**.
  + Digite o nome da tarefa.
  + Digite a descrição da tarefa (opcional).
  + Escolha em qual coluna a tarefa será exibida.

+ **Abrir detalhes da tarefa:**
  + Clique no botão **Abrir** dentro da tarefa para visualizar detalhes.

+ **Modificar o nome da tarefa:**
  + Clique no **ícone de lápis** ao lado do nome.

+ **Mover tarefa entre colunas:**
  + Passe o mouse sobre o campo **Status** e escolha a nova coluna.

+ **Modificar a descrição da tarefa:**
  + Clique no **ícone de lápis** ao lado do campo **Descrição**.

+ **Excluir uma tarefa:**
  + Clique no botão com o **Deletar Tarefa** e clique em **Ok** na caixa de confirmação do navegador para removê-la.

### **Gerenciamento de subtarefas**
+ **Adicionar subtarefas:**
  + Preencha o campo de entrada e clique no botão com o **símbolo de +**.

+ **Concluir uma subtarefa:**
  + Marque o **checkbox** ao lado da subtarefa para indicar que foi concluída.

+ **Excluir uma subtarefa:**
  + Clique no botão com o **símbolo de X** para removê-la.

### Obrigado por acessar o meu projeto