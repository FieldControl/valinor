## Recursos necessários para rodar o projeto!

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)
![Angular](https://img.shields.io/badge/Angular-DD0031?style=flat&logo=angular&logoColor=white)

O projeto está separado em duas pastas: backend e frontend. Onde no backend se encontra uma estrutura montada com NestJs e o frontend montada com Angular.

## Instalação do bakcend para rodar projeto localmente

Antes de começar, certifique de que tenha instalado o MySQL server, pois é utilizado para criação do banco de dados.
Apos verificar/instalar o MySQL server, execute o comando "mysql -u root -p" no PowerShell para acessar o prompt do mysql. Quando solicitar a senha apenas aperte enter.
Quando acessar o prompt de comando do MySQL utilize o comando: "CREATE DATABASE kanban_db;".
Opcional: verifique se o banco foi criado com: SHOW DATABASES;
Depois pode sair do prompt do MySQL com o comando: EXIT;
Abra um terminal (powershel, cmd ou o integrado do vscode) dentro da pasta backend e digite o comando: npm install. Isso vai instalar todos os recursos necessários para rodar o backend. Incluindo o banco de dados completo.

## Inicie o app

npm run start

## Intalação do frontend para rodar projeto localmente

Abra um terminal dentro da pasta frontend e execute o comando: ng serve. Isso fará o download de todos os arquivos necessários.
Navegue até o site: https://localhost:4200/

## Testando o programa

Ao abrir https://localhost:4200/ cairá em uma página de login. Clique em "Não tem cadastro? Cadastre-se aqui." e realize seu cadastro.
Logo na página inicial clique no botão "adicionar quadro". Preencha o campo nome da forma que preferir.
Ao clicar no botão editar, poderá alterar o nome do quadro. Se quiser exclui-lo só clicar em excluir e confirmar a exclusão.
Se clicar em qualquer área do quadro você poderá ver todas as colunas e cards do quadro atual.
Para adicionar uma nova coluna basta preencher o campo nome e clicar no botão "Adicionar Coluna" ou apenas precione enter. Adicione quantas colunas preferir.
Para adicionar um card basta clicar em "Adicionar Card" e preencher o campo nome e o campo descrição respectivamente. Após isso o card já irá aparece na coluna onde foi criado.
Para ver a descrição do card basta clicar sobre o mesmo. Assim como para exclui-lo e edita-lo.
Pode arrastar os cards segurando com o click do mouse e arrastando até a coluna desejada.
Para voltar e ver todos os quadros basta voltar na seta ao lado do nome do quadro ou apenas clicar em "quadro" no canto superior direito.
Para sair do seu login basta clicar em "sair" no canto superior direito.

## Tecnologias utilizadas

- [Angular](https://angular.io/)
- [NestJS](https://nestjs.com/)
- [TypeORM](https://typeorm.io/)
- [MySQL](https://www.mysql.com/)

## Problemas Conhecidos

- O drag-and-drop ainda não persiste no backend em tempo real.
- Ainda não há confirmação de exclusão em algumas ações (UX).
- Ainda não há utilização do Socket.io para Realtime.
- Falta de testes E2E.

## Autor

Desenvolvido por [Kauê Jardim de Vette](https://github.com/kauevette)

Este projeto foi desenvolvido como parte de um teste técnico para uma oportunidade de desenvolvedor.

## Licença

Este projeto é apenas para fins de avaliação técnica. Todos os direitos reservados.
