# Seu Projeto Angular GitHub

Este é um projeto Angular que utiliza TypeScript para listar usuários e repositórios do GitHub, consumindo a API oficial do GitHub. Além disso, o projeto faz uso do Bootstrap para o design e do Sweet Alert para melhorar a experiência do usuário.

## Pré-requisitos

Antes de começar, certifique-se de ter as seguintes ferramentas instaladas em sua máquina:

- [Node.js](https://nodejs.org/)
- [Angular CLI](https://angular.io/cli)
- [Git](https://git-scm.com/)

## Configuração

1. **Clone o repositório:**

    ```bash
    git clone https://github.com/seu-usuario/seu-projeto.git
    cd seu-projeto
    ```

2. **Instale as dependências:**

    ```bash
    npm install
    ```

3. **Adicione seu token do GitHub ao arquivo de ambiente.**

   - Crie um arquivo chamado `.env` na raiz do projeto.
   - Adicione o seguinte conteúdo e substitua `<seu-token-aqui>` pelo seu token do GitHub:

    ```env
    GITHUB_TOKEN=<seu-token-aqui>
    ```

## Executando o Projeto

Execute o seguinte comando para iniciar o servidor de desenvolvimento:

```bash
ng serve
