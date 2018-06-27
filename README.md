Oportunidade de trabalho na Field Control
===========================================

A empresa
----------

Somos um [SaaS (Software as a service)](https://pt.wikipedia.org/wiki/Software_como_servi%C3%A7o) para empresas que possuem prestadores de serviços externos. 

Entregamos **controle**, **organização** e **melhor relacionamento com o cliente** para empresas de Climatização, Segurança eletrônica, Telecom, Provedores de internet, Montadoras de móveis, Empresas de limpeza, enfim, qualquer empresa que possui uma equipe de campo para realização de serviços.

Nossa missão é melhorar a prestação de serviços no Brasil.

Condições
----------
- Regime de trabalho: CLT
- Período: Integral
- Onde: São José do Rio Preto / SP 

:house_with_garden: Você pode ler sobre nossa cidade no [G1](http://g1.globo.com/sao-paulo/sao-jose-do-rio-preto-aracatuba/especial-publicitario/prefeitura-de-rio-preto/rio-preto-noticias/noticia/2015/12/rio-preto-e-melhor-cidade-do-estado-e-segunda-do-pais-para-se-viver.html), [Infomoney](http://www.infomoney.com.br/minhas-financas/consumo/noticia/6391352/melhores-cidades-brasil-para-viver-veja-ranking) ou aqui na [Exame](https://exame.abril.com.br/brasil/o-ranking-do-servico-publico-nas-100-maiores-cidades-do-brasil/).

Trabalhamos com uma boa infraestrutura, nosso hardware é muito bom (você vai ter um notebook f#d@ com ssd e dois monitores :computer: :computer:) e possuímos um ambiente de trabalho muito agradável. A empresa não possui hierarquias e você é convidado e desafiado a colaborar com todas as frentes de trabalho. Ou seja, aqui todas sugestões são bem vindas!

Queremos a cada dia mais flexibilidade e continuar animados a evoluir nossas aplicações.

Nosso trabalho é baseado em autogestão. Só existe uma regra de convivência: É proibido murmurar! Aqui as opiniões são discutidas, resolvidas e sempre chegamos a um consenso para melhorar a nossa convivência. Isso não foi descrito por um gerente de RH e sim por um desenvolvedor de software.

Oportunidade
----------

Estamos em busca de desenvolvedores apaixonados pelo que fazem para somar no nosso time de desenvolvimento.

Aqui utilizamos [princípios ágeis](http://www.manifestoagil.com.br/) para criação de software e nosso clima é de extrema colaboração. 

Na Field, o seu dia-a-dia será repleto de:

```javascript
[
  'GitHub & Git <3',
  'Muito, muito e muito JavaScript',
  'Object-oriented programming, SOLID Principles & Design Patterns',
  'Práticas e princípios ágeis (Pair programming, Continuous Integration, Continuous Deployment)',
  'Testes de software (unitários, integração, e2e..)',
  'Desafios de escalabilidade',
  'Desafios de alta disponibilidade',
  'Micro services e aplicações distribuídas',
  'Amazon Web Services',
  'PAAS & Cloud Services',
  'Serverless apps',
  'AngularJS, Angular5+',
  'Material Design',
  'Open source software'
]
```

Nossa stack é praticamente toda em JavaScript: Node.js, SPA's e Hybrid Mobile Apps.

Mas acreditamos que bons desenvolvedores usam a melhor ferramenta para cada problema, então, para resolver alguns problemas bem específicos usamos a melhor alternativa disponível, por isso, temos uma pitada de C#, Java e PHP na nossa stack.

Nossos servidores estão na AWS e usamos a núvem como plataforma. Temos apps rodando no Elastic BeanStalk, S3, Heroku e Serverless na AWS Lambda :)

Os desafios de programação
----------

Se você **realmente ama** trabalhar com desenvolvimento de software e quer desafios pra sua carreira.. escolha um (ou os dois) dos desafios abaixo, faça um fork desse repositório e [let the hacking begin](https://www.youtube.com/watch?v=Dvrdxn0kHL8)

&lt;challenge&gt; Frontend Developer &lt;/challenge&gt;
----------

Desenvolva um SPA que permitirá que um usuário pesquise repositórios pelo nome (os resultados devem ser paginados) e exiba informações relevantes de um repositório, como URL, descrição, contagem de watchers, de estrelas, issues, etc.

Implemente o melhor design possível para a interface do usuário - resultados de pesquisa e pesquisa e seção de problemas.

Você pode usar Twitter Bootstrap, Google Material ou qualquer outro framework de interfaces da sua preferência.

SPA Framework? Aqui usamos bastante AngularJS e Angular5, mas use o que você preferir.. React, Vue, BackboneJS (existe ainda?) ou qualquer outro :)

Escreva seu código com clareza e use a estrutura adequada do MVC para escrever o aplicativo e use as melhores práticas ao escrever JavaScript, CSS e HTML.

URLs úteis:

|  URL  | Descrição      
|--------|                                  --- |            
| https://api.github.com/search/repositories?q=bootstrap | Exemplo de URL da API para pesquisar pelo nome do repositório  |
| https://api.github.com/search/issues?q=repo:username/reponame |  URL da API para exibir issues de um repositório  |

Documentação da API https://developer.github.com/v3/search/#search-issues e https://developer.github.com/v3/search/

A propósito, se você achar a API do Github um pouco `boring` demais, escolha outra coisa que você goste. 
Há algumas APIs bem legais disponíveis na Internet, por exemplo: [Star Wars](https://swapi.co), [Marvel](https://developer.marvel.com) ou Cats, whatever, a escolha é sua.

{ "challenge": "Backend Developer" }
----------

Desenvolver uma API JSON RESTful ou GraphQL em JavaScript expondo operações de um CRUD.

Se optar pela API REST, utilize todos os métodos (GET, POST, PUT, PATCH, DELETE)

Você terá que expor os seguintes endpoints para o recurso escolhido:

| Método | URL  | Comportamento esperado                               | 
|--------| ---  |                                                  --- |
| GET    | /resources     | Recupera a lista dos recursos, essa ação deve ser paginada e deve possibilitar busca pelas propriedades do recurso | 
| GET    | /resources/:id | Recupera um recursos em especifico pelo id | 
| POST   | /resources     | Insere um novo recurso                     | 
| PUT    | /resources/:id | Altera um recurso existente                | 
| PATCH  | /resources/:id | Altera parcialmente um recurso existente   | 
| DELETE | /resources/:id | Exclui um recurso existente                |

Se optar pela GraphQL API:

| Tipo      | O quê?  | Comportamento esperado                               | 
|--------   | ---     |                                                  --- |
| Query     | Recuperar lista dos items     | Recupera a lista dos items, essa ação deve ser paginada e deve possibilitar busca por propriedades | 
| Query     | Recuperar um item | Recupera um item pelo id | 
| Mutation  | Adicionar um item | Insere um novo item                     | 
| Mutation  | Atualizar um item | Altera um item existente                | 
| Mutation  | Excluir um item   | Remove um item existente                | 

- **Qual Web Framework?** pode ser Express.js, Hapi, Restify, Koa, fastify, graphql-js, graphql-yoga.. o que você preferir :P

- **Qual Banco de dados?** Mesmo pensamento, pode ser MongoDb, DynamoDb, Postgres, MySql.. enfim, não importa :)

Pense em algum recurso/item (use sua criatividade), pode ser gatos, personagens dos senhores do anéis, personagens da marvel, pokemon, enfim, o que você quiser..

 **Atenção:**
 Você deve se preocupar com sanitização, validação e semântica. 

Dúvidas?
----------
Abra um issue que nós responderemos :)

Avaliação
----------

Entre os critérios de avaliação estão:

- Código limpo e organização
- Testes de software (unitários e integrados)
- Semântica
- Documentação de código
- Documentação do projeto (README)
- Segurança

Entrega
----------

Você deve enviar a resolução do desafio via pull request nesse mesmo repositório :)

Gostariamos de entender como você pensa e as decisões que você tomou durante o desenvolvimento, então quando for enviar seu pull request, por favor responda:

- Qual ferramentas e bibliotecas (libraries, framework, tools etc) você usou
- Porque você optou pela tecnologia X e não a Y
- Desafios e problemas que você enfrentou e como você resolveu
- O que você entende que pode ser melhorado e como fazer isso

E ai? Let's code?
----------

<p align="center">
  <img src="https://raw.githubusercontent.com/FieldControl/valinor/master/cat.gif">
</p>
