#!/bin/bash

echo "Iniciando processo de reconstrução do projeto Angular..."

# Executar o script de limpeza primeiro
echo "Executando limpeza..."
./clean.sh

# Instalar as dependências
echo "Instalando dependências..."
npm install

# Construir o projeto
echo "Construindo o projeto..."
npm run build

# Corrigir estrutura de diretórios para servir a aplicação
echo "Corrigindo estrutura de diretórios..."
if [ -d "dist/kanban-board/browser" ]; then
  echo "Detectada estrutura do Angular 17+. Ajustando..."
  # Copiar arquivos de browser para o diretório principal
  cp -r dist/kanban-board/browser/* dist/kanban-board/
  echo "Arquivos copiados de browser para o diretório principal."
fi

echo "Reconstrução concluída! O projeto está pronto para uso."
echo "Para servir a aplicação, use: npx angular-http-server --path dist/kanban-board" 