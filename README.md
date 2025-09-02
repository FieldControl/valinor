# Envio de solução

Gostariamos de entender como você pensa e as decisões que você tomou durante o desenvolvimento, detalhe um pouco mais sobre:

**Framework, linguagem e ferramentas**

Frontend (Angular)

Angular CLI: para estruturação do projeto, geração de componentes e gerenciamento de build.

RxJS: para trabalhar com Observables e lidar com chamadas assíncronas da API.

TypeScript: linguagem principal no Angular, trazendo tipagem estática e melhor manutenção do código.

Backend (NestJS)

NestJS: framework baseado em Node.js, modular, que segue princípios de arquitetura limpa.

TypeScript: garantindo consistência entre front e back.

Controller + Service Pattern: para separar regras de negócio da camada de exposição (API).

**Técnologias X e Y**

TypeScript em vez de JavaScript puro:

Evita erros em tempo de execução por causa da tipagem estática, facilita a manutenção e o trabalho em equipe, já que os tipos servem como “documentação viva”, além de que nunca havia de fato mexico com javascript

**Princípios de software**

Escalabilidade: Tanto Angular quanto NestJS seguem arquitetura em camadas, o que permite adicionar novas features sem quebrar o que já existe.

Feedback rápido: Uso de Observables (RxJS) para atualizar a interface do Kanban em tempo real quando o backend responde.

**Desafios e problemas**

Um dos maiores desafios que enfrentei foi a implementação do drag & drop (arrastar e soltar) das tarefas entre colunas, no início, consegui fazer com que as tarefas fossem criadas e excluídas normalmente, mas ao tentar mover de uma coluna para outra tive muitas dificuldades para configurar corretamente o Angular CDK, ainda não sei exatamente como finalizar essa parte sozinho, mas durante o processo entendi melhor como o Angular lida com listas conectadas, eventos de arrastar e a atualização do estado do front-end.
Mesmo sem ter concluído totalmente, esse problema foi importante para mim, porque mostrou pontos em que preciso evoluir no estudo de frameworks e manipulação de dados no frontend.

**Melhorias e próximas implementações**

Finalizar a implementação do drag & drop de forma completa, permitindo que as tarefas sejam movidas entre colunas e que a nova posição seja salva no backend.

Melhorias visuais utilizando bibliotecas de UI ou estilização mais avançada para deixar a experiência mais agradável.

Edição de tarefas e colunas, possibilitando renomear títulos e descrições diretamente na interface.

**Sobre você**

Meu nome é Lucas Martins Trazzi, nasci em São José do Rio Preto – SP, onde moro atualmente.
Sempre tive interesse por tecnologia e comecei estudando cursos básicos de informática e inglês, depois iniciei no mundo da programação com Python e com um curso de Programação de Computadores.

Atualmente estou no 8º semestre de Ciência da Computação na UNIP, e já tive experiência prática como estagiário de TI em empresas como Fumeta Distribuidora de Tabaco e Maza Tarraf, onde pude desenvolver habilidades tanto em suporte quanto em infraestrutura.

Hoje meu objetivo é consolidar minha carreira na área de desenvolvimento de software, buscando aplicar o que aprendi e continuar evoluindo como programador.

**Outros detalhes**

Durante o desenvolvimento do desafio, a parte mais difícil foi a implementação do drag & drop. Consegui avançar bastante na estrutura do sistema, mas ainda não finalizei essa funcionalidade.
Mesmo assim, essa dificuldade foi importante, pois me mostrou áreas em que posso melhorar meus estudos, especialmente em frameworks como Angular.


---

lucasmartinstrazzi@gmail.com | (17) 98842-6272 
