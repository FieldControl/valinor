# Projeto Kanban - Documentação

## Descrição
O projeto Kanban é uma aplicação web que simula um quadro Kanban, permitindo a criação de colunas e tarefas associadas a essas colunas. O usuário pode interagir arrastando e soltando tarefas entre as colunas.

## Estrutura do Projeto

### Arquivos Principais

#### `main-view.html`
O arquivo `main-view.component.html` contém a estrutura HTML da aplicação, definindo a aparência e interação do quadro Kanban. Ele utiliza Angular para criar dinamicamente as colunas e tarefas.

#### `main-view.ts`
O arquivo `main-view.component.ts` contém a lógica da aplicação, manipulando a criação, edição e exclusão de colunas e tarefas. Utiliza o Angular Drag and Drop para a funcionalidade de arrastar e soltar.

#### `main-view.scss`
O arquivo `main-view.component.scss` contém estilos CSS para estilizar a aplicação. Ele utiliza o pré-processador SCSS para melhor organização e legibilidade do código.

### Componentes

#### `Board`
- Representa um quadro Kanban.
- Possui um nome e uma lista de colunas.

#### `Column`
- Representa uma coluna no quadro Kanban.
- Possui um nome e uma lista de tarefas.

#### `Task`
- Representa uma tarefa em uma coluna.
- Possui um nome e uma descrição.

## Funcionalidades

### Adicionar Coluna
- Função: `addColumn()`
- Descrição: Adiciona uma nova coluna ao quadro Kanban.

### Adicionar Tarefa
- Função: `addTask(column: Column)`
- Descrição: Adiciona uma nova tarefa a uma coluna específica.

### Editar Nome da Coluna
- Função: `editColumnName(column: Column, newName: string)`
- Descrição: Edita o nome de uma coluna específica.

### Editar Nome da Tarefa
- Função: `editTaskName(column: Column, index: number)`
- Descrição: Edita o nome de uma tarefa em uma coluna específica.

### Excluir Coluna
- Função: `deleteColumn(column: Column)`
- Descrição: Exclui uma coluna do quadro Kanban.

### Excluir Tarefa
- Função: `deleteTask(column: Column, index: number)`
- Descrição: Exclui uma tarefa de uma coluna específica.

### Arrastar e Soltar Tarefas
- Funcionalidade: Utiliza o Angular Drag and Drop para permitir que o usuário arraste e solte tarefas entre as colunas.

### Resetar Nomes Temporários de Tarefa
- Função: `resetTemporaryTaskNames()`
- Descrição: Reseta os nomes temporários de tarefas para os valores originais.

## Estilos CSS

### `.root`
- Estiliza o contêiner principal da aplicação.

### `.app-name`
- Estiliza o nome da aplicação com gradiente de cor.

### `.board`
- Estiliza o quadro Kanban e suas colunas.

### `.board-bar`
- Estiliza a barra superior do quadro Kanban.

### `.board-wrapper`
- Estiliza o contêiner das colunas do quadro Kanban.

### `.board-columns`
- Estiliza as colunas do quadro Kanban.

### `.board-column`
- Estiliza cada coluna individual no quadro Kanban.

### `.tasks-container`
- Estiliza o contêiner de tarefas.

### `.task`
- Estiliza cada tarefa no quadro Kanban.

### `.createButton`
- Estiliza o botão de criação de coluna.

### `.input-column`
- Estiliza a entrada de texto para o nome da coluna.

### `.task-content`
- Estiliza o conteúdo da tarefa.

### `.name`
- Estiliza o nome da tarefa.

### `.description`
- Estiliza a descrição da tarefa.

## Dependências Externas

- `@angular/common`: Módulo Angular para funcionalidades comuns.
- `@angular/core`: Módulo Angular para funcionalidades principais.
- `@angular/cdk/drag-drop`: Módulo Angular para arrastar e soltar.
- `@angular/material/menu`: Módulo Angular para menus.
- `@angular/material/button`: Módulo Angular para botões.
- `@angular/material/icon`: Módulo Angular para ícones.
- `@angular/material/input`: Módulo Angular para campos de entrada.
- `@angular/forms`: Módulo Angular para manipulação de formulários.

## Considerações Finais

O projeto Kanban é uma aplicação simples para organizar tarefas em um formato visualmente intuitivo. Ele oferece uma interface amigável e funcionalidades básicas de gerenciamento de quadro Kanban.
