# Kanban Online para Gerenciamento de Projetos

## Vercel:

https://kanban-client-delta.vercel.app/

## Link API

https://kanban-api-fnpa.onrender.com/

## Visão Geral do Projeto

O Kanban Online é uma aplicação criada para facilitar o gerenciamento de tarefas e projetos. Ele permite a criação de projetos, onde cada projeto pode ser dividido em colunas que representam diferentes etapas do processo. Dentro de cada coluna, é possível criar tarefas (tasks) e mover essas tarefas entre as colunas conforme o projeto evolui. Este projeto foi desenvolvido para ajudar equipes a organizar e visualizar o progresso de seus trabalhos de maneira eficiente e intuitiva.

## Instalação

Para rodar o cliente Kanban, siga os seguintes passos:

1. Clone o repositório:

   ```bash
   git clone https://github.com/Jonasalvesdesouza/Kanban.git
   cd kanban-cliente
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

## Contribuição

Se você deseja contribuir com o projeto, siga estas diretrizes:

1. **Fork o Repositório:** Clique no botão "Fork" no GitHub.
2. **Crie uma Branch:** Crie uma branch para sua feature ou correção:
   ```bash
   git checkout -b minha-feature
   ```
3. **Commit suas Mudanças:** Faça commit de suas alterações com mensagens claras e concisas:
   ```bash
   git commit -m "Adiciona nova funcionalidade X"
   ```
4. **Envie para o Repositório Remoto:** Envie suas alterações para o GitHub:
   ```bash
   git push origin minha-feature
   ```
5. **Abra um Pull Request:** Vá até a página do repositório no GitHub e abra um pull request.

Para reportar problemas ou bugs, por favor, abra uma "Issue" no repositório do GitHub.

## Licença

Este projeto está licenciado sob a [MIT License](LICENSE). Isso significa que você pode usar, copiar, modificar e distribuir o software conforme os termos da licença.
