
**Qual ferramentas e bibliotecas (libraries, framework, tools etc) você usou**

Eu usei Angular 14 com typescript e Scss.

**Porque você optou pela tecnologia X e não a Y**

Optei pelo Angular para criar a SPA porque é o framework por causa do meu jeito de aprender programação, eu aprendo muito mais com exemplos de código e pelo jeito o angular é muito "fechado". Eu usei um service que julguei "global" em minha aplicação, pois contém poucas funcionalidades, e também para compartilhar dados entre a minha aplicação e
  Scss para organizar minha estilização de forma mais prática.

**Quais princípios da engenharia de software que você usou?**

Estruturei meu código no modelo MVW, mesmo sabendo que foi pedido no modelo MVC, porque o angular já é encapsulado dessa forma.

**Desafios e problemas que você enfrentou e como você resolveu**

O primeiro desafio foi como puxar as informações da api do pokemon com angular, Primeiro eu vi na documentação do angular que existe uma lib dentro do angular chamada: Http, então eu a usei para puxar os dados da páginação e os dados dos pokemons, com os métodos pipe e subscribe.
  e o último foi como irei mostrar as evoluções dos pokemons, já que algumas evoluções vem da api de diferentes formas, primeiro eu mudei o objeto que eu recebo do pokemon colocando um atributo evolução nele, depois eu criei uma função de loop com map dando um push nos nomes das evoluções até acabar, depois dei um ngFor desse push na card component.

**O que você entende que pode ser melhorado e como fazer isso**

As minhas próximas melhorias vão ser: quando voltar de algum card eu devo retornar na página que estava da home, quando entrar na home salvar as informações dos pokemons, colocar mais informações sobre os pokemons na página details, e estilizar melhor a minha página com design UX/UI.
Tudo isso pode ser implementado se eu estudar mais a documentação do angular, e fazer um bom curso de UX/UI.

[Link do projeto com Angular](https://github.com/otaviusedano/pokemon-search-V2)   
[Link em live deploy](https://pokemon-search-v2-angular.vercel.app/)

*Extra*
----

Eu demorei bastante tempo porque fiz esse mesmo projeto em reactJS na primeira vez, desisti de entregar este projeto porque vocês não usam reactJS no dia-a-dia da field, segundo o README do desafio, então resolvi estudar o básico e entregar o desafio com angular.

[Link do projeto com ReactJS](https://github.com/otaviusedano/pokemon-search-V2)  


*Para contato*
---

celular: (19) 998845086  
email: sedanootavio@gmail.com
