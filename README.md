<h1 align="center">Documentação - Desafio Kanban Field Control</h1> 

<p align="center">
  <img src="https://img.shields.io/static/v1?label=Angular&message=framework&color=red&style=for-the-badge&logo=Angular"/>
  <img src="http://img.shields.io/static/v1?label=Firebase&message=Hosting&color=red&style=for-the-badge&logo=firebase"/>
  <img src="http://img.shields.io/static/v1?label=Jasmine&message=unit%20test&color=green&style=for-the-badge&logo=jasminee"/>
  <img src="http://img.shields.io/static/v1?label=cypress&message=test%20E2E&color=GREEN&style=for-the-badge&logo=cypress"/>
  <img src="http://img.shields.io/static/v1?label=STATUS&message=CONCLUIDO&color=GREEN&style=for-the-badge"/>
</p>

> Status do Projeto: :heavy_check_mark: (Concluído, porém com possíveis melhorias)

### Tópicos 

:small_blue_diamond: [Descrição do projeto](#descrição-do-projeto)

:small_blue_diamond: [Funcionalidades](#funcionalidades)

:small_blue_diamond: [Deploy da Aplicação](#deploy-da-aplicação-dash)

:small_blue_diamond: [Pré-requisitos](#pré-requisitos)

:small_blue_diamond: [Como rodar a aplicação](#como-rodar-a-aplicação-arrow_forward)

:small_blue_diamond: [Testes Unitários](#como-rodar-os-testes-unitários)

:small_blue_diamond: [Teste E2E](#como-rodar-o-teste-E2E)

:small_blue_diamond: [Casos de Uso](#casos-de-uso)

:small_blue_diamond: [Dependências e libs utilizadas](#dependências-e-libs-utilizadas)

:small_blue_diamond: [Tarefas em aberto](#tarefas-em-aberto)

:small_blue_diamond: [Desenvolvedores/Contribuintes](#desenvolvedores-do-projeto)

## Descrição do projeto 

<p align="justify">
  Quadro Kanban utilizando angular, que possibilita o usuário criar, editar, excluir e mover os cards das tarefas de uma coluna para outra, alterando assim o status da tarefa.
</p>

## Funcionalidades

:heavy_check_mark: Possibilita o usuário mudar o card para outras coluas, mudando o status da tarefa.

:heavy_check_mark: Possibilita o usuário criar um novo card para uma nova tarefa.

:heavy_check_mark: Possibilita o usuário editar as informações de titulo e descrição de uma tarefa já existente.

:heavy_check_mark: Possibilita o usuário excluir o card tarefa de tarafa clicando 2 vezes em cima dele e clicar no icone de excluir.

## Deploy da Aplicação :dash:

> Link do deploy da aplicação. Hosting do firebase: https://kanbanteste-579b5.web.app/

## Pré-requisitos

:warning: [Node](https://nodejs.org/en/download/)

:warning: [Angular-CLI](https://angular.io/cli)

:warning: [VSCode](https://code.visualstudio.com/)

:warning: [Chrome](https://www.google.com/intl/pt-BR/chrome/)

## Como rodar a aplicação :arrow_forward:
Navegue pelo terminal até o diretório onde deseja colocar os fonte:

No terminal, clone o projeto: 

```
git clone https://github.com/gabrieel1007/desafioKanban
```
Em seguida, execute o seguinte código para instalação do módulo do Node:

```
npm install
```
E por último execute o seguinte código:

```
ng serve
```
O console exibirá a seguinte mensagem, indicando a porta que a aplicação está sendo executada:
<div>
  <img src="https://github.com/gabrieel1007/edicaReadme/assets/121512531/80f11d42-b9c4-4d07-a533-34e6bff28dce" width="350">
</div><br>

## Como rodar os testes unitários

Para testar os componentes da página, execute o seguinte código:

```
npm test 
```
O console exibirá a seguinte mensagem, indicando que o teste foi executado com sucesso:
<div>
  <img src="https://github.com/gabrieel1007/edicaReadme/assets/121512531/228212d1-a2e2-475e-8a4a-88985ac3a63b" width="350">
</div><br>

E em seguida abre uma nova tela no navegador, indicando os testes que foram realizados:
<div>
  <img src="https://github.com/gabrieel1007/edicaReadme/assets/121512531/588c6963-f9e5-4400-b08e-f19f48e9e513" width="350">
</div><br>

## Como rodar o teste E2E

Para executar o teste E2E, execute o seguinte código:

```
ng e2e 
```

A seguinte tela do cypress irá aparecer automaticamente, selecione um navegador, e clique para iniciar o teste:
<div>
  <img src="https://github.com/gabrieel1007/edicaReadme/assets/121512531/3a71615f-09c4-4415-900d-0d0796375605" width="350">
</div><br>

A seguinte tela será aberta automaticamente:
<div>
  <img src="https://github.com/gabrieel1007/edicaReadme/assets/121512531/aa1c68d7-526d-4cd4-a86e-83a7fcb23cd3" width="350">
</div><br>

Selecione o teste, e o cypress ira executá-lo e irá mostrar outra tela com o teste realizado:
<div>
  <img src="https://github.com/gabrieel1007/edicaReadme/assets/121512531/c463fd77-b943-40b9-8079-dc92ee1f397b" width="350">
</div>

## Casos de Uso

### Descrição:<br>
Como usuário do sistema de gerenciamento de tarefas, desejo ser capaz de adicionar um novo cartão ao quadro Kanban para registrar uma nova tarefa ou atividade.

### Fluxo de Eventos ==>
<br>

### Adicionar Card:

1. O usuário acessa a página principal do sistema de gerenciamento de tarefas.
2. Na página principal, o usuário visualiza o quadro Kanban, onde estão listadas as colunas representando diferentes estágios do fluxo de trabalho.     
3. O usuário clica no botão "Adicionar Tarefa".     
4. O sistema exibe um campo de entrada de texto vazio para o título e descrição da tarefa.     
5. O usuário digita o título e descrição da nova tarefa no campo de entrada.     
6. O usuário clica no botão "OK" para adicionar o card de tarefa.     
7. Se o título e descrição estiver vazio, o sistema não adiciona o novo card.  
9. Se o título e descrição estiver preenchido corretamente, o sistema cria um novo card com o título e descriçaõ fornecido e o adiciona à coluna "A Fazer".
10. O usuário pode optar por adicionar mais cartões se quiser.<br>


### Alterar Card:

1. O usuário localiza o cartão que deseja alterar no quadro Kanban.
2. O usuário clica duas vezes no cartão desejado para iniciar o modo de edição.
3. Os campos do modal de edição são carregados com os dados existentes.
4. O usuário modifica os campos do cartão conforme necessário para refletir as alterações desejadas.
5. O usuário clica no botão "OK" para confirmar as alterações.
6. Sistema atualiza o cartão com os novos dados.<br>

### Excluir Card:

1. Usuário localiza o cartão que deseja excluir no quadro Kanban.
2. O usuário clica duas vezes no cartão desejado para iniciar o modo de edição.
3. O usuário clica no ícone de lixeira do modal.
4. O sistema remove o cartão do quadro Kanban.

## Dependências e libs utilizadas:

- [Angular](https://angular.io/)
- [Angular Material](https://material.angular.io)
- [Cypress](https://www.cypress.io/)
- [Jasmine](https://jasmine.github.io/)
- [Karma](https://karma-runner.github.io/latest/index.html)
- [Node](https://nodejs.org/en)
- [Firebase](https://firebase.google.com/?hl=pt)
- [NPM](https://www.npmjs.com/)

## Tarefas em aberto

:memo: Implantar login do google e consumir BD do firebase;

:memo: Implantar mais reponsivadade nas açoes da pagina; 

:memo: Melhorar Layout da página;

## Desenvolvedores do projeto

### <a href="https://github.com/gabrieel1007">Gabriel Alves</a>

## Licença 

Copyright :copyright: 2024 - Desafio Kanban
