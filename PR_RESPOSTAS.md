# Respostas para o Pull Request

## Ferramentas e Bibliotecas Utilizadas

### Frontend
- **Angular 19**: Framework principal para construção da interface do usuário
- **Apollo Angular**: Cliente GraphQL para Angular, facilitando a comunicação com a API
- **Angular CDK**: Componentes de base para desenvolvimento de interfaces, utilizado para drag-and-drop
- **Firebase**: Autenticação e persistência de dados
- **Angular Fire**: Integração entre Angular e Firebase
- **Angular Material (implícito nos componentes)**: Biblioteca de componentes visuais

### Backend
- **Node.js**: Ambiente de execução JavaScript server-side
- **Express**: Framework web para Node.js
- **GraphQL**: Linguagem de consulta para APIs
- **Apollo Server**: Implementação de servidor GraphQL
- **TypeGraphQL**: Criação de schemas GraphQL usando TypeScript e decorators
- **Firebase Admin**: SDK para acesso administrativo ao Firebase
- **Jest**: Framework para testes unitários e de integração

### Ferramentas de Desenvolvimento
- **TypeScript**: Superset de JavaScript com tipagem estática
- **ESLint**: Ferramenta de análise de código
- **Git**: Sistema de controle de versão
- **GitHub**: Plataforma para hospedagem e colaboração de código
- **GitHub Pages**: Para deploy da aplicação frontend

## Por que escolhi estas tecnologias?

### Angular vs React/Vue
Escolhi Angular por diversos motivos:
1. **Tipagem forte com TypeScript**: Angular utiliza TypeScript por padrão, o que facilita a manutenção do código e reduz erros em tempo de desenvolvimento.
2. **Framework completo**: Angular oferece soluções integradas para roteamento, formulários, HTTP, etc., enquanto React e Vue frequentemente exigem bibliotecas adicionais.
3. **Arquitetura baseada em componentes**: Facilita a organização do código e reutilização.
4. **Injeção de dependências**: Sistema robusto que facilita testes e desacoplamento de componentes.
5. **Especificamente requerido no desafio**: O teste pedia explicitamente o uso de Angular.

### GraphQL vs REST
Optei por GraphQL pelos seguintes motivos:
1. **Consultas flexíveis**: O cliente pode solicitar exatamente os dados necessários, evitando over-fetching.
2. **Única endpoint**: Simplifica a comunicação entre cliente e servidor.
3. **Tipagem forte**: Integra-se bem com TypeScript, proporcionando autocomplete e validação de tipos.
4. **Documentação automática**: A API se autodocumenta através de seu schema.
5. **Mencionado como diferencial no desafio**: O desafio mencionava GraphQL como um diferencial.

### Firebase vs Alternativas Tradicionais (PostgreSQL, MongoDB, etc.)
Escolhi Firebase porque:
1. **Rápida implementação**: Facilita a criação de um MVP sem exigir configuração de servidor de banco de dados.
2. **Autenticação integrada**: Sistema pronto para autenticar usuários com diferentes provedores.
3. **Sincronização em tempo real**: Capacidade de atualização em tempo real de dados.
4. **Escalabilidade**: Escalabilidade automática sem configuração adicional.
5. **Serverless**: Redução da complexidade operacional e de infraestrutura.

## Princípios de Engenharia de Software Aplicados

1. **SOLID**: 
   - **S (Single Responsibility)**: Cada componente e serviço tem uma única responsabilidade.
   - **O (Open/Closed)**: Estruturas extensíveis sem modificação direta.
   - **L (Liskov Substitution)**: Interfaces consistentes para tipos semelhantes.
   - **I (Interface Segregation)**: Interfaces específicas para necessidades específicas.
   - **D (Dependency Inversion)**: Uso de injeção de dependências para desacoplar componentes.

2. **DRY (Don't Repeat Yourself)**: Reutilização de código através de componentes compartilhados, serviços e helpers.

3. **Separation of Concerns**: Clara separação entre camadas de apresentação, lógica de negócios e acesso a dados.

4. **Clean Architecture**: Estruturação do projeto em camadas com dependências apontando para dentro.

5. **Component-Based Architecture**: Organização do frontend em componentes reutilizáveis.

6. **Model-View-Controller (derivado para serviços em Angular)**: Separação da lógica de negócios, apresentação e dados.

7. **Test-Driven Development**: Implementação de testes automatizados para garantir a qualidade do código.

## Desafios e Problemas Enfrentados

1. **Desafio**: Implementação do drag-and-drop para mover cartões entre colunas.
   **Solução**: Utilizei o Angular CDK para implementar o drag-and-drop, com uma lógica personalizada para refletir as mudanças no backend via GraphQL mutations.

2. **Desafio**: Sincronização dos dados entre múltiplos usuários.
   **Solução**: Implementei um sistema de polling otimizado com Apollo Client, que periodicamente verifica por atualizações no servidor, mantendo a interface atualizada.

3. **Desafio**: Autenticação e autorização para acesso aos quadros Kanban.
   **Solução**: Integrei o Firebase Authentication para gerenciamento de usuários e inclui verificações de autorização tanto no frontend quanto no backend.

4. **Desafio**: Organização da estrutura de dados para suportar múltiplos quadros, colunas e cartões.
   **Solução**: Projetei um schema GraphQL flexível que permite consultas e mutações eficientes para todos os níveis de entidades.

5. **Desafio**: Deploy da aplicação para demonstração.
   **Solução**: Configurei um pipeline de CI/CD utilizando GitHub Pages para o frontend e preparei o backend para deploy em serviços de hospedagem como Render ou Vercel.

## Melhorias Futuras

1. **Implementação de WebSockets**: Substituir o polling por WebSockets para obter sincronização em tempo real verdadeira.

2. **Expansão dos Testes**: Aumentar a cobertura de testes incluindo mais testes unitários, testes de integração e testes end-to-end.

3. **UI/UX Aprimorada**: Adicionar animações, temas (incluindo modo escuro) e melhorar a experiência em dispositivos móveis.

4. **Recursos Avançados**:
   - Filtros e pesquisa de cartões
   - Etiquetas coloridas para categorização
   - Datas de vencimento e notificações
   - Anexos e comentários nos cartões

5. **Otimização de Performance**: Implementar lazy loading, memoização e outras técnicas para melhorar a performance da aplicação.

6. **Melhorias de Segurança**: Adicionar autenticação de dois fatores, regras de firewall mais rígidas e auditorias de segurança regulares.

7. **Internacionalização**: Adicionar suporte a múltiplos idiomas para tornar a aplicação acessível globalmente. 