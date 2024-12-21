## Como instalar
1. Baixe o arquivo zip do repositório ou clone o repositório do GitHub.
2. Caso tenha baixado decompacte o arquivo.
3. Abra o terminal e navegue até a pasta do projeto.
4. Execute o comando `npm install` dentro do diretório 'apiproject' para instalar as dependências do projeto.
5. no diretório 'apiproject' crie um arquivo chamado .env e coloque as variáveis de ambiente que serão explicitadas abixo.
5. Execute o comando `npm run dev` para iniciar o servidor de desenvolvimento.
6. Acesse o endereço `http://localhost:3333` no seu navegador para poderacessar a api.
7. Depois acesse o diretório 'frontkanban'.
8. Execute o comando `npm install` para instalar as dependências do projeto.
9. Execute o comando `npm run start` para iniciar o para ter acesso a tela de login.
10. Após acessar a tela de login, você precisará criar uma conta para acessar a api.
11. Após criar a conta, você precisará acessar a tela de login novamente e fazer
login com as credenciais criadas.
12. Após acessar a tela de login com sucesso, você poderá acessar a tela de Kanban.
13. Após acessar a tela de Kanban, você poderá criar, editar e deletar tarefas.
14. Se precisar acessar o projeto mais de uma vez certifique-se de que não haja o diretorio 'frontkanban/.angular/cache' se ainda hover delete o diretório 'cache'
15. certifique-se de que a maquina em que vc está rodando o projeto tenha as tecnologias necessarias para rodar o projeto nas versões corretas.(explicitadas no arquivo package.json de apiproject e frontkanban )


## .env da api

DATABASE_URL="file:./dev.db"

##
