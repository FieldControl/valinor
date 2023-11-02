## Envio de solução

Gostariamos de entender como você pensa e as decisões que você tomou durante o desenvolvimento, detalhe um pouco mais sobre:

**Framework, linguagem e ferramentas**

- **Angular**: Optei pelo Angular, um framework do Google, para criar a aplicação. Ele é ótimo para criar interfaces de usuário e componentes reutilizáveis, o que facilita a manutenção e a escalabilidade do projeto.
- **Tailwind**: Para estilizar a aplicação, usei o Tailwind. Ele é bastante flexível e permite criar designs personalizados com facilidade, o que me permitiu replicar a aparência do GitHub de forma eficiente.
- **FontAwesome**: Para melhorar a interface do usuário, adicionei ícones com o FontAwesome. Isso ajudou a tornar a interface mais intuitiva e visualmente agradável.
- **Toastr**: Implementei notificações com o Toastr para fornecer feedback ao usuário sobre as ações realizadas. Isso melhora a experiência do usuário ao usar a aplicação.
- **Karma e Jasmine**: Para garantir que tudo está funcionando como deveria, usei o Karma e o Jasmine para realizar testes unitários. Isso me ajudou a identificar e corrigir problemas rapidamente durante o desenvolvimento.
- **Axios**: Para fazer as solicitações HTTP à API do GitHub, usei o Axios. Ele é simples e eficiente, tornando o código mais limpo e fácil de entender.
- **RxJS**: Usei o RxJS para lidar com programação reativa usando Observables. Isso facilitou muito o trabalho com código assíncrono ou baseado em callback, tornando o código mais previsível e fácil de gerenciar.

**Técnologias X e Y**

- Usei o Angular para desenvolver as aplicações de forma dinamica e de alto desempenho, optei pelo uso do Angular por ter mais conhecimento nele, e creio que ele é bem mais completo do que outro framework de JavaScript por incluir roteamento, gerenciamento de estado e ferramentas de desenvolvimento, alem de ser mantido pelo Google, que é uma empresa de confiança e que está anos no mercado.
- Usei o Axios para solicitações HTTP, poderia ter usado o fetch nativo do JavaScript, mas indo mais a fundo, descobri que o Axios fornece  uma API bem mais facil de utilizar, e suporte a dados JSON.
- usei o RxJS BehaviorSubject que é parte da biblioteca RxJS, ele fornece uma maneira de manter um valor que pode ser observado por varias partes do sistema. Poderia ter usado simples variaveis, mas a biblioteca tem diferenciais como criar fluxo de dados de forma melhor, e reagir a mudanças ao longo do tempo de maneira declarativa.

**Princípios de software**

1. **Separação de preocupações**: Eu dividi o aplicativo em componentes e serviços separados, cada um responsável por uma parte específica da funcionalidade.
2. **Reutilização de código**: Ao usar serviços e componentes, você pude reutilizar o código em diferentes partes do aplicativo.
3. **Modularidade**: O aplicativo é composto por módulos menores que podem ser desenvolvidos e testados independentemente.
4. **Manutenibilidade**: Ao seguir as convenções do Angular e organizar meu código de maneira lógica, eu tornei o código mais fácil de entender e fazer manutenções.
5. **Programação Reativa**: Usei o RxJS, que é uma biblioteca para programação reativa usando Observáveis, para lidar com eventos assíncronos, como chamadas HTTP à API do GitHub.
6. **Design Responsivo**: Usei o Tailwind CSS, um framework de CSS de baixo nível, para criar uma interface do usuário responsiva que se adapta a diferentes tamanhos de tela.
7. **Testes Unitários e de Integração**: Usei o Jasmine e o Karma para escrever e executar testes unitários e de integração para garantir que cada parte da aplicação funcione como esperado.

**Desafios e problemas**

Durante a execução deste projeto, deparei-me com alguns desafios significativos devido a Angular e Tailwind ser um pouco de novidade para mim. No entanto, encarei essas dificuldades como oportunidades de aprendizado e crescimento. Investi tempo na pesquisa das documentações pertinentes e revisão a aulas de cursos que já realizei para aprimorar meu conhecimento em ambas as tecnologias.

À medida que enfrentava problemas e obstáculos específicos, adotei uma abordagem sistemática para resolvê-los. Isso incluiu a análise detalhada das documentações, a participação em fóruns de desenvolvedores e perguntar para colegas mais experientes. Além disso, minha capacidade de adaptação me permitiu aprender rapidamente e aplicar o conhecimento adquirido para superar os desafios à medida que surgiam.

**Melhorias e próximas implementações**

Vejo oportunidades de melhoria no aplicativo. Uma delas é aprimorar a paginação, permitindo que os usuários escolham páginas específicas. Além disso, adicionar opções de filtragem para personalizar as consultas seria útil. Para otimizar o desempenho, poderíamos implementar um sistema de cache para evitar solicitações repetidas à API. Essas melhorias tornariam o aplicativo mais amigável e eficiente para os usuários, demonstrando o compromisso com a qualidade contínua.

Para melhorar a paginação, eu poderia criar um componente personalizado apenas para a paginação em vez de colocar a paginação no componente dos resultados, usando recursos de roteamento e parâmetros de consulta, e para filtragem, adicionaria um evento em um botão ou um dropdown que integra o filtro na url da api. E para o cache de resultado daria uma funcionalidade de interceptores do Axios para capturar as solicitações antes que sejam enviadas ao servidor.

**Sobre você**

Meu nome é Guilherme Carmona Matricola e sou natural de São José do Rio Preto, SP. Iniciei minha jornada na tecnologia na escola SESI Yolanda C. Bassitt, onde estudei de 2010 a 2021. Atualmente, estou no segundo semestre do curso de Informática para Negócios na FATEC Rio Preto, iniciado em 2023.

Desde cedo, fui fascinado pela tecnologia, o que me levou a explorar o desenvolvimento de jogos. Comecei com o Scratch, que me ensinou lógica de programação e algoritmos. Posteriormente, participei da equipe de robótica na Olimpíada Brasileira de Robótica, programando robôs Arduino em C++.

Minha especialização está no desenvolvimento Frontend, com foco em HTML, CSS e JavaScript. Estou animado para explorar frameworks como Angular, React, Next, Ionic, Tailwind, e etc.. JavaScript é minha linguagem favorita devido à sua versatilidade e capacidade de criar aplicativos web dinâmicos.

Estagiei na AnCode, onde trabalhei em UX design e desenvolvimento Frontend usando HTML, CSS, JavaScript, Bootstrap e C#. Minhas experiências moldaram meu entusiasmo e dedicação à programação. Estou ansioso para abraçar novos desafios e continuar aprimorando minhas habilidades.

---

Ah, deixe seu e-mail ou telefone para entrarmos em contato com você :) 

**Email**
guilherme.carmona86@gmail.com
**Telefone**
(17) 99222-5924