# WiredHub
Um mock-project do github search com um simples tema da Serial Experiments Lain.

# Usagem
> npm install
> npm start
> npm test

# Tecnologias
* AngularJS
* Karma-Jasmine
* httpBackend
Para o desenvolvimento do projeto, optei por utilizar o AngularJS como framework principal. Embora não tivesse uma experiência extensa com ele no passado, exceto em pequenos projetos, decidi me desafiar e explorar mais a fundo suas capacidades. Durante o desenvolvimento do projeto, em particular, recorri ao Karma-Jasmine para executar os testes automatizados. Para simular as chamadas de API nos testes, optei por utilizar o httpBackend.

Durante o desenvolvimento do projeto, considerei diferentes tecnologias, incluindo o Django, com o qual eu já tinha experiência prévia em projetos anteriores. Embora o Django fosse uma opção viável, o escopo e as necessidades específicas do projeto favoreciam um frontend mais interativo e responsivo.

# Princípios de software
* MVC
* KISS
O padrão arquitetural MVC foi adotado para separar as responsabilidades dentro do código, tornando-o mais organizado e fácil de dar manutenção.
O KISS, por sua vez, enfatizou a importância de manter a simplicidade no projeto, evitando a introdução de complexidades desnecessárias.

# Notas
Durante o desenvolvimento, enfrentei desafios com async no AngularJS devido à natureza dos digest cycles. Para superá-los, utilizei o httpBackend nos testes e adotei o uso do .then para gerenciar a execução nos métodos da API. Essa abordagem permitiu uma sincronização mais eficiente e simples dos dados.
Para melhorar o projeto, podemos implementar tratamentos de erros mais abrangentes, como, por exemplo, lidar com problemas de conexão do usuário. Além disso, podemos aprimorar os testes, tornando-os mais complexos e robustos, adequados para um projeto de escala empresarial. Embora temos os testes atuais, para projetos maiores, eles poderiam ser mais detalhados.


E-mail para contato: nosj.in98@gmail.com