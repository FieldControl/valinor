## ⚠️ Desafios Técnicos e Aprendizados

Durante o desenvolvimento deste projeto Kanban Fullstack, diversos desafios técnicos e conceituais foram enfrentados. Esta seção documenta os principais problemas identificados ao longo do ciclo de desenvolvimento, bem como as soluções adotadas e os aprendizados técnicos obtidos.

---

### 🧱 Arquitetura da Aplicação
- Definição inicial inadequada da separação de responsabilidades entre backend, frontend e camada de dados.
- Necessidade de reestruturação para adoção de arquitetura modular no NestJS.
- Ajustes na organização de módulos, services e resolvers para maior coesão e desacoplamento.

**Resultado:** arquitetura mais organizada, escalável e alinhada às boas práticas do NestJS.

---

### 🔗 Configuração do GraphQL (NestJS)
- Erros na configuração do `GraphQLModule` impactando a geração automática do schema.
- Ausência inicial de resolvers registrados corretamente no `AppModule`.
- Uso incorreto ou incompleto de decorators GraphQL (`@ObjectType`, `@Field`, `@InputType`).

**Resultado:** entendimento completo do fluxo de schema-first e code-first no GraphQL.

---

### 🗄️ Persistência de Dados (SQLite + TypeORM)
- Dificuldades na configuração do TypeORM, especialmente em `autoLoadEntities` e `synchronize`.
- Confusão inicial entre entidades de persistência e objetos de transferência de dados.
- Problemas de consistência causados por exclusão acidental do banco durante testes.

**Resultado:** modelagem de entidades consistente e maior controle do ciclo de vida dos dados.

---

### 🔄 Relacionamentos entre Entidades
- Implementação incorreta inicial de relacionamentos `OneToMany` e `ManyToOne`.
- Problemas de carregamento de dados relacionados e configuração de cascatas.
- Ajustes necessários para garantir integridade referencial.

**Resultado:** domínio prático de relacionamentos no TypeORM e impacto no GraphQL.

---

### 🧪 Operações GraphQL (Queries e Mutations)
- Mutations retornando valores nulos devido a inconsistências de tipagem.
- Erros identificados apenas em tempo de execução no GraphQL Playground.
- Uso inadequado de `@Args` e inputs tipados.

**Resultado:** operações GraphQL estáveis, tipadas e validadas antes da integração com o frontend.

---

### 🌐 Integração Backend ↔ Frontend
- Problemas de CORS durante consumo da API GraphQL.
- Configuração incorreta do endpoint GraphQL no frontend.
- Dificuldade em isolar falhas entre backend e frontend.

**Resultado:** pipeline de integração funcional e comunicação consistente entre as camadas.

---

### 🅰️ Estrutura do Frontend (Angular)
- Organização inicial inadequada de componentes, serviços e módulos.
- Necessidade de refatoração para alinhamento ao padrão do Angular.
- Ajustes para melhorar manutenibilidade e escalabilidade do código.

**Resultado:** frontend estruturado de forma modular e reutilizável.

---

### 🚀 Consumo de GraphQL com Apollo Client
- Configuração inicial incorreta do Apollo Client.
- Falhas na execução de queries e mutations por erros de setup.
- Dificuldades com gerenciamento de estado reativo.

**Resultado:** comunicação GraphQL estável e integração eficiente com o Angular.

---

### 🔐 Autenticação
- Implementação inicial simplificada para fins de aprendizado.
- Dúvidas sobre separação de responsabilidades entre frontend e backend.
- Falta de mecanismo avançado de controle de sessão.

**Resultado:** compreensão dos fundamentos de autenticação e segurança em aplicações web.

---

### 🌱 Controle de Versão (Git)
- Commits realizados em repositórios incorretos.
- Dificuldades iniciais com staging, branches e histórico de commits.
- Confusão com timestamps de arquivos versionados.

**Resultado:** domínio do fluxo básico de versionamento com Git.

---

### ⏱️ Gestão de Tempo e Curva de Aprendizado
- Aprendizado simultâneo de múltiplas tecnologias (Angular, NestJS, GraphQL, TypeORM).
- Desenvolvimento realizado em paralelo ao estudo teórico.
- Necessidade constante de refatoração durante o aprendizado.

**Resultado:** consolidação prática de conceitos através de desenvolvimento iterativo.

---

### 🔍 Debug e Análise de Erros
- Stack traces extensos e pouco claros.
- Dificuldade inicial em identificar a origem dos erros.
- Necessidade de interpretação detalhada de logs.

**Resultado:** desenvolvimento de habilidade analítica para diagnóstico e correção de falhas.

---

### 🔧 Dependências e Ambiente
- Avisos de pacotes depreciados no NPM.
- Avaliação criteriosa sobre atualização de dependências.
- Manutenção da estabilidade do ambiente de desenvolvimento.

**Resultado:** melhor compreensão sobre gerenciamento de dependências.

---

### 🧠 Refatoração e Qualidade de Código
- Código reescrito para melhoria de legibilidade e organização.
- Substituição de soluções funcionais, porém conceitualmente incorretas.
- Evolução contínua da base de código.

**Resultado:** código mais limpo, consistente e alinhado a boas práticas.

---

### 📘 Documentação Técnica
- Dificuldade inicial na produção de documentação técnica adequada.
- Evolução gradual para documentação estruturada e detalhada.
- Consolidação do entendimento técnico através da escrita.

**Resultado:** documentação como parte integrante do processo de desenvolvimento.
