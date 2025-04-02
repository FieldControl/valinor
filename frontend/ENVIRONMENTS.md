# Configuração de Ambientes

Este documento explica a estrutura simplificada de configuração de ambientes no projeto Angular.

## Visão Geral

A configuração de ambientes foi simplificada para usar:

1. `environment.ts` - Configuração para desenvolvimento (usando URL GraphQL de produção)
2. `environment.prod.ts` - Configuração para produção (usando URL GraphQL de produção)

**IMPORTANTE**: Ambos os ambientes agora usam a mesma URL do GraphQL apontando para o servidor de produção na Render (`https://kanban-deploy-fmfj.onrender.com/graphql`).

## Como Funciona

### 1. Configuração das Variáveis de Ambiente

As variáveis de ambiente são definidas no arquivo `.env` na raiz do projeto frontend:

```env
# Firebase Configuration
FIREBASE_API_KEY=AIzaSyBIFBiPZqegXg9_rlmhA3TvwiCsYmgUTno
FIREBASE_AUTH_DOMAIN=kanban-board-bbf3b.firebaseapp.com
FIREBASE_PROJECT_ID=kanban-board-bbf3b
FIREBASE_STORAGE_BUCKET=kanban-board-bbf3b.appspot.com
FIREBASE_MESSAGING_SENDER_ID=347147579688
FIREBASE_APP_ID=1:347147579688:web:f80a0a269d2ed8a680201d
FIREBASE_MEASUREMENT_ID=G-BGWP5N6DHC

# API URLs - usando apenas a URL de produção
GRAPHQL_URL=https://kanban-deploy-fmfj.onrender.com/graphql

# Environment
NODE_ENV=development
```

### 2. Processo de Build

1. Quando você executa `npm start` ou `npm run build`, o script `build-env-config.js` é executado primeiro
2. O script gera dinamicamente os arquivos `environment.ts` e `environment.prod.ts` com base nas variáveis de ambiente
3. Também gera um arquivo `runtime-env.js` com configurações que podem ser alteradas em tempo de execução

### 3. Conexão com a API

O módulo GraphQL foi configurado para sempre conectar-se diretamente à URL da API de produção:
```
https://kanban-deploy-fmfj.onrender.com/graphql
```

## Variáveis de Ambiente Disponíveis

| Variável | Descrição |
|----------|-----------|
| `GRAPHQL_URL` | URL do GraphQL (sempre aponta para produção) |
| `FIREBASE_*` | Configurações do Firebase |
| `NODE_ENV` | Ambiente atual (`development` ou `production`) |

## Executando o Projeto

1. Para desenvolvimento (com conexão à API de produção):
   ```bash
   npm start
   ```

2. Para build de produção:
   ```bash
   NODE_ENV=production npm run build
   ```

3. Para servir a aplicação após build:
   ```bash
   ./rebuild.sh
   npx angular-http-server --path dist/kanban-board
   ```

## Por que esta abordagem?

Esta abordagem foi adotada para:

1. **Simplificar a configuração**: Usar uma única URL para todos os ambientes
2. **Garantir consistência**: Evitar problemas de conexão com diferentes ambientes
3. **Facilitar testes**: Permitir que o desenvolvimento seja testado diretamente contra os dados de produção 