## 📦 Envio da Solução

Para a construção de um aplicativo simples de **Kanban**, iniciei com uma pesquisa para compreender os fundamentos desse modelo de organização. Identifiquei que uma versão funcional e objetiva poderia ser estruturada com apenas três colunas principais:

- **To Do** (A fazer)  
- **Doing** (Em andamento)  
- **Done** (Concluído)

A proposta foi desenvolver uma aplicação com separação entre **frontend** e **backend**, utilizando **NestJS** no servidor e **Angular** no cliente. Posteriormente, integrei o frontend com **Ionic**, visando compatibilidade e boa experiência também em dispositivos móveis.

---

## 🧰 Tecnologias Utilizadas

### Backend

#### 🛠️ Frameworks e Ferramentas
- **NestJS** – Framework progressivo para construção de aplicações Node.js escaláveis
- **Docker & Docker Compose** – Para facilitar a configuração do ambiente e deploy

#### 🔗 API e Comunicação
- **GraphQL** – Para uma API mais eficiente, com requisições flexíveis
- **Apollo Server** – Integração entre NestJS e GraphQL
- **Socket.IO** – Comunicação em tempo real via WebSocket

#### 🗄️ Banco de Dados
- **PostgreSQL** – Sistema gerenciador de banco de dados relacional
- **TypeORM** – ORM para abstração e controle do banco de dados

#### 🧪 Testes e Qualidade de Código
- **Jest** – Testes unitários, integração e end-to-end (E2E)
- **ESLint** – Padronização e qualidade de código

---

### Frontend

#### 🛠️ Frameworks e Ferramentas
- **Ionic com Angular** – Para criação de interfaces modernas, responsivas e compatíveis com dispositivos móveis
- **Angular CDK (Component Dev Kit)** – Utilizado para funcionalidades de *drag and drop* de colunas e cards

#### 🔗 API e Comunicação
- **Apollo Angular** – Cliente GraphQL para Angular
- **Socket.IO Client** – Comunicação em tempo real com o backend

#### 🎨 UI e Estilo
- **Ionicons** – Biblioteca de ícones integrada ao Ionic, para uma interface mais rica e intuitiva

#### 🧹 Qualidade de Código
- **ESLint** – Aplicado para manter a consistência e boas práticas no código

---

## 🔍 Justificativa de Tecnologias

Durante o desenvolvimento da solução, procurei escolher tecnologias que se complementassem e trouxessem agilidade, escalabilidade e uma boa experiência tanto no desenvolvimento quanto para o usuário final.

### 🧠 Por que **NestJS** em vez de **Express**?

Optei pelo **NestJS** por ser uma abstração moderna e opinativa sobre o **Express**, oferecendo uma arquitetura escalável baseada em módulos, fortemente inspirada em conceitos do Angular. Além disso, ele já vem com suporte nativo a injeção de dependências, interceptadores, pipes, guards e outras ferramentas que facilitam a organização do código e a adoção de boas práticas desde o início.

> Em projetos mais complexos, isso reduz significativamente o tempo de manutenção e evolução da aplicação.

---

### 🔌 Por que **GraphQL** em vez de REST?

Utilizei **GraphQL** por sua flexibilidade e eficiência na comunicação entre frontend e backend. Com ele, o cliente pode solicitar exatamente os dados de que precisa, evitando requisições redundantes e reduzindo o consumo de rede — algo especialmente importante em aplicações mobile. Também facilita a evolução da API sem quebrar contratos existentes, algo que exige mais cuidado em REST tradicional.

> Além disso, o GraphQL se integra de forma natural com ferramentas como Apollo Client e Apollo Server, facilitando tanto o desenvolvimento quanto o debugging.

---

### 🎛️ Por que **Socket.IO**?

Para comunicação em tempo real, **Socket.IO** foi escolhido por sua simplicidade de uso, ampla adoção na comunidade e excelente documentação. Ele abstrai bem as diferenças entre WebSockets puros e outros transportes, mantendo a conexão estável e reconectando automaticamente em caso de perda de conexão.

> Outras soluções como WebSockets nativos exigiriam mais código e gerenciamento manual de reconexões e eventos.

---

### 🎨 Por que **Angular** em vez de **React** ou **Vue**?

A escolha pelo **Angular** se deu principalmente por seu ecossistema completo e pela forte integração com o **Ionic**, que foi utilizado na camada de UI. Além disso, Angular oferece um padrão claro de arquitetura, tipagem estática com TypeScript e ferramentas poderosas como o Angular CLI, facilitando a escalabilidade e manutenibilidade do projeto.

> É especialmente vantajoso quando se deseja padronização e robustez desde o início.

---

### 📱 Por que **Ionic**?

**Ionic** permite criar aplicações híbridas com aparência nativa usando tecnologias web. A integração com Angular é sólida, o que facilitou a implementação de um frontend que fosse tanto responsivo quanto otimizado para dispositivos móveis — sem a necessidade de desenvolver apps nativos independentes para Android ou iOS.

> Com ele, foi possível reutilizar 100% do código da UI em múltiplas plataformas.

---

### 🧹 Por que **ESLint**?

Usei o **ESLint** para garantir a padronização do código e evitar erros comuns de sintaxe e lógica. Ele é amplamente configurável, tem suporte nativo ao TypeScript e integração fácil com editores como VS Code, o que contribui para uma base de código mais limpa, consistente e confiável.

> Em comparação com outras ferramentas, como TSLint (descontinuado), o ESLint se manteve mais atualizado e com uma comunidade ativa.

---

## 🧠 Princípios de Engenharia de Software

Mesmo desenvolvendo o projeto de forma individual, busquei aplicar princípios fundamentais da engenharia de software, com foco em um código limpo, escalável e de fácil manutenção. Entre os principais princípios adotados, destacam-se:

- **Separação de responsabilidades (Separation of Concerns)**  
  Estruturei o código em módulos, componentes e serviços, garantindo que cada parte da aplicação tivesse uma função clara e bem definida.

- **Desacoplamento entre camadas**  
  As camadas de frontend, backend e comunicação estão bem isoladas, o que facilita a testabilidade e a evolução independente de cada uma.

- **Reutilização de código**  
  Evitei duplicações por meio da criação de funções utilitárias e componentes reaproveitáveis, promovendo consistência e economia de esforço.

- **Boas práticas de testes automatizados**  
  Implementei testes unitários e end-to-end com Jest, assegurando confiabilidade e estabilidade na aplicação.

- **Padronização de código com ESLint**  
  Utilizei o ESLint para manter a consistência do código, detectar erros precocemente e seguir boas práticas de desenvolvimento em toda a base do projeto.

- **Responsividade e acessibilidade na interface**  
  A interface foi construída com Ionic, priorizando a adaptação a diferentes tamanhos de tela e dispositivos, garantindo uma boa experiência para todos os usuários.

---

## 🧩 Desafios e Soluções

Durante o desenvolvimento do projeto, alguns desafios técnicos se destacaram:

- **Integração do sistema de _drag and drop_ com a persistência no backend**  
  Foi necessário alinhar a manipulação visual dos cards com a lógica de atualização no banco de dados, garantindo consistência entre a interface e os dados persistidos.

- **Atualizações em tempo real entre múltiplos usuários**  
  A sincronização de dados entre diferentes clientes exigiu a implementação de uma camada de comunicação eficiente com **Socket.IO**, o que impactou diretamente a organização do código e exigiu refatorações cuidadosas.

- **Testes automatizados no backend**  
  A escrita de testes **unitários** e **end-to-end (E2E)** com **Jest** exigiu atenção especial à simulação de fluxos com **WebSockets**, garantindo que as funcionalidades críticas do backend fossem validadas com segurança e previsibilidade.

- **Adaptação ao TypeORM**  
  Por estar habituado a ORMs como **Prisma** e **Eloquent (Laravel)**, foi necessário um tempo de adaptação à forma como o **TypeORM** lida com entidades, repositórios e migrations.

- **Refatorações após a introdução do Socket.IO**  
  A introdução da camada em tempo real alterou diversos fluxos do backend, exigindo refatorações estruturais para manter a coesão e clareza na lógica da aplicação.

Esses obstáculos foram superados por meio de estudo contínuo, testes incrementais, leitura da documentação oficial e boas práticas de engenharia de software.

---

## 🚀 Melhorias Futuras

Algumas melhorias planejadas para evoluir a aplicação incluem:

- **Autenticação de usuários com JWT**: garantir acesso seguro e individualizado.
- **Sistema de permissões e compartilhamento de quadros**: permitir colaboração com controle de acesso.
- **Histórico de movimentações**: registrar alterações em cards e colunas para rastreabilidade.
- **Interface aprimorada com temas personalizados**: oferecer uma experiência visual mais agradável e adaptável.
- **Integração com sistema de notificações**: manter os usuários informados sobre atualizações em tempo real.
- **Aprimoramento da lógica do Socket.IO**: reestruturar a comunicação em tempo real para maior robustez e escalabilidade.

---

## 🎥 Vídeo de Demonstração

Gravei um vídeo mostrando o funcionamento da aplicação.  
🔗 Link para o vídeo: [https://jam.dev/c/4a0df50e-ca86-484e-8481-3c6cecb8fcf3]

---

## 👤 Sobre Mim

Me chamo Matheus, sou natural de Tanabi-SP e atuo como desenvolvedor de software desde 2022. Possuo experiência com Laravel, JavaScript (tanto no backend quanto no frontend), além de Angular, um pouco de Next.js e NestJS. Também detenho conhecimentos em Docker, Flutter, Java, Git, GitHub, Postgres, MySQL, Python, C++, Laravel, PHP entre outras tecnologias.

Atualmente, sou estagiário na Prefeitura Municipal de Tanabi, onde atuo na área administrativa, contribuindo com a organização de arquivos e processos. Contudo, minha principal área de atuação é na manutenção e suporte técnico de sistemas relacionados à saúde pública, além de automatizar processos quando possível.

Minha trajetória profissional começou a partir de uma curiosidade natural por tecnologia. Sempre fui fascinado por computadores e por entender como as coisas funcionam. Curiosamente, o desenvolvimento de software não foi minha primeira opção acadêmica — ingressei no curso como segunda escolha, mas rapidamente percebi que havia encontrado minha verdadeira paixão. Desde 2022, curso Bacharelado em Sistemas de Informação no Instituto Federal, onde venho me aprofundando em diversas áreas, como Desenvolvimento Web, DevOps, Desenvolvimento Desktop, Estrutura de Dados, manipulação de bancos de dados e integração de soluções com inteligência artificial.

Candidatei-me a esta vaga por me identificar com a proposta da empresa, tanto pelo uso de tecnologias com as quais já tenho familiaridade (como Node.js e Angular), quanto pelos valores que ela preza — transparência, colaboração, comprometimento e adaptação às mudanças. São princípios com os quais me identifico profundamente e que acredito serem essenciais para conduzir projetos com excelência e manter a credibilidade de uma organização.

Tenho grande interesse em ser efetivado e fazer parte do time da empresa, contribuindo ativamente para o crescimento dos projetos e para o fortalecimento da equipe. Estou comprometido com minha evolução profissional e totalmente disposto a me mudar para São José do Rio Preto, caso necessário.

Agradeço a oportunidade de participar deste processo seletivo e realizar o teste técnico.
 
---

## 📞 Contato

- 📧 E-mail: matheuscervantes1@gmail.com
- 📱 Telefone: (17) 99675-0711

---

## 📄 Mais Detalhes

Para executar o sistema localmente com Docker, basta configurar o arquivo `.env` conforme orientações presentes no README do repositório `kanban-backend` e, em seguida, executar o comando:

```bash
docker-compose --env-file ./kanban-backend/.env up -d
```

Para informações detalhadas sobre como executar os projetos **sem Docker**, consulte os READMEs dos repositórios [`kanban-backend`](./kanban-backend/README.md) e [`kanban-frontend`](./kanban-frontend/README.md).
