# 🧪 Testes e Diagnósticos - Kanban Application

Este arquivo contém instruções para executar os testes e diagnósticos da aplicação.

## 🔍 Ferramenta de Diagnóstico Integrada

### Como Acessar
1. Execute a aplicação: `npm start`
2. Acesse: `http://localhost:4200/diagnostic`
3. Digite um ID de board para testar (ex: 1)
4. Clique em "Executar Diagnóstico"

### O que é Testado
- ✅ **Router**: Verificação se o Angular Router está funcionando
- ✅ **KanbanService**: Disponibilidade e métodos do serviço
- ✅ **API Connection**: Conectividade com GraphQL API
- ✅ **Board Retrieval**: Busca específica de um board
- ✅ **Data Structure**: Validação da estrutura dos dados retornados
- ✅ **Navigation**: Teste de navegação entre rotas

### Resultados do Diagnóstico
- 🟢 **Verde (Sucesso)**: Tudo funcionando corretamente
- 🟡 **Amarelo (Aviso)**: Funcionando, mas com problemas menores
- 🔴 **Vermelho (Erro)**: Problema crítico que precisa ser corrigido

## 🧪 Testes Unitários

### Executar Testes
```bash
# Executar todos os testes
npm test

# Executar testes específicos do fluxo de navegação
ng test --include='**/board-navigation.spec.ts'
```

### Arquivos de Teste
- `src/app/tests/board-navigation.spec.ts` - Testes do fluxo completo de navegação

## 🔧 Como Usar os Testes para Identificar Problemas

### 1. Problemas de API
**Sintomas:** Timeout, erro de rede, dados não carregam
**Como testar:**
```typescript
// No console do navegador (F12):
// Testar conexão direta
fetch('http://localhost:3000/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: '{ boards { id name } }'
  })
}).then(r => r.json()).then(console.log)
```

### 2. Problemas de Roteamento
**Sintomas:** Página não carrega, erro 404, URL não muda
**Como testar:**
- Acesse `/diagnostic` diretamente na URL
- Verifique se há erros no console
- Teste navegação manual: `/board/1`

### 3. Problemas de Serviço
**Sintomas:** Dados não aparecem, erro de injeção
**Como testar:**
- Verifique no diagnóstico se o KanbanService está disponível
- Veja se Apollo Client está configurado corretamente

### 4. Problemas de Dados
**Sintomas:** Board carrega mas sem colunas/cards, dados malformados
**Como testar:**
- Use o diagnóstico para verificar estrutura dos dados
- Veja se a API retorna todos os campos obrigatórios

## 🚨 Problemas Comuns e Soluções

### API não está rodando
**Erro:** `Failed to fetch` ou `Network Error`
**Solução:**
```bash
# Verificar se a API está rodando
curl http://localhost:3000/graphql
# ou
telnet localhost 3000
```

### CORS Error
**Erro:** `CORS policy` ou `Access-Control-Allow-Origin`
**Solução:** Configurar CORS no backend NestJS
```typescript
// main.ts do NestJS
app.enableCors({
  origin: 'http://localhost:4200',
  credentials: true
});
```

### Board não encontrado
**Erro:** `Board null` ou GraphQL error
**Solução:** 
- Verificar se o ID do board existe no banco
- Testar query GraphQL diretamente
- Verificar schema GraphQL

### Timeout na API
**Erro:** Requests demoram muito
**Solução:**
- Otimizar queries GraphQL
- Verificar performance do banco de dados
- Adicionar índices nas tabelas

## 📊 Interpretando Resultados

### Diagnóstico com Sucesso Total
```
✅ Sucessos: 6
⚠️ Avisos: 0  
❌ Erros: 0
```
**Significado:** Tudo funcionando perfeitamente

### Diagnóstico com Avisos
```
✅ Sucessos: 4
⚠️ Avisos: 2
❌ Erros: 0
```
**Significado:** Funciona, mas há melhorias possíveis

### Diagnóstico com Erros
```
✅ Sucessos: 2
⚠️ Avisos: 1
❌ Erros: 3
```
**Significado:** Problemas críticos que impedem funcionamento

## 🛠️ Debug Manual

### 1. Console do Navegador
```javascript
// Verificar se o Angular está carregado
ng.version

// Verificar rota atual
window.location.pathname

// Testar serviço (se disponível globalmente)
// Note: Isso só funciona em modo desenvolvimento
```

### 2. Network Tab
- Abra F12 → Network
- Navegue para um board
- Verifique se há requisições GraphQL
- Veja status code e response

### 3. Angular DevTools
- Instale a extensão Angular DevTools
- Veja component tree
- Inspecione serviços injetados
- Debug change detection

## 📝 Logs Úteis

### Ativar logs detalhados
```typescript
// No app.config.ts, adicione:
providers: [
  // ... outros providers
  { provide: 'DEBUG_MODE', useValue: true }
]
```

### Logs no KanbanService
```typescript
// Adicione logs temporários no service:
getBoard(id: number): Observable<Board> {
  console.log('🔍 Buscando board:', id);
  return this.apollo.watchQuery<{ board: Board }>({
    query: GET_BOARD,
    variables: { id },
  }).valueChanges.pipe(
    tap(result => console.log('📋 Board recebido:', result)),
    map(result => result.data.board)
  );
}
```

## 🎯 Checklist de Troubleshooting

### Antes de executar diagnóstico:
- [ ] API rodando em http://localhost:3000
- [ ] Frontend rodando em http://localhost:4200
- [ ] Console sem erros críticos
- [ ] Network requests chegando na API

### Durante o diagnóstico:
- [ ] Todos os passos executados
- [ ] Logs aparecem no console
- [ ] Sem erros de TypeScript
- [ ] Dados estruturados corretamente

### Após o diagnóstico:
- [ ] Problemas identificados
- [ ] Soluções aplicadas
- [ ] Re-teste executado
- [ ] Funcionamento confirmado

---

**💡 Dica:** Use o diagnóstico sempre que algo não estiver funcionando. Ele pode identificar rapidamente onde está o problema no fluxo de navegação!
