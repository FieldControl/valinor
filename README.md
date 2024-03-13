# Kanban
O Kanban é uma aplicação web que permite gerenciar tarefas utilizando o método Kanban.

## Sumário 
- [Ferramentas utilizadas](#ferramentas)
- [Instalação](#instalação)
- [Uso](#uso)
- [Contribuição](#contribuição)

## Ferramentas
- Node JS 21.6.2
- Angular 14
- Nest Js 10.3.2
- MySql 8
- Docker 25.0.3

## Instalação
Para utilizar o Kanban, siga estes passos:
1. Certifique-se de ter o Node.js e o npm instalados em seu sistema. Você pode baixá-lo em [nodejs.org](https://nodejs.org). (versão 21.6.2)
2. Instale o Angular CLI globalmente executando o seguinte comando no terminal:`npm install -g @angular/cli@14`
3. Instale o NestJS globalmente executando o seguinte comando no terminal:`npm install -g @nestjs/cli`
4. Instale  o  Docker  em  seu  sistema. Você pode  baixá-lo  em  [docker.com](https://www.docker.com/get-started).
5. Clone o repositório do Kanban para o seu ambiente local: `git clone https://github.com/igorgomes98/valinor.git`
6. Navegue até o diretório do projeto:  `cd valinor`
7. Navegue até o backend: `cd backend`
8. Instale as dependências do backend NestJs: `npm install`
9. Inicie o container do banco de dados MySql utilizando o Docker Compose: `docker-compose up -d`
10. Inicie o servidor:`npm start`  ou `npm run start:dev`
11. Navegue até o frontend:  `cd ../frontend`
12. Instale as dependências do frontend Angular: `npm install --legacy-peer-deps`
13. Inicie o servidor angular: `ng serve --proxy-config`
14. Abra um navegador da web e acesse [http://localhost:4200](http://localhost:4200) para utilizar o Kanban.

## Uso
Para usar o Kanban: 
1. Crie uma nova lista clicando no botão "+ Adicionar Lista".
2. Preencha o nome da lista.
3. Assim sua lista será criada.
4. Se quiser alterar o nome da lista basta clicar no titulo dela que poderá alterar o nome sem problemas
5. Se quiser apagar uma lista, é só clicar no icone de lixeira no seu canto superior esquerdo
6. Crie um cartão no botão "+ Adicionar cartão".
7. Preencha o titulo do cartão
8. Crie quantas listas e cartões quiser
9. Reordene e mova o cartão de lista segurando e arrastando ele.
10. Clique no cartão para editar seus detalhes como, alterar o nome, a descrição, adicionar ou remover badges e alterar a data final.
11. Para excluir um cartão basta clicar no botão vermelho "Deletar Cartão".
12. Caso queira filtrar os cartões, basta digitar o titulo deles no campo "Filtrar nome cartão" que eles serão filtrados na sua lista

## Contribuição
Contribuições são bem-vindas! Se você gostaria de contribuir com o desenvolvimento do Kanban, siga estas etapas:
1. Faça um fork do repositório.
2. Crie uma branch para a sua contribuição: `git checkout -b feature/nova-feature`.
3. Faça suas alterações e adições. 
4. Faça commit das suas mudanças: `git commit -am 'Adiciona nova feature'`. 
5. Faça push para a sua branch: `git push origin feature/nova-feature`.
6. Abra um novo pull request.