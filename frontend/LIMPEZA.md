# Limpeza do Projeto Angular

Este documento contém instruções sobre como limpar o projeto Angular, removendo arquivos e diretórios desnecessários para execução.

## Arquivos e diretórios que podem ser removidos

1. **Diretórios temporários e de compilação:**
   - `.angular/cache`: Cache do Angular CLI
   - `dist`: Arquivos compilados para produção

2. **Arquivos de teste:**
   - Todos os arquivos `*.spec.ts`: Arquivos de teste que não são necessários para execução

3. **Arquivos de configuração redundantes:**
   - `tsconfig.spec.json`: Configuração do TypeScript para testes
   - `.eslintrc.json`: Configuração do ESLint (opcional se não for usar linting)
   - `.editorconfig`: Configuração do editor (opcional)

4. **Arquivos de desenvolvimento (opcional):**
   - `.vscode`: Configurações do VS Code (opcional)

5. **Simplificação de dependências:**
   - Foi criado um arquivo `package.clean.json` com apenas as dependências necessárias para execução
   - O script de limpeza substituirá automaticamente o package.json original por esta versão simplificada

6. **Arquivos de ambiente:**
   - Os arquivos de ambiente (`environment.ts`, `environment.prod.ts`) agora são gerados automaticamente pelo script `build-env-config.js`
   - O arquivo `environment.local.ts` foi removido para simplificar a estrutura

## Nova Estrutura de Environments

A configuração de ambientes foi simplificada para usar apenas:

1. `environment.ts` - Configuração para desenvolvimento
2. `environment.prod.ts` - Configuração para produção
3. `runtime-env.js` - Configurações em tempo de execução

Todos são gerados automaticamente durante o build. Para mais detalhes, consulte o arquivo `ENVIRONMENTS.md`.

## Como usar o script de limpeza

Foi criado um script `clean.sh` no diretório raiz do frontend para facilitar a limpeza. Para usá-lo:

1. Dê permissão de execução ao script:
   ```bash
   chmod +x clean.sh
   ```

2. Execute o script:
   ```bash
   ./clean.sh
   ```

3. Se necessário, reinstale as dependências:
   ```bash
   npm install
   ```

## Script de reconstrução

Foi criado também um script `rebuild.sh` que automatiza o processo de limpeza e reconstrução:

1. Dê permissão de execução ao script:
   ```bash
   chmod +x rebuild.sh
   ```

2. Execute o script:
   ```bash
   ./rebuild.sh
   ```

Este script irá:
- Executar a limpeza (clean.sh)
- Reinstalar as dependências (npm install)
- Construir o projeto (npm run build)

## Observações importantes

- O diretório `node_modules` **não** é removido pelo script por padrão, pois ele contém as dependências necessárias para a execução do projeto. Se você deseja remover este diretório também, descomente a linha correspondente no script.

- A limpeza manual também pode ser feita seguindo os comandos listados no script `clean.sh`.

- Lembre-se de que após a limpeza, o projeto ainda precisará de todas as dependências necessárias para funcionar corretamente.

- Os arquivos de ambiente serão gerados novamente ao executar `npm start` ou `npm run build`. 