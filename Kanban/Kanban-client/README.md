# Kanban Client Documentation

Esta é a documentação da Client do Kanban desenvolvida usando Angular 18

## Instalação

Para rodar o cliente Kanban, siga os seguintes passos:

1. Clone o repositório:

   ```bash
   git clone https://github.com/seu-usuario/kanban-cliente.git
   cd Kanban-cliente
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Inicie a aplicação:
   ```bash
   npm run start
   ```

A aplicação estará disponível na porta 4200.

## Uso

A aplicação possui as seguintes funcionalidades principais:

- **Criar Projetos:** Adicione novos projetos para gerenciar diferentes trabalhos.
- **Criar Colunas:** Dentro de cada projeto, crie colunas para dividir as etapas do processo (por exemplo, "A Fazer", "Em Progresso", "Concluído").
- **Criar Tarefas:** Adicione tarefas dentro das colunas para detalhar as atividades que precisam ser realizadas.
- **Mover Tarefas:** Arraste e solte tarefas entre as colunas para refletir o progresso das atividades.

### Exemplo de Comandos e Funções Principais

1. **Criar um Projeto:**

   - Vá para a página inicial.
   - Clique no botão "Adicionar Projeto".
   - Preencha os detalhes do projeto e clique em "Salvar".

2. **Adicionar Colunas:**

   - Dentro de um projeto, clique no botão "Adicionar Coluna".
   - Preencha o nome da coluna e clique em "Salvar".

3. **Adicionar Tarefas:**

   - Dentro de uma coluna, clique no botão "Adicionar Tarefa".
   - Preencha os detalhes da tarefa e clique em "Salvar".

4. **Mover Tarefas:**
   - Arraste uma tarefa e solte-a na coluna desejada para atualizar seu status.
