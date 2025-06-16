
# Sistema de Gerenciamento Kanban - Documentação Técnica

## Descrição
Sistema completo de gerenciamento de tarefas utilizando metodologia Kanban, desenvolvido com Angular (frontend) e NestJS (backend). O projeto permite criação de quadros, colunas e tarefas com funcionalidades de autenticação e autorização.

## Framework, Linguagem e Ferramentas

### Backend (API)
- **Framework**: NestJS
- **Linguagem**: TypeScript
- **Banco de Dados**: SQLite com TypeORM
- **Autenticação**: JWT (JSON Web Tokens)
- **Validação**: class-validator e class-transformer
- **Criptografia**: bcrypt para hash de senhas
- **Documentação**: Swagger/OpenAPI

### Frontend
- **Framework**: Angular 20
- **Linguagem**: TypeScript
- **Formulários**: Reactive Forms
- **Estilização**: SCSS
- **Ícones**: Font Awesome
- **Estado**: RxJS com Angular Signals
- **Build**: Angular CLI

### Ferramentas de Desenvolvimento
- **IDE**: Visual Studio Code
- **Controle de Versão**: Git
- **Gerenciador de Pacotes**: npm
- **Linting**: ESLint
- **Formatação**: Prettier

## Tecnologias - Justificativas das Escolhas

### Angular vs React/Vue
**Por que Angular?**
- Sistema de tipagem robusto com TypeScript nativo
- Reactive Forms para validação complexa
- Dependency Injection integrado
- Angular Signals para gerenciamento de estado reativo
- CLI poderoso para scaffolding e build

### NestJS vs Express/Fastify
**Por que NestJS?**
- Arquitetura modular inspirada no Angular
- Decorators para validação e transformação
- TypeORM integrado para abstração de banco
- Swagger automático
- Dependency Injection nativo

### SQLite vs PostgreSQL/MySQL
**Por que SQLite?**
- Simplicidade de configuração
- Ideal para desenvolvimento e prototipagem
- Zero configuração de servidor
- Portabilidade do banco de dados

### TypeScript vs JavaScript
**Por que TypeScript?**
- Tipagem estática reduz bugs em tempo de execução
- Melhor experiência de desenvolvimento com IntelliSense
- Refatoração mais segura
- Documentação viva através dos tipos

## Princípios de Engenharia de Software

### 1. SOLID
- **Single Responsibility**: Cada componente tem uma responsabilidade específica
- **Dependency Injection**: Utilizado extensivamente no Angular e NestJS
- **Interface Segregation**: Interfaces específicas para cada domínio

### 2. Clean Architecture
- Separação clara entre camadas (apresentação, domínio, infraestrutura)
- Inversão de dependências através de DI
- Isolamento de responsabilidades

### 3. DRY (Don't Repeat Yourself)
- Componentes reutilizáveis no frontend
- Services compartilhados
- Validações centralizadas

### 4. Convention over Configuration
- Estrutura padronizada do Angular
- Decorators do NestJS
- Naming conventions consistentes

## Desafios e Problemas

### 1. Gerenciamento de Estado
**Desafio**: Sincronização entre múltiplos componentes
**Solução**: Implementação de Angular Signals com RxJS para reatividade

### 2. Validação de Formulários
**Desafio**: Validações complexas e feedback em tempo real
**Solução**: Reactive Forms com validadores customizados

### 3. Autenticação e Autorização
**Desafio**: Proteção de rotas e persistência de sessão
**Solução**: JWT com interceptors HTTP para renovação automática

### 4. Tipagem End-to-End
**Desafio**: Manter consistência de tipos entre frontend e backend
**Solução**: Interfaces TypeScript compartilhadas

## Melhorias e Próximas Implementações

### Funcionalidades
- [ ] Drag & Drop para reordenação de tarefas
- [ ] Sistema de comentários em tarefas
- [ ] Notificações em tempo real
- [ ] Filtros e busca avançada
- [ ] Dashboard com métricas

### Técnicas
- [ ] Testes unitários e e2e
- [ ] Docker para containerização
- [ ] CI/CD pipeline
- [ ] Banco de dados PostgreSQL em produção
- [ ] Cache com Redis
- [ ] WebSockets para colaboração em tempo real

### Performance
- [ ] Lazy loading de módulos
- [ ] OnPush change detection
- [ ] Virtual scrolling para listas grandes
- [ ] Service workers para PWA

## Vídeo de Apresentação
[Link do vídeo será adicionado aqui]

## Sobre Mim

### Background
Sou desenvolvedor apaixonado por tecnologia, com experiência em desenvolvimento full-stack. Tenho interesse especial em arquiteturas escaláveis e experiência do usuário.

### Formação
- Graduação em [Curso]
- Certificações em desenvolvimento web
- Autodidata em tecnologias emergentes

### Experiência Profissional
- Desenvolvimento de aplicações web responsivas
- Experiência com metodologias ágeis
- Trabalho em equipe e code review

### Como me envolvi com desenvolvimento
Minha jornada começou com curiosidade sobre como as aplicações web funcionam. O que me fascina é a capacidade de criar soluções que impactam pessoas reais, combinando lógica, criatividade e tecnologia.

## Detalhes Adicionais

### Arquitetura de Pastas
```
valinor/
├── api/          # Backend NestJS
├── frontend/     # Frontend Angular
└── README.md     # Documentação principal
```

### Comandos Úteis
```bash
# Backend
cd api && npm run start:dev

# Frontend
cd frontend && ng serve

# Testes
npm run test
```

### Contribuições
Este projeto está aberto para contribuições. Veja as issues abertas para oportunidades de melhoria.
