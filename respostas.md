**Pergunta 1: Framework, linguagem e ferramentas && Pergunta 2: Técnologias X e Y**

Optei pela utilização de NodeJS com express para controlar as chamadas à API devido seu o poder e ótima legibilidade de código. Além disso outro fator importante para a decisão foi a curva de aprendizado de determinadas tecnologias, uma vez que, aprender a utlizar a stack de tecnologias e recursos dessa api foi mais fácil do que por exemplo eu optasse em fazer um CRUD com algum framework que eu não conheço bem a linguagem como Djangop(Python) ou Ruby on Rails. (Levando em conta o background que o desenvolvedor possui no desenvolvimento de aplicações)

Embora NodeJs seja um sistema single-threaded, ele é extremamente poderoso e versátil, e ainda permite com que api desenvolvida (mesmo que muito simples) se torne extremamente escalável, como em vários cases de sucesso (Uber, Paypal), de acordo com o líder de desenvolvimento mobile do LinkedIn  Kiran Prasada “Foi rápido acima de qualquer padrão”.

Para a realização de testes decidi o uso das bibliotecas Mocha e Supertest, por já ter feito cursos com as mesmas e além disso deixarem o código bastante semântico para o desenvolvedor. 

**Desafios e problemas**

O maior desafio no desenvolvimennto dessa API, no meu caso, foi como aplicar as malhores práticas de desenvolvimento de aplicações em um projeto REST API em Javascript, uma vez que nunca tinha feito isso nessa linguagem. Embora no começo tenha surgido algumas dúvidas, optei por realizar basicamente alguns conceitos SOLID no desenvolvimento, os principais foram:

    * Single responsibility principle - Tentei separar as responsabilidades em setores como (Serviço, acesso a dados no BD, e o controle de rotas das chamadas da API).
    * Dependency inversion principle - Principio de injeção de dependências realizado nas configurações de "custom-empress.js"

**Melhorias e próximas implementações**

Já mexi um pouco com Typescript em aplicações como Ionic, e na minha opnião, manipular classes, interfaces, encapsulamentos é mais dinâmico e fácil do que em javascript puro. Então talvez com a inserção de transpiladores para utilização de Typescript seria um marco que poderia melhorar ainda mais as boas práticas de código.


