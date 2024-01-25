# GitHub Search / Field Control

Este é um projeto feito em AngularJS que permite aos usuários pesquisar repositórios no GitHub e exibir informações relevantes sobre esses repositórios. O projeto inclui paginação e uma interface de usuário inspirada na página de pesquisa de repositórios do GitHub.

## Pré-requisitos

- [Node.js](https://nodejs.org/) instalado na máquina.
- [npm](https://www.npmjs.com/) (gerenciador de pacotes do Node.js).
- [Java Development Kit (JDK)](https://www.oracle.com/java/technologies/javase-downloads.html) para executar o servidor Selenium WebDriver.

## Instalação

1. Clone o repositório para a sua máquina local:

  ```bash
  git clone https://github.com/gabbarco/valinor.git
  ```
  
2. Navegue até o diretório do projeto:

  ```bash
  cd project
  ```

3. Instale as dependências:

  ```bash
  npm install
  ```

4. Instalação do AngularJs :

  Se você não estiver usando o Angular CLI, instale o AngularJS usando o npm.
  ```bash
  npm install angular@1.8.2
  ```

5. Atualize o Selenium WebDriver (Teste de Integração):

  ```bash
  webdriver-manager update
  ```

## Execução do Projeto

Servidor de Desenvolvimento
Execute os seguintes comandos para iniciar o servidor de desenvolvimento:

  ```bash
  npm install -g http-server
  ```
  ```bash
  http-server
  ```
  O aplicativo estará acessível em http://localhost:8080.

## Testes Unitários

Execute os testes unitários usando o Karma:

  ```bash
  npm test
  ```

Também é possível adicionar mais testes diferentes por meio do arquivo repoController.spec.js


## Testes de Integração

Certifique-se de ter o Selenium WebDriver e a aplicação em execução. Abra um terminal e execute:

Obs: Caso não funcione pelo PowerShell, execute o WebDriver por meio do Cmd 

  ```bash
  webdriver-manager start
  ```

Em um terminal diferente, execute:

  ```bash
  protractor protractor.conf.js
  ```

Se você encontrar problemas relacionados ao Java durante a execução do Selenium WebDriver, certifique-se de ter o Java JDK instalado e configurado corretamente em sua máquina.

©️ Gabriel Barco Borges
