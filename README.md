# Kanban

Este projeto foi gerado com [Angular CLI](https://github.com/angular/angular-cli) versão 17.3.7.

## Ferramentas utilizadas

Visual Studio Code.

## Bibliotecas utilizada

Angular Material

## Servidor de desenvolvimento

Execute `ng serve` para um servidor de desenvolvimento. Navegue até `http://localhost:4200/`. O aplicativo será recarregado automaticamente se você alterar algum dos arquivos de origem.

## Modo de uso do sistema

Após a conclusão da instalação e com o sistema em funcionamento, para adicionar uma tarefa, basta digitar o nome da tarefa no campo "NOME DA TAREFA". Em seguida, o sistema habilitará o botão "ADICIONAR", que, ao ser clicado, enviará automaticamente a terefa para o campo "PENDÊNCIAS". o usuário pode arrastar e soltar a tarefa para a coluna desejada.

A opção de editar uma tarefa só está disponível se o cartão estiver na coluna "PENDÊNCIAS". Clicando no ícone de lápis, o nome da tarefa desejada será movido para o campo "NOME DA TAREFA", e o botão mudará automaticamente de "ADICIONAR" para "ATUALIZAR". edite o nome da tarefa conforme desejado e clique no botão "ATUALIZAR". O cartão será atualizado e o botão retornará automaticamente para "ADICIONAR".

Para deletar um cartão, o ícone de lixeira está presente em todos os cartões e colunas. Quando for necessário excluir um cartão, basta clicar no ícone de "LIXEIRA" correspondente ao cartão desejado para removê-lo.

## Andaime de código

Execute `ng generate component nome-do-componente` para gerar um novo componente. Você também pode usar `ng generate directiva|pipe|service|class|guard|interface|enum|module`.

## Construir

Execute `ng build` para construir o projeto. Os artefatos de construção serão armazenados no diretório `dist/`.

## Executando testes unitários

Execute `ng test` para executar os testes de unidade via [Karma](https://karma-runner.github.io).

## Executando testes ponta a ponta

Execute `ng e2e` para executar os testes ponta a ponta através de uma plataforma de sua escolha. Para usar este comando, você precisa primeiro adicionar um pacote que implemente recursos de teste ponta a ponta.

## Mais ajuda

Para obter mais ajuda sobre o Angular CLI, use `ng help` ou confira a página [Visão geral do Angular CLI e referência de comandos](https://angular.io/cli).