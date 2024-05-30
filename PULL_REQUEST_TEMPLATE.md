## Envio de solução

Gostariamos de entender como você pensa e as decisões que você tomou durante o desenvolvimento, detalhe um pouco mais sobre:

**Framework, linguagem e ferramentas**

Para o back-end, foi utilizado o framwork NestJS, exatamente como pedido pelo desafio. Optei pela utilização do MongoDB (não-relaciona)como banco de dados, e por sua vez, utilizei do Mongoose para gerenciar as interações realizadas com o banco durante o desenvolvimento do projeto.

Nesse projeto, pelo modo que planejei as interações entre boards x usuários, necessitei implementar um sistema de login. Já que tive que entrar nesse mérito, continuei mais a fundo e implementei o login através de autenticação via token, utilizando o pacote jwt do nestJS, através da ampla documentação fornecida pelo próprio framework em seu site, visando assim um sistema mais seguro que o usual e que não manipula diretamente as credenciais dos usuários. 

Acho importante dizer que o nestJS facilita imensamente a execução de algumas tarefas. Através de poucas linhas de comando no console, o framework é capaz de criar estruturas completas de componentes, incluindo CRUD entry points, o que acabou sendo de extrema ajuda na otimização do tempo.

Partindo para o Frontend, utilizei o Angular, um framework muito completo e que forneceu tudo o que eu precisei para o desenvolvimento desse projeto.

Em paralelo com o que descrevi no back-end relacionado ao login, aqui no front foi utilizado um método de decodificação do token fornecido pelo fluxo login através da biblioteca jwt-decode. Ele foi necessários principalmente para identificar o tempo de expiração do token do usuário ativo e agir corretamente uma vez que este estiver expirado.

Além da utilização do Bootstrap, a biblioteca CdkDragDrop toma a frente por fornecer uma experiência única na manipulação de cards, que será melhor explicada mais a frente.

**Técnologias X e Y**

Justifique porque você optou pela tecnologia X e não a Y?

**Princípios de software**

Quais princípios da engenharia de software que você usou?

**Desafios e problemas**

Conte um pouco sobre os desafios e problemas que você enfrentou e como você resolveu.

**Melhorias e próximas implementações**

O que você entende que pode ser melhorado e como isso pode ser feito?

**Sobre você**

Queremos te conhecer um pouco melhor, conte um pouco sobre você.

Onde nasceu/De onde você é? Lugares que estudou, empresas que trabalhou, como você se envolveu com desenvolvimento de software.. enfim, Quem é você?

**Outros detalhes**

Se quiser enviar alguma informação adicional sobre o desafio..


---

Ah, deixe seu e-mail ou telefone para entrarmos em contato com você :) 



