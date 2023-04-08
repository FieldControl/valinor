# Vanilor

## Desafio: Frontend Developer

### Projeto
Utilizei a API da marvel.

### Tecnologias
As tecnologias utilizadas foram Angular, Angular Material, Cypress para testes e Bootstrap (com ngx-bootstrap junto).
# Cypress
por que escolhi Cypress e não outro?
- Cypress é construído especificamente para testes de front-end e oferece uma experiência de teste rápida e confiável.
- Cypress tem uma arquitetura única que permite testes em tempo real e depuração fácil.
- Cypress oferece recursos úteis como capturas de tela e vídeos automáticos para ajudar a entender o comportamento do teste.
- Cypress tem uma ampla base de usuários e documentação abrangente que pode ajudá-lo a começar rapidamente.
# ngx-bootstrap
por que escolhi usar ele?
- Já tenho experiencia com o uso de Bootstrap, mas achei importante usar uma biblioteca pronta, já no formato do angular para o uso de componentes mais elaborados (como os que usei para agrupar os resultados).

### Link do projeto
Pode acessar pelo a aplicação rodando pelo [link](https://valinor-phi.vercel.app/)
https://valinor-phi.vercel.app/
ou baixar do meu GitHub e rodar manualmente => https://github.com/Jean-Paulo-Public/valinor

### Desafios enfrentados
Deixei os commits publicos, e cada desafio que tive eu fui marcando nos commits, a maior parte foi relacionado a estilização, sou do "backend" então até pegar as manhas apanhei um pouco, apanhei um pouco para fazer o teste automatizado também. Outro desafio também foi me aprofundar mais em Typescript para conseguir fazer e entender o código (e não só copiar da internet, podendo gerar bugs que eu não saiba resolver depois).
Também não sei muito bem como deveriam ser feito os testes, qual o melhor padrão para isso, então tentei fazer de várias formas diferentes e centralizando tudo no CyPress.

### Melhorias possíveis
Percebi de ultima hora que ele não reseta o paginator ao mudar o tipo de consulta, é um bug bem díficil de notar, mas acontece, mesmo após a entrega pretendo corrigi-lo e aproveitar esse projeto para já ser um layout para outros sites que eu queira fazer, como um blog por exemplo.
Quero também adicionar mais testes no CyPress.
Posso fazer o que já tinha feito em um repositório de estudo e criar um servidor backend para não deixar minha chave exposta, fazer cacheamento e tratamento de dados. Posso também explorar mais coisas da API da marvel, ela possibilita uma infinidade de coisas.

Este projeto foi gerado com [Angular CLI](https://github.com/angular/angular-cli) versão 15.2.4.

## Pré requisitos para instalação manual

### Angular Cli
Execute `npm install -g @angular/cli` e `npm install @angular-devkit/build-angular` para instalar o angular e suas dependencias.

### Cypress
Ao executar os testes e2e via `ng e2e` instale o Cypress.

### Bootstrap
Instale o pacote do Bootstrap via npm: `npm install bootstrap --save`

### ngx-bootstrap
Instale o `npm install ngx-bootstrap` para trabalhar com o bootstrap de forma componentizada. (Saiba mais em https://valor-software.com/ngx-bootstrap/#/components)

## Servidor de desenvolvimento

Execute `ng serve` ou `npm start` para um servidor de desenvolvimento. Navegue até `http://localhost:4200/`. O aplicativo será recarregado automaticamente se você alterar qualquer um dos arquivos de origem.

## Construir

Execute `ng build` para construir o projeto. Os artefatos de construção serão armazenados no diretório `dist/`.

## Executando testes de ponta a ponta

Execute `ng e2e` para executar os testes de ponta a ponta através do CyPress. Para usar este comando, você precisa primeiro adicionar instalar o Cypress.

Contato: jeanpauloriopreto.code@gmail.com