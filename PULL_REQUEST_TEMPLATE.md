**Framework, linguagem e ferramentas**

### API

## 🚀 Tecnologias que uso
- **Linguagens:** ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)
- **Frameworks:** ![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black) ![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white) ![Angular](https://img.shields.io/badge/Angular-DD0031?style=flat-square&logo=angular&logoColor=white) ![NestJs](https://img.shields.io/badge/NestJs-E0234E?style=flat-square&logo=nestjs&logoColor=white)
- **Ferramentas:** ![Git](https://img.shields.io/badge/Git-F05032?style=flat-square&logo=git&logoColor=white) ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node-dot-js&logoColor=white) ![VsCode](https://img.shields.io/badge/Visual%20Studio%20Code-0078d4?style=flat-square&logo=visual-studio-code&logoColor=white) ![Linux](https://img.shields.io/badge/Linux-FCC624?style=flat-square&logo=linux&logoColor=black) ![Arch Linux](https://img.shields.io/badge/Arch%20Linux-1793D1?style=flat-square&logo=arch-linux&logoColor=white)
- **Outros:** ![GraphQL](https://img.shields.io/badge/GraphQL-E10098?style=flat-square&logo=graphql&logoColor=white) ![REST APIs](https://img.shields.io/badge/REST%20APIs-4c9c89?style=flat-square&logo=restful&logoColor=white) ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)

### Cliente

- **Framework:** Angular
  - Plataforma para construção de aplicações web dinâmicas, conhecida por sua modularidade e desempenho.
- **Linguagem:** TypeScript
  - Usada para garantir tipagem estática e melhorar a qualidade do código.
- **Ferramenta de Gerenciamento de Estado:** NgRx
  - Biblioteca para gerenciamento de estado reativo, baseada no padrão Redux.
- **Ferramenta de Comunicação com API:** Apollo Client
  - Usada para realizar consultas e mutações GraphQL no frontend, integrando-se facilmente com Angular.

**Técnologias X e Y**

#### API

**Tecnologia X: NestJS**

- **Justificativa:**
  - **Modularidade e Escalabilidade:** NestJS é construído em cima de conceitos modulares, o que facilita a organização do código e a escalabilidade da aplicação.
  - **Suporte Nativo ao TypeScript:** A integração nativa com TypeScript melhora a qualidade do código e facilita a manutenção.
  - **Ecosistema Rico:** Oferece uma ampla gama de bibliotecas e módulos integrados, como suporte a GraphQL, WebSockets e muito mais.
  - **Arquitetura Inspirada no Angular:** A arquitetura semelhante ao Angular facilita a curva de aprendizado para desenvolvedores familiarizados com Angular.

**Tecnologia Y: Express.js**

- **Justificativa para Não Utilização:**
  - **Menor Abstração:** Embora Express seja altamente flexível, ele oferece menos abstrações e funcionalidades prontas, o que pode aumentar o tempo de desenvolvimento para projetos complexos.
  - **Gerenciamento de Código:** Em grandes aplicações, a falta de uma estrutura modular pode levar a um código menos organizado e mais difícil de manter.

#### Banco de Dados

**Tecnologia X: PostgreSQL**

- **Justificativa:**
  - **Desempenho e Confiabilidade:** PostgreSQL é conhecido por seu desempenho robusto e sua confiabilidade em ambientes de produção.
  - **Funcionalidades Avançadas:** Suporte a JSON, indexação avançada, e extensões como PostGIS para geolocalização.
  - **Comunidade Ativa:** Uma comunidade ativa e um ecossistema rico de ferramentas e documentação.

**Tecnologia Y: MySQL**

- **Justificativa para Não Utilização:**
  - **Menos Funcionalidades Avançadas:** Embora MySQL seja muito eficiente, ele pode não oferecer algumas das funcionalidades avançadas que PostgreSQL proporciona, como suporte completo a JSONB e índices GIN.
  - **Consistência e ACID:** PostgreSQL oferece melhor conformidade com ACID, garantindo maior integridade transacional.

#### Cliente

**Tecnologia X: Angular**

- **Justificativa:**
  - **Arquitetura Estruturada:** Angular fornece uma arquitetura bem definida, facilitando a escalabilidade e manutenção do código.
  - **TypeScript:** O uso de TypeScript melhora a robustez do código, proporcionando tipagem estática e recursos avançados de IDE.
  - **Ferramentas de Desenvolvimento:** Angular CLI, Angular Universal para renderização do lado do servidor, e suporte integrado para testes tornam o desenvolvimento mais eficiente.
  - **Desempenho:** Ferramentas de otimização e suporte para renderização reativa melhoram a performance das aplicações.

**Tecnologia Y: React**

- **Justificativa para Não Utilização:**
  - **Menos Estruturado:** React é mais flexível, mas essa flexibilidade pode levar a diferentes abordagens arquitetônicas, o que pode complicar a consistência em projetos maiores.
  - **Configuração Inicial:** Requer mais configuração inicial para estabelecer um ambiente de desenvolvimento completo, especialmente em projetos maiores que necessitam de uma estrutura robusta e bem definida.

**Princípios de software**

### Princípios de Software

#### API

**Princípio de Separação de Preocupações (Separation of Concerns)**

- **Justificativa:** A arquitetura modular do NestJS permite a separação clara entre diferentes partes da aplicação, como controladores, serviços e módulos, facilitando a manutenção e a escalabilidade.

**Princípio da Inversão de Dependência (Dependency Inversion Principle)**

- **Justificativa:** O uso de injeção de dependência no NestJS promove um design desacoplado, onde os módulos e serviços podem ser facilmente substituídos ou testados isoladamente.

**Princípio de Reutilização de Software (DRY - Don't Repeat Yourself)**

- **Justificativa:** Utilizar módulos reutilizáveis e serviços compartilhados reduz a duplicação de código, aumentando a eficiência e a consistência.

#### Banco de Dados

**Princípio de Normalização**

- **Justificativa:** O uso de PostgreSQL com Prisma permite a criação de um esquema de banco de dados normalizado, reduzindo a redundância e melhorando a integridade dos dados.

**Princípio de ACID (Atomicidade, Consistência, Isolamento, Durabilidade)**

- **Justificativa:** PostgreSQL garante que as operações de banco de dados sejam realizadas de maneira confiável e segura, aderindo aos princípios ACID.

#### Cliente

**Princípio de Componentização**

- **Justificativa:** Angular promove o uso de componentes modulares, permitindo a reutilização e manutenção fácil de partes da interface do usuário.

**Princípio de Responsabilidade Única (Single Responsibility Principle)**

- **Justificativa:** Cada componente e serviço no Angular é responsável por uma única funcionalidade, facilitando a manutenção e a escalabilidade do código.

**Princípio de Gerenciamento de Estado**

- **Justificativa:** Utilizar NgRx (se aplicável) para gerenciamento de estado centralizado facilita a previsibilidade e o rastreamento das mudanças de estado na aplicação.

**Princípio de Testabilidade**

- **Justificativa:** Angular e NestJS ambos oferecem suporte robusto para testes, permitindo que as unidades e integrações sejam verificadas automaticamente para garantir a qualidade do software.

Esses princípios foram adotados para assegurar que a aplicação seja escalável, fácil de manter, segura e eficiente, seguindo as melhores práticas da engenharia de software.

**Desafios e problemas**

**Ciclos de Estados no Angular**

- **Descrição:** Um dos principais desafios enfrentados durante o desenvolvimento foi gerenciar os ciclos de estados no Angular. A complexidade aumentou à medida que a aplicação cresceu, resultando em dificuldades para manter o estado consistente e sincronizado.
- **Solução:** Para resolver esse problema, optei por utilizar a biblioteca NgRx. NgRx oferece um padrão de gerenciamento de estado baseado no Redux, que facilita a previsibilidade e o rastreamento das mudanças de estado na aplicação. Com NgRx, foi possível centralizar o estado, tornando a gestão mais clara e organizada, além de simplificar a depuração e a manutenção do código.

**Melhorias e próximas implementações**

**Melhorias no Gerenciamento de Estados do Cliente**

- **Descrição:** Atualmente, o gerenciamento de estados do cliente está utilizando três tipos distintos de estados globais como fontes de verdade. Isso tem criado complexidade e dificuldades para manter a consistência do estado na aplicação.
- **Solução Proposta:** Para melhorar essa situação, pretendo consolidar todas as fontes de verdade em um único estado global. Isso será feito criando uma cópia centralizada do estado do cliente e isolando as diferentes fontes de verdade. Ao depender de uma única fonte de verdade, será mais fácil garantir um fluxo de dados consistente e simplificar a manutenção do código.

**Passos para Implementação:**

1. **Auditoria do Estado Atual:** Revisar todos os estados globais existentes e identificar como e onde eles são utilizados.
2. **Criação de um Estado Global Unificado:** Desenvolver uma estrutura de estado global unificada que possa servir como a única fonte de verdade para a aplicação.
3. **Migração para o Novo Estado:** Refatorar o código existente para migrar todas as dependências e operações de estado para o novo estado global unificado.
4. **Testes e Validação:** Realizar testes extensivos para garantir que todas as funcionalidades da aplicação continuem a funcionar corretamente com o novo estado global.
5. **Documentação e Treinamento:** Atualizar a documentação da aplicação e fornecer treinamento aos desenvolvedores sobre como trabalhar com o novo estado global.

**Benefícios Esperados:**

- **Consistência de Dados:** Garantir que todos os componentes da aplicação estejam trabalhando com uma única fonte de verdade, eliminando inconsistências.
- **Facilidade de Manutenção:** Simplificar a lógica de gerenciamento de estado, facilitando a depuração e manutenção do código.
- **Melhor Desempenho:** Reduzir a complexidade de sincronização entre múltiplos estados globais, potencialmente melhorando o desempenho da aplicação.

Essas melhorias visam otimizar a gestão de estados no cliente, garantindo um fluxo de dados mais robusto e consistente.

**Vídeo de apresentação**

Grave um vídeo do seu projeto rodando e envie o link:

https://jam.dev/c/ca60adce-abbf-4299-8a2d-49ba14da495a

**Sobre você**

Eu sou natural de Sinop, Mato Grosso. Minha formação começou no Philadelpho Nogoveia Neto, onde me formei como Técnico em Mecânica. Posteriormente, iniciei uma graduação em Ciências Contábeis, na qual estudei por 4 semestres, mas não concluí. Recentemente, me formei como Desenvolvedor Full Stack pela Kenzie Academy.

Minha trajetória profissional inclui várias experiências. Fiz estágio na ICEC, especificamente em PCP - Mecânica Philadelpho. Trabalhei como auxiliar financeiro na Refrigeração Araçatuba e como auxiliar contábil no Compre Fácil Atacadista.

Meu envolvimento com desenvolvimento de software começou com a necessidade de facilitar meu dia a dia. Na ICEC, participei de um projeto que utilizava Java e Excel (VBA) para levantamento de homem-hora. Na Refrigeração Araçatuba, desenvolvi um sistema de cadastro e histórico de clientes em VBA. Já no Compre Fácil Atacadista, automatizei o tratamento de dados para o livro razão, o que me proporcionou uma experiência prática e me incentivou a seguir na área de desenvolvimento.

**Outros detalhes**

Se quiser enviar alguma informação adicional sobre o desafio..

---

Contato.
Email: souza.jonas.a@gmail.com.
Cel-watts: (17) 98148-6859

Social.
Linkdin:https://www.linkedin.com/in/jonas-alves-de-souza-61540b114/
GitHub:https://github.com/Jonasalvesdesouza
