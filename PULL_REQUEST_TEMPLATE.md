## Para instalar as depencências:
`yarn install`

## Para rodar o aplicativo no back-end:
`yarn start`

## Para rodar o aplicativo no front-end:
`ng serve`

## Para rodar os testes no back-end, abra a pasta kanban-field e execute os comandos:
`yarn test` para rodar os testes integrados de services e controllers
`yarn test:e2e` para rodar os testes end-to-end

## Para rodar os testes no front-end, abra a pasta kanban-front e execute os comandos:
`ng test` para rodar os testes unitários de componentes

## Envio de solução

Gostariamos de entender como você pensa e as decisões que você tomou durante o desenvolvimento, detalhe um pouco mais sobre:

**Framework, linguagem e ferramentas**

Para o back-end, foi utilizado o framwork NestJS, exatamente como pedido pelo desafio. Optei pela utilização do MongoDB (não-relaciona)como banco de dados, e por sua vez, utilizei do Mongoose para gerenciar as interações realizadas com o banco durante o desenvolvimento do projeto.

Nesse projeto, pelo modo que planejei as interações entre boards x usuários, necessitei implementar um sistema de login. Já que tive que entrar nesse mérito, continuei mais a fundo e implementei o login através de autenticação via token, utilizando o pacote jwt do nestJS, através da ampla documentação fornecida pelo próprio framework em seu site, visando assim um sistema mais seguro que o usual e que não manipula diretamente as credenciais dos usuários. 

Acho importante dizer que o nestJS facilita imensamente a execução de algumas tarefas. Através de poucas linhas de comando no console, o framework é capaz de criar estruturas completas de componentes, incluindo CRUD entry points, o que acabou sendo de extrema ajuda na otimização do tempo.

Se tratando de testes no back-end, utilizei o Jest para a criação de testes integrados de todos os services e controllers. Nesse projeto também implementei testes e2e (end-to-end) para cada módulo existente na aplicação, bem como as solicitações usadas no sistema final.

Partindo para o Frontend, utilizei o Angular, um framework muito completo e que forneceu tudo o que eu precisei para o desenvolvimento desse projeto.
Além de mencionar a utilização do Bootstrap, a biblioteca CdkDragDrop toma a frente por ter fornecido uma experiência única de Click and Drop na manipulação de cards, que será melhor explicada mais a frente.

Em paralelo com o que descrevi no back-end relacionado ao login, aqui no front foi utilizado um método de decodificação do token fornecido pelo fluxo login através da biblioteca jwt-decode. Ele foi necessário principalmente para identificar o tempo de expiração do token do usuário ativo e agir corretamente uma vez que estiver expirado.
Já nesse ponto de segurança, é importante deixar claro que diversos erros relacionados à autenticação e inexistência de itens no banco foram devidamente tratados no back-end, e consequentemente dei meu melhor para que esses pontos fossem refletidos no front, através de mensagens de erros nítidas para os usuários e redirecionamentos programados no componentes/services.

Se tratando de testes, fiz uso do Jasmine (framework que permite a criação de testes) e do Karma (ambiente de testes) para a criação de testes unitários em todos os componentes da aplicação.


**Técnologias X e Y**

NestJs: A escolha pelo NestJs (v10) foi baseada principalmente nas exigências desse desafio. Pessoalmente, posso dizer que adquiri um conhecimento enorme em um framework que pouco havia ouvido falar. Me ofereceu diversas ferramentas no desenvolvimento e possui uma documentação e materiais na internet extremamente ricos.

MongoDB e mongoose: Sobre as escolha so banco, optei por MongoDB por questões de aprendizado. Antes de entrar nesse desafio, havia começado a conhecer o BD mais a fundo, e para melhorar ainda mais esse conhecimento, preferi usar o banco NoSQL para o desenvolvimento desse projeot, que por sua vez atendeu muito bem minhas necessidades.
Em relação ao Mongoose, por se tratar da biblioteca de modelação de dados do MongoDB, fiz uso dela durante o decorrer desse projeto.

Sistema de login: JWT-strategy e local-strategy: Como havia mencionado, o sistema de login foi bem trabalhado nesse desafio graças a combinação de possibilidades e documentação do framework NestJS. As estratégias local e JWT, ambas extensões da PassportStrategy, foram utilizadas para tornar todo esse processo mais seguro e bem estruturado, onde a local-strategy é responsável por autenticar o usuário com base em suas credenciais, e a JWT-strategy é responsável por autenticar as solicitações feitas pelos usuários.

Jest: Para os testes integrados e e2e, fiz a utilização do Jest, framework de testes padrão do NestJS. Previamente, nunca havia desenvolvido testes utilizando Jest, então todo o caminho trilhado no desenvolvimento de testess desse projeto foi extremamente enriquecedor, onde adquiri não somente o conhecimento para desenvolver os testes, mas também a importância de ver seus funcionamentos na prática.

Front-End

Angular: A escolha do framework Angular(v17) foi dada também pela exigência na descrição do desafio. Apesar de já possuir um leve conhecimento prévio, o desafio com certeza levou a outros patamares. É um framework muito poderoso, e para esse desafio específico, supriu todas as necessidades e forneceu tudo que procurei.

Interface e Responsividade: Para o a interface, fiz o uso do Bootstrap, que já fornece uma gama de componentes que pude usar e reutilizar em meu código.
Em termos de responsividade, fiz o uso de media queries, tentando simular alguns diferentes cenários de visualização. Tentei adaptar a interface da melhor forma possível, para que fique acessível e agradável independente do tamanho da tela.  

CdkDragDrop: Por fazer parte de uma das funcionalidades mais chamativas da aplicação, menciono o uso da biblioteca CdkDragDrop, que foi crucial para o desenvolvimento do sistema de clicar e arrastar cartões, permitindo a mudança de cartões entre colunas diferentes ou uma mesma coluna.

Lazy Loading: Fiz a utilização de lazy loading dos componentes, onde o carregamento dos recursos é feito conforme necessário, e não feito de uma vez só, o que poderia acarretar em um aumento do tempo de carregamento inicial.

**Princípios de software**

Abstração: No projeto, é possível observar a utilização desse tópico nos usos dos DTOs e Documents.

Modularidade: Ao desenvolver o projeto através da criação de diversos módulos menores como cards, users, columns, etc, fiz uso do princípio de modularidade. A utilização desse princípio facilita a manutenção e promove a reutilização, além de ser mais fácil de compreender e corrigir, de forma geral.

Manutenibilidade: O uso de abstrações (como já mencionado) e injeções de dependência durante o decorrer da aplicação exemplificam o uso desse princípio. Alguns dos princípio do SOLID também mostrarão isso, mais abaixo.

Reusabilidade: Esse princípio é promovido através da definição dos diversos services existentes no projeto.

Testabilidade: Nesse projeto, tentei fazer com que os testes cobrissem a maior parte dos cenários possíveis, desde testes integrados até os e2e. Neles, foram feitos usos de mocks para simular cenários, a estrutura foi organizada através dos "describes" e "it", bem como as configurações em "before"s e "after"s

Escalabilidade: O design modular dos services e a separação de responsabilidades entre eles realçam a presença desse princípio.

S.O.L.I.D: Durante o decorrer do projeto, é possível perceber a utilização dos princípios SOLID. 
Os métodos nos services, por exemplo, exemplificam o princípio de Responsabilidade Única (Single Responsiblity Principle), onde cada um cuida de sua função.
Já o Open/Closed Principle pode ser observado em algumas das funções de find, por exemplo, onde elas podem ser estendidas para incluir novas funcionalidades (novas formas de filtragem, por exemplo).
No Interface Segregation Principle, é possível ver que na aplicação, as classes não são obrigadas a implementar métodos que não usam.
É possível também mencionar a Dependency Inversion Principle, onde as classes dependem de abstrações (no caso, seria interessante mencionar os Documents).

Segurança: Ao usar do sistema de login por tokenização, e proteger as endpoints com o JwtAuthGuard exemplifica bem a utilização desse tópico no projeto.

**Desafios e problemas**

De forma geral, gostei de levar esse desafio realmente como um desafio. Busquei durante todo o processo implementar funcionalidades que realmente fizessem a diferença, e quando fiz isso, fui até o fim. Só de ter feito isso, de ter a necessidade de buscar como cada coisa e cada conceito funcionava, foi desafio diferente.

Sobre as maiores dificuldades que tive nesse projeto, acredito que um probleminha que gastou um tempo a mais comigo foram os erros de referência circular nos modules ao rodar o backend.

A implementação do token também foi algo desafiador, não somente o back-end, mas também a forma como eu iria lidar com ele no front.

**Melhorias e próximas implementações**

Uma melhoria que gostaria de pontuar por não ter realizado no projeto, foi o refresh automático do token.
O token em si possui um tempo de expiração. Quando esse tempo expira, o token é invalidade e, consequentemente, o usuário logado deixa de ter acesso às requisições da aplicação.
Apesar de ter iniciado a implementação de algo que buscaria fazer esse refresh e implementação de novo token automaticamente, decidi não continuar e colocar minha atenção em pontos-chave mais importantes do projeto. Atualmente, coloquei um tempo maior de expiração de token e um aviso em tela ao usuário caso anda assim esse tempo for atingido. Com isso, o usuário é automaticamente redirecionado à tela de login.

Fora isso, creio que tudo pode ser melhorado com o devido tempo e atenção. Gostaria de ter dado uma atenção maior ao design das telas também, apesar de estar feliz com o resultado atingido.

Diversos métodos nos serviços podem ser refatorados para uma melhor versão, e creio que tratativas de erros também poderiam ser refinadas, tanto nos serviços quanto no controllers. Apesar de tudo, estou contente com o resultado final.

Padronização dos commits - Ao decorrer do projeto, aprendi sobre semânticas dos commits. Apesar de não ter seguido, é um ponto a ser melhorado no futuro

**Vídeo de apresentação do projeto**

https://drive.google.com/file/d/165bGgnxDaSRvvzsG6sGv8XW0o0-kHQAZ/view?usp=sharing

**Sobre você**

Meu nome é Jonathan Garcia Speçamillio. Nasci na cidade de São José do Rio Preto e moro desde então na cidade de Cedral (alguns poucos minutos de São José do Rio Preto).
Estudei minha vida inteira em escolas daqui de minha cidade, públicas e estaduais, e em 2021 decidi cursar Análise e Desenvolvimento de Sistema na FATEC, onde me formei fim do ano passado/ início de 2024. Desde então, desenvolvimento de software vêm sendo minha área favorita.

Durante o meu curso, fui estagiário na Filed Control, porém, como analista de processos, onde eu, juntamente com meu time, criávamos novos processos e buscávamos melhorar aqueles existentes na empresas, afim de sempre melhorar a performance e os serviços das outras áreas da empresa.

Desde sempre gostei de tecnologia, e desde bem cedo já comecei a buscar conhecimentos através da prática, onde comecei a formatar computadores.
Na faculdade, a gente adquire um pouco de conhecimento em tudo, porém no decorrer do curso, vi que a área de desenvolvimento é a que eu queria.

Desde o começo desse ano (quando me formei) venho me dedicando aos estudos em desenvolvimento. Venho desenvolvendo projetos através de videoaulas e tentando aplicar os mesmos enquanto programo.

**Outros detalhes**

Esse desafio me ajudou demais adquirir novos conhecimentos em áreas que antes não possuía, e a crescer como desenvolvedor em si. Me dediquei bastante em fazer um projetinho bem bacana, espero que gostem.

---

Email: jonathan.specamillio@hotmail.com Celular: (17) 99246-0320



