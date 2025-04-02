#!/bin/bash

echo "Iniciando limpeza do projeto Angular..."

# Remover diretórios de cache e compilação
echo "Removendo diretórios temporários e de compilação..."
rm -rf .angular/cache
rm -rf dist

# Remover arquivos de teste que não são necessários para execução
echo "Removendo arquivos de teste..."
find . -name "*.spec.ts" -type f -delete

# Remover arquivos de configuração redundantes ou desnecessários
echo "Removendo arquivos de configuração desnecessários..."
rm -f tsconfig.spec.json
rm -f .eslintrc.json
rm -f .editorconfig

# Limpar arquivos de ambiente gerados
echo "Limpando arquivos de ambiente gerados..."
rm -f src/assets/runtime-env.js

# Substituir package.json pela versão limpa
echo "Substituindo package.json pela versão limpa..."
if [ -f package.clean.json ]; then
  cp package.clean.json package.json
  echo "  package.json substituído com sucesso."
else
  echo "  package.clean.json não encontrado. Mantendo o package.json original."
fi

# Limpar node_modules (opcional - descomente se necessário)
# echo "Removendo node_modules (isso exigirá reinstalação com npm install)..."
# rm -rf node_modules

echo "Limpeza concluída!"
echo "Para reinstalar dependências necessárias, execute: npm install"
echo "Os arquivos de ambiente (environment.ts, environment.prod.ts) serão gerados novamente ao executar npm start ou npm run build." 