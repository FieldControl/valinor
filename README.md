**<h1 style="color: blue; font-weight: bold;">AngularSearch</h1>**

Este projeto foi desenvolvido com [Angular CLI](https://github.com/angular/angular-cli) version 16.2.6 com intuito de demonstrar habilidade de programação e desenvolvimento de softwares utilizando o <span style="color: blueviolet;">framework</span>.

O projeto consiste em uma página SPA de pesquisa do GitHub, utilizando as APIs do próprio GitHub, foi desenvolvido para que o usuário consiga alternar as pesquisas entre <span style="color: blueviolet;">Repositórios</span> ou <span style="color: blueviolet;">Issues.</span>

**<h2 style="color: blue;">Componentes e Serviços</h2>**

A estrutura do código é organizada por <span style="color: blueviolet;">componentes</span> e <span style="color: blueviolet;">serviços</span> gerados no framework, o projeto conta com 4 <span style="color: blueviolet;">componentes</span> e 5 <span style="color: blueviolet;">serviços</span>, sendo eles:

**<h3 style="color: blue;">Componentes:</h3>**

- NavBar
- SideNav
- Página de Resultados
- Footer

**<h3 style="color: blue;">Serviços:</h3>**

- **CheckResults:** Serviço que atua quando a página é iniciada, checando se existe algum resultado de pesquisa, caso não haja, uma variável é acionada como <span style="color: red;">true</span>, e é utilizada para apresentar uma div com uma imagem no container para o funcionamento correto da sidenav.

- **Drawer:** É um serviço para conseguir utilizar a função de abrir ou fechar a sidenav por meio de um botão em outro componente, no caso um botão na NavBar.

- **Issues:** É um serviço para compartilhar a API e os resultados (dados) geridos pela ferramenta.

- **Repo:** Serviço identico ao Issues, com a diferença de compartilhar a API referente a pesquisa de Repositórios.

- **Show-search-results:** Serviço criado para compartilhar 4 variaveis com todos os componentes do código a fim de utilizá-las conforme o necessário.

