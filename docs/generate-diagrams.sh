#!/bin/bash

# Script para gerar diagramas a partir dos arquivos PlantUML

# Verificar se o Java está instalado
if ! command -v java &> /dev/null; then
    echo "Java não está instalado. Por favor, instale-o primeiro:"
    echo "sudo apt install default-jre"
    exit 1
fi

# Diretório dos diagramas
DIAGRAMS_DIR="diagrams"
OUTPUT_DIR="diagrams/png"
PLANTUML_JAR="../tools/plantuml-1.2024.1.jar"

# Verificar se o JAR do PlantUML existe
if [ ! -f "$PLANTUML_JAR" ]; then
    echo "Arquivo JAR do PlantUML não encontrado em $PLANTUML_JAR"
    exit 1
fi

# Criar diretório de saída se não existir
mkdir -p "$OUTPUT_DIR"

echo "Gerando diagramas a partir dos arquivos PlantUML..."

# Processar cada arquivo .puml e gerar PNG
for file in "$DIAGRAMS_DIR"/*.puml; do
    if [ -f "$file" ]; then
        filename=$(basename -- "$file")
        name="${filename%.*}"
        echo "Processando $filename..."
        java -jar "$PLANTUML_JAR" -tpng -o "$(pwd)/$OUTPUT_DIR" "$file"
        echo "Diagrama gerado: $OUTPUT_DIR/$name.png"
    fi
done

echo "Todos os diagramas foram gerados com sucesso!"
echo "Os arquivos PNG estão disponíveis em: $OUTPUT_DIR/" 