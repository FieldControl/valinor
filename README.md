Qual ferramentas e bibliotecas (libraries, framework, tools etc) você usou?

Para a relização do desafio usei apenas Angular para o front, e nestjs para o back, ambos escritos em TypeScript. 
De biblioteca utilizei apenas Angular Material, principalmente para facilitar a implementação da funcionalidade drag and drop do Kanban.

Porque você optou pela tecnologia X e não a Y

Angular e NestJs, apesar de eu não ter experiência prévia com os mesmos, foram escolhidos por serem parte do desafio, sendo indispensável a utilização.
A biblitoca Angular Material foi escolhida principalmente por fazer parte do time Angular da google, e para poupar tempo, se adequando ao tempo limitado que tinha para realizar o desafio.
Optei por não implementar GraphQL, deixando a comunicação com o back sendo feita por api REST, porque que isso adicionaria muito tempo no desenvolvimento do board, já que não tenho experiência prévia com o mesmo. A não inclusão de um banco de dados (como Mongo ou SQL), foi pelo mesmo motivo.

Quais princípios da engenharia de software que você usou?

 Os dois principais princípios utilizados, foram:
    DRY (Don't Repeat Yourself)
        Ao longo do desenvolvimento evitei ao máximo redundâncias e repetições ao longo do código, deixando apenas declarações duplicadas (como models) no back/front para melhor visualização.
    KISS (Keep It Simple, Stupid)
        Um código precisa ser facilmente compreensivel, sem comentários desnecessários e funções se assemelhem ao Fast inverse square root de Quake. Com isso em mente, acredito que o código tenha ficado extremamente simples para visualização e compreensão.

Desafios e problemas que você enfrentou e como você resolveu

Meu maior desafio foi, sem dúvida, o tempo. Como foi minha primeira vez com as tecnologias citadas, leitura da documentação levou uma grande parte do tempo, tornando o manejo do algo desafiador; entre leitura de doc, ponderação se deveria implementar ou não X tecnologia e o desenvolvimento em si.
Outro desafio que enfrentei foi a indecisão em relação a como estruturar o projeto, tentando fazer com que ele fique o mais simples possível e ao mesmo tempo o mais modular possível. Questões como: Devo criar um model para o card? Qual o jeito mais convencional de realizar e estruturar essa parte do projeto? Devo deixar models no front-end ou exclusivamente no back?

O que você entende que pode ser melhorado e como fazer isso

Várias coisas podem ser melhoradas:
    Implementação de um banco de dados, para dados persistentes
        Implementar PostgreSQL como banco e fazer a comunicação com o NestJs
    Utilização de GraphQL ao invés de REST
        Mudar a API para GraphQL
    Implementação de testes
        Implementar testes integrados e end-to-end, utilizando ferramentas como Jasmine, Jest, etc.
    Host em servidor
        Hospedar a aplicação em um servidor, para que a aplicação não seja apenas local
    Melhorias visuais
        Utilização de frameworks de CSS, ou apenas a melhoria do CSS utilizado, já que esse definitivamente não é meu ponto forte.

Contato

    Email: vitorddomingos@gmail.com
    Cel: Sou o Vitor Domingos no grupo do whatsapp da Field na Fatec! :)