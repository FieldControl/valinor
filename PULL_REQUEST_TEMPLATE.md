## Envio de solução

Gostariamos de entender como você pensa e as decisões que você tomou durante o desenvolvimento, detalhe um pouco mais sobre:

**Framework, linguagem e ferramentas**

Descreva ferramentas e bibliotecas (libraries, framework, tools etc) você usou.

Backend
Para o desenvolvimento do backend do meu projeto, selecionei uma série de ferramentas e bibliotecas fundamentais. Utilizei TypeORM e mysql2 para gerenciar as interações com meu banco de dados MySQL, com o TypeORM facilitando o mapeamento entre os objetos do código e as tabelas do banco, o que é essencial para a integridade e manutenção do banco de dados. Para operações assíncronas, adotei o RxJS, que me permite lidar com esses processos de forma mais elegante através da programação reativa.

A segurança é uma grande preocupação, e por isso, usei o bcrypt para garantir que todas as senhas sejam criptografadas antes de serem armazenadas. Para a gestão de autenticação dos usuários, implementei JWT (@nestjs/jwt), que usa tokens para manter as sessões seguras e verificar as identidades dos usuários de forma eficiente. Além disso, para gerenciar as configurações de forma segura, sem expor dados sensíveis, utilizei dotenv, que carrega variáveis de ambiente de um arquivo .env.

No desenvolvimento, para manter meu código limpo e consistente, utilizei ESLint e Prettier, que me ajudam a evitar erros comuns e garantir que o estilo do código seja uniforme. Para testar minha aplicação de forma eficaz, contei com Jest para executar testes unitários. E para otimizar meu trabalho de desenvolvimento, o NestJS CLI é uma ferramenta inestimável, automatizando a criação de novos componentes como módulos e serviços, acelerando significativamente meus processos de desenvolvimento.

Frontend
No lado do frontend do meu projeto, escolhi o Angular como framework principal. Ele me deu uma estrutura coesa e um conjunto de ferramentas para criar uma interface de usuário rica e interativa. Com Angular, que utiliza TypeScript, beneficiei-me da tipagem forte para escrever um código mais limpo e prevenir erros.

Para a interface, utilizei o Angular Material, que oferece um conjunto de componentes de UI prontos para usar que seguem os princípios do Material Design, ajudando a criar um layout atraente e responsivo com consistência visual. Complementarmente, o Angular CDK me auxiliou com ferramentas que suportam os componentes de UI, como comportamentos de acessibilidade e overlays.

Segurança e gerenciamento de estado são vitais no frontend também. Para decodificar tokens JWT e gerenciar sessões de usuário, recorri à biblioteca jwt-decode, que se integrou bem com o sistema de autenticação do backend. E para lidar com eventos e operações assíncronas, contei com a programação reativa fornecida pelo RxJS.

Para manter o código organizado e facilitar a manutenção, segui a estrutura recomendada pelo Angular, separando o código em módulos e serviços, e reutilizando componentes sempre que possível. A implementação de interceptores e guards me ajudou a gerenciar a segurança e o fluxo de navegação da aplicação.

Quanto ao desenvolvimento e testes, fiz uso do Angular CLI, que acelerou o processo de desenvolvimento ao automatizar tarefas como a criação de componentes e serviços, e a compilação do projeto. Para testes, configurei o Jasmine e o Karma, que são integrados ao Angular, para executar testes unitários e garantir a confiabilidade do código antes de ir ao ar.

Esse conjunto de ferramentas e práticas estabeleceram uma base sólida para o desenvolvimento do frontend, permitindo-me construir uma aplicação eficiente, segura e fácil de manter.

**Técnologias X e Y**

Justifique porque você optou pela tecnologia X e não a Y?

Backend
Para a construção do backend do meu projeto, fiz algumas escolhas estratégicas em relação às tecnologias, priorizando aquelas que melhor se adaptam às necessidades específicas do projeto e ao meu fluxo de trabalho. Aqui estão algumas das razões pelas quais escolhi certas tecnologias em detrimento de outras:

TypeORM vs. Prisma

Prisma: Prisma é mais novo e apresenta uma abordagem diferente, conhecida como Query Builder e ORM. Ele se destaca na simplicidade de configuração e na velocidade de execução das consultas.

TypeORM: Esta é uma solução ORM tradicional que oferece suporte completo ao TypeScript, o que facilita a integração com o restante do meu projeto em NestJS. 

Optei pelo TypeORM principalmente pela sua compatibilidade robusta com TypeScript e pela sua abordagem tradicional de ORM, que me dá um controle mais granular sobre as operações de banco de dados, algo crucial para as especificações detalhadas do meu projeto. Além de ser mais rápido para mim no momento.

NestJS sobre Express puro

Quanto à escolha do framework para o servidor, optei pelo NestJS em vez do Express puro principalmente por causa das exigências estruturais do projeto.NestJS oferece:

Estrutura Modular: NestJS organiza o código em módulos que podem ser facilmente reutilizados e injetados quando necessário. Esta estrutura modular é ideal para manter o código organizado e facilita a manutenção e a escalabilidade do projeto.

Injeção de Dependência: NestJS tem um sistema de injeção de dependência integrado que simplifica o gerenciamento de dependências e aumenta a eficiência do desenvolvimento.

Suporte Integrado para Padrões de Programação: Ele suporta padrões como MVC, facilitando a organização do código e melhorando a divisão de responsabilidades dentro da aplicação.

RxJS para gerenciamento de operações assíncronas

Preferi usar RxJS em vez de Promises tradicionais ou async/await porque RxJS fornece um modelo mais poderoso e flexível para lidar com fluxos de dados assíncronos e eventos. Seu modelo baseado em observáveis permite uma composição mais elegante e um controle mais fino sobre os efeitos colaterais, o que é crucial em uma aplicação backend onde múltiplas requisições e eventos precisam ser gerenciados de forma eficaz.

dotenv para gestão de configurações

Escolhi dotenv em vez de hard-codar configurações ou usar variáveis de ambiente diretamente porque dotenv permite uma gestão de configuração mais organizada e segura. Com dotenv, posso facilmente separar configurações sensíveis do código, como credenciais de banco de dados e chaves secretas, e gerenciar diferentes ambientes (desenvolvimento, produção, etc.) com facilidade, sem risco de expor dados sensíveis.

Essas decisões foram tomadas com o objetivo de maximizar a eficiência, a escalabilidade e a segurança do projeto, enquanto mantêm o código organizado e fácil de manter à medida que o projeto evolui.

Frontend

Para o frontend do meu projeto, a escolha do Angular na sua versão 17 não foi apenas preferencial, mas uma exigência do projeto. Angular oferece um ecossistema completo com ferramentas e extensões integradas, o que me permitiu trabalhar de forma mais eficiente e coesa.

Angular vs. Outros Frameworks

Comparado com outros frameworks como React ou Vue.js, que também são bastante poderosos e populares, o Angular se destaca por ser um framework holístico. Enquanto React e Vue podem exigir a instalação e configuração de várias bibliotecas adicionais para funcionalidades como roteamento ou gestão de estado, o Angular já vem com essas capacidades prontas para uso, o que facilita o gerenciamento e desenvolvimento de uma aplicação complexa.

Angular Material para Componentes de UI

Escolhi o Angular Material para construir a interface do usuário porque ele está em sincronia com a versão do Angular e fornece uma gama de componentes bem projetados, facilitando o desenvolvimento de uma UI consistente e responsiva. Comparado a outras bibliotecas de UI, Angular Material me ofereceu componentes que já estavam prontos para uso e bem testados, o que acelerou o processo de desenvolvimento.

RxJS para Programação Reativa

O RxJS é parte integrante do Angular, e sua escolha foi natural para gerenciamento de eventos assíncronos e estados. Ele oferece uma abordagem reativa que se encaixa perfeitamente com a arquitetura e o fluxo de dados do Angular, algo que bibliotecas alternativas, projetadas para outros ecossistemas, não poderiam fornecer com a mesma eficácia.

Jasmine e Karma para Testes

Jasmine e Karma são a dupla padrão para testes no Angular, permitindo a criação de testes unitários e de integração que são fáceis de configurar e executar, especialmente com a integração do Angular CLI.

SCSS para Estilos Dinâmicos

Para a estilização, o SCSS foi a minha escolha devido à sua compatibilidade e funcionalidades avançadas. Com ele, consegui manter os estilos dinâmicos e reutilizáveis, utilizando variáveis e mixins que o CSS puro não suporta.

A adoção do Angular 17 e dessas tecnologias não foi apenas uma decisão técnica, mas também um alinhamento com os requisitos do projeto. Essa estratégia garantiu que o desenvolvimento do frontend estivesse em sintonia com as melhores práticas e requisitos de desempenho, escalabilidade e manutenção determinados para o projeto.


**Princípios de software**

Quais princípios da engenharia de software que você usou?

Backend
No desenvolvimento do meu projeto, adotei uma abordagem modular, o que foi uma escolha bastante estratégica. Ao separar o projeto em módulos distintos como user, board, swimlane, e card, cada parte do sistema se tornou mais gerenciável e isolada, facilitando tanto a manutenção quanto a incorporação de novas funcionalidades sem mexer no que já estava feito.

Sem perceber, acabei seguindo alguns padrões de design consagrados, graças às convenções do NestJS. A injeção de dependência, por exemplo, veio com o pacote, e sem dúvida, ajudou a desacoplar as classes e a deixar o código mais limpo e mais fácil de testar. O NestJS, pelo que notei, parece adotar um padrão singleton para os serviços, o que significa que uma única instância é usada por todo o aplicativo, garantindo a consistência.

Os testes foram uma parte crítica do processo. Utilizei o Jest para executar testes unitários e end-to-end. Isso me ajudou a capturar bugs cedo e garantir que cada parte do sistema funcionasse como esperado antes de avançar para a próxima etapa do desenvolvimento. Foi um esforço para manter a qualidade desde o início.

Para garantir que o projeto pudesse crescer sem problemas, escolhi tecnologias conhecidas pela sua escalabilidade e uma arquitetura que facilita o gerenciamento de eventos, pensando sempre em como o sistema poderia se adaptar a um aumento na demanda ou na complexidade.

A segurança também foi uma grande preocupação para mim, especialmente no que diz respeito à autenticação dos usuários. Implementei JWT para gerar tokens seguros, o que me deu bastante tranquilidade quanto à proteção das sessões dos usuários e suas informações pessoais.

Embora eu não tenha tido a intenção explícita de seguir os princípios SOLID, muitos deles se manifestaram naturalmente através do uso do NestJS. Por exemplo, cada módulo e serviço tem uma responsabilidade clara e única, e a maneira como os módulos são estendidos, sem alterar os existentes, reflete o princípio de estar aberto para extensão, mas fechado para modificação. A injeção de dependência, por sua vez, alinha-se com a inversão de dependência, priorizando as abstrações em vez das implementações concretas.

Enfim, mesmo sem me dar conta de todos esses princípios no momento do desenvolvimento, eles estavam lá, orientando o projeto para um código mais saudável e um sistema mais robusto.

Frontend

Na construção do frontend do meu projeto, a exigência de usar Angular 17 já estabelecia um caminho orientado por princípios de engenharia de software. Angular promove uma estrutura modular e um ecossistema coerente, que naturalmente conduz a práticas de desenvolvimento sólidas.

Estrutura Modular e Componentização

Assim como no backend, o frontend foi estruturado de maneira modular. Dividi a aplicação em componentes e serviços dentro do Angular, o que não só facilitou o reuso e a manutenção do código, mas também aprimorou o gerenciamento de estado e a separação de responsabilidades. Cada recurso, como contas de usuário e quadros, foi encapsulado em seu próprio módulo, seguindo um padrão claro que permite a expansão sem grandes perturbações ao código existente.

Design Responsivo e Consistente

Com o uso do Angular Material, segui um design sistemático, assegurando uma experiência de usuário consistente e responsiva. Isso reflete os princípios de design de software onde a consistência na interface do usuário contribui para a facilidade de uso e previsibilidade da aplicação.

Reatividade e Gerenciamento de Estado

A utilização do RxJS em meu projeto foi essencial para gerenciar o estado e as operações assíncronas de forma reativa, uma prática recomendada para aplicações modernas de frontend. Essa escolha me permitiu lidar com streams de dados e eventos de usuário de uma forma que promove a escalabilidade e a facilidade de teste.

Princípios SOLID e Testabilidade

Embora não fosse meu foco inicial, percebi que os princípios SOLID foram aplicados de forma intrínseca graças às diretrizes e ferramentas que o Angular proporciona. O princípio de responsabilidade única, por exemplo, é evidente na maneira como componentes e serviços são organizados. Da mesma forma, os princípios de aberto-fechado e inversão de dependência são naturalmente incorporados na arquitetura Angular através da extensibilidade dos componentes e da injeção de dependência.

Para os testes, o framework Jasmine juntamente com o Karma foram usados para assegurar que cada parte da aplicação funcionasse corretamente antes de qualquer implantação. O Angular CLI simplificou a execução e a escrita de testes, o que garantiu que a testabilidade fosse uma parte integrada do desenvolvimento desde o início.

Performance e Segurança

A performance sempre esteve no radar durante o desenvolvimento, e as práticas recomendadas de otimização do Angular, como lazy loading e estratégias de detecção de mudança, foram aplicadas. A segurança do lado do cliente foi reforçada pelo uso cuidadoso de JWTs, garantindo que a autenticação e a autorização fossem tratadas de maneira segura.

Ao refletir sobre o desenvolvimento do frontend, vejo que os princípios da engenharia de software não foram apenas uma consideração teórica, mas uma parte prática do meu dia a dia, guiando as decisões de design e arquitetura do projeto.

**Desafios e problemas**

Conte um pouco sobre os desafios e problemas que você enfrentou e como você resolveu.

Backend && Frontend
Mergulhar em Angular e NestJS realmente foi sair da minha zona de conforto, pois não faziam parte da minha rotina. Encarei o projeto como um desafio pessoal, e posso dizer que aprendi muito. A parte mais empolgante? Ver tudo isso não apenas como um trabalho, mas como uma oportunidade de crescimento e aprendizado.

Ajustar o deploy foi um desafio técnico interessante. Foi como montar um quebra-cabeça complexo, onde cada peça precisava encaixar perfeitamente. Tive que configurar o frontend para conversar com o backend sem problemas e garantir que o backend aceitasse as requisições vindas do novo domínio. Após algumas tentativas, ajustes e muita pesquisa, tudo começou a fluir.

E os testes... Vindo de um ambiente onde não são comuns, foi praticamente uma revolução no meu modo de trabalhar. Aprendi não só a escrevê-los, mas também a apreciar o quão valiosos eles são para a qualidade do código. Foi uma mudança na minha maneira de pensar sobre desenvolvimento, adicionando uma nova camada de segurança e confiabilidade ao processo.

Cada obstáculo superado não só trouxe satisfação profissional, mas também acrescentou uma camada extra de conhecimento e experiência à minha carreira. E isso, para mim, valeu todo o esforço.

**Melhorias e próximas implementações**

O que você entende que pode ser melhorado e como isso pode ser feito?

Backend && Frontend
Acredito que o pricipal seria a funcionalidade de atribuir tarefas a diferentes usuários e criar equipes.

**Sobre você**

Queremos te conhecer um pouco melhor, conte um pouco sobre você.

Onde nasceu/De onde você é? Lugares que estudou, empresas que trabalhou, como você se envolveu com desenvolvimento de software.. enfim, Quem é você?

Sou o Nathan, nasci e cresci em São José do Rio Preto. Passei a minha vida estudantil entre o Colégio Interativo, Colégio Kelvin e o Colégio Coeso, e agora estou cursando Informática para Negócios na FATEC.

Comecei a trabalhar na área de BI na Novosys, onde fiquei por quase três anos. Lá, eu era o cara do Power BI e mais tarde, entrei no desenvolvimento. Atualmente, estou na JR Scatolon, desenvolvendo integrações WEB com o Protheus.

Meu interesse por tecnologia me levou ao desenvolvimento de software, um caminho que comecei a explorar graças aos materiais e cursos que um primo me passou. Hoje, aos 23 anos, continuo aprendendo e crescendo na área que escolhi seguir.

**Outros detalhes**

Se quiser enviar alguma informação adicional sobre o desafio..


---

Ah, deixe seu e-mail ou telefone para entrarmos em contato com você :) 

Acesso da aplicação para testes:
https://angular-front-kanban.vercel.app/

Email: nathanquirino123@gmail.com
Celular: 17 99160-2729


