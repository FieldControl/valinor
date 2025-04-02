# Documentação Técnica - Kanban Fullstack

Este diretório contém a documentação técnica do projeto Kanban Fullstack, incluindo diagramas UML e instruções de deploy.

## Diagramas UML

Os seguintes diagramas foram criados para documentar a arquitetura e funcionamento da aplicação:

1. [Diagrama de Classes](diagrams/class-diagram.puml) - [PNG](diagrams/png/Diagrama%20de%20Classes%20do%20Kanban.png)
2. [Diagrama de Componentes](diagrams/component-diagram.puml) - [PNG](diagrams/png/Diagrama%20de%20Componentes%20do%20Kanban.png)
3. [Diagrama de Casos de Uso](diagrams/use-case-diagram.puml) - [PNG](diagrams/png/Diagrama%20de%20Casos%20de%20Uso%20do%20Kanban.png)
4. [Diagrama de Sequência](diagrams/sequence-diagram.puml) - [PNG](diagrams/png/Diagrama%20de%20Sequência%20-%20Mover%20Cartão.png)
5. [Diagrama de Implantação](diagrams/deployment-diagram.puml) - [PNG](diagrams/png/Diagrama%20de%20Implantação%20do%20Kanban.png)

## Como visualizar os diagramas

Os diagramas estão disponíveis em dois formatos:

1. **Código PlantUML (.puml)**: Arquivos fonte que podem ser modificados
2. **Imagens PNG**: Renderizações prontas para visualização e inclusão em documentação

### Visualizando códigos PlantUML

Os códigos PlantUML podem ser visualizados de várias formas:

1. Online: Use o [PlantUML Web Server](https://www.plantuml.com/plantuml/uml/)
2. IDE: Plugins disponíveis para VS Code, IntelliJ, Eclipse, etc.
3. Linha de comando: Usando o JAR do PlantUML

### Gerando imagens

Para (re)gerar as imagens PNG a partir dos arquivos PlantUML, execute o script:

```bash
./generate-diagrams.sh
```

Este script irá gerar as imagens PNG na pasta `diagrams/png/`.

## Estrutura da Aplicação

A aplicação é dividida em duas partes principais:

- **Frontend**: Aplicação Angular com componentes para board, colunas e cartões
- **Backend**: Servidor Node.js com Apollo Server e integração com Firebase 