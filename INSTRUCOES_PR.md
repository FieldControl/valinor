# Instruções para Submeter o Pull Request

## Preparação

1. Certifique-se de que o código está funcionando corretamente e todos os testes estão passando.
2. Verifique se você tem uma conta GitHub e está logado.
3. Certifique-se de que todos os arquivos necessários estão incluídos no seu repositório atual.

## Passos para Criar o Pull Request

### 1. Fazer um Fork do Repositório

1. Navegue até o repositório oficial no GitHub: https://github.com/FieldControl/valinor
2. Clique no botão "Fork" no canto superior direito da página.
3. Isso criará uma cópia do repositório na sua conta do GitHub.

### 2. Clonar o Fork

1. Após o fork ser criado, copie a URL do seu fork (algo como `https://github.com/SEU_USUARIO/valinor.git`)
2. Abra um terminal e clone o repositório:
   ```
   git clone https://github.com/SEU_USUARIO/valinor.git
   ```
3. Entre no diretório do repositório:
   ```
   cd valinor
   ```

### 3. Adicionar Seu Código ao Fork

Você tem duas opções:

#### Opção 1: Copiar os arquivos manualmente
1. Copie os arquivos do seu projeto atual (backend, frontend, docs) para o repositório clonado.
2. Certifique-se de copiar também o README.md e o PR_RESPOSTAS.md que criamos.

#### Opção 2: Usar Git para transferir o código
1. No seu repositório atual, adicione o fork como um repositório remoto:
   ```
   git remote add fork https://github.com/SEU_USUARIO/valinor.git
   ```
2. Empurre seu código para o fork:
   ```
   git push fork SEU_BRANCH:master
   ```

### 4. Fazer o Commit e Push

1. Adicione todos os arquivos:
   ```
   git add .
   ```
2. Faça um commit com uma mensagem descritiva:
   ```
   git commit -m "Implementação do Kanban com Angular e GraphQL"
   ```
3. Envie as alterações para o seu fork:
   ```
   git push origin master
   ```

### 5. Criar o Pull Request

1. Vá para a página do seu fork no GitHub.
2. Clique no botão "Pull request" (ou "Contribute" e depois "Open pull request").
3. Você será direcionado para uma página de comparação. Verifique se está fazendo o PR da sua branch "master" para a branch "master" do repositório original FieldControl/valinor.
4. Clique em "Create pull request".

### 6. Preencher o Pull Request

1. Adicione um título descritivo para o pull request, por exemplo: "Kanban Board Implementation - Ronaldo Chiavegatti".
2. No corpo do pull request, cole o conteúdo do arquivo PR_RESPOSTAS.md que criamos, contendo as respostas às perguntas solicitadas:
   - Ferramentas e bibliotecas utilizadas
   - Justificativa para as escolhas tecnológicas
   - Princípios de engenharia de software aplicados
   - Desafios enfrentados e soluções encontradas
   - Melhorias futuras possíveis
3. Mencione também o link para a demonstração: https://ronaldochiavegatti.github.io/kanban-entrega/
4. Clique em "Create pull request" para finalizar.

## Dicas Adicionais

1. **Mantenha o PR Organizado**: Certifique-se de que seu código está bem organizado e segue as convenções de codificação.
2. **Testes**: Enfatize os testes que você implementou e como garantem a qualidade do código.
3. **Documentação**: Destaque a documentação que você criou, incluindo os diagramas na pasta docs.
4. **Demo Funcional**: Certifique-se de que o link para a demonstração está funcionando corretamente.
5. **Comunicação Clara**: Responda prontamente a quaisquer perguntas ou feedbacks que você receba no PR.

## Após o PR

Depois de submeter o PR, os avaliadores da FieldControl irão revisar seu código e podem fazer perguntas ou sugerir alterações. Mantenha-se atento às notificações do GitHub para responder rapidamente. 