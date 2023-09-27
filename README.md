# Github-find

# Documentação do Projeto GitHub-find

## Objetivo do Projeto

O projeto GitHub-find é uma aplicação web desenvolvida em Next.js que tem como objetivo permitir aos usuários pesquisar por repositórios e usuários no GitHub. A aplicação consome a API pública do GitHub para recuperar informações relevantes e apresentá-las de forma acessível e organizada aos usuários.

### Funcionalidades Principais

O projeto GitHub-find oferece as seguintes funcionalidades principais:

1. **Pesquisa de Repositórios**: Os usuários podem inserir palavras-chave na barra de pesquisa para encontrar repositórios do GitHub relacionados a essas palavras-chave. Os resultados incluem detalhes como nome do repositório, descrição, linguagem de programação predominante e número de estrelas.

2. **Pesquisa de Usuários**: Os usuários também podem buscar por outros usuários do GitHub. Os resultados exibem informações sobre o perfil do usuário, incluindo nome, avatar, nome de usuário, número de seguidores e repositórios públicos.

3. **Detalhes do Repositório**: Ao clicar em um repositório na lista de resultados, os usuários podem visualizar informações mais detalhadas sobre o repositório, como os commits mais recentes e os colaboradores.



## Como Usar o Projeto

Para utilizar o projeto GitHub Search, siga os passos abaixo:

1. **Clone o Repositório**: Clone o repositório do projeto para seu ambiente local usando o comando `git clone`.

2. **Instale as Dependências**: Navegue até a pasta raiz do projeto e execute `npm install` ou `yarn install` para instalar todas as dependências necessárias.

3. **Configure as Variáveis de Ambiente**: É necessário configurar as variáveis de ambiente para fornecer uma chave de acesso à API do GitHub (token de autenticação). Crie um arquivo `.env.local` na raiz do projeto e adicione a variável de ambiente `GITHUB_API_TOKEN` com seu token de acesso.

4. **Inicie a Aplicação**: Execute o comando `npm run dev` ou `yarn dev` para iniciar o servidor de desenvolvimento.

5. **Acesse a Aplicação**: Abra seu navegador e acesse `http://localhost:3000` para começar a usar a aplicação.

## Tecnologias Utilizadas

O projeto GitHub Search utiliza as seguintes tecnologias e bibliotecas:

1. @tanstack/react-query (v4.35.3)

    Motivo de Uso: O React Query é uma biblioteca que oferece uma solução eficaz para gerenciar o estado e a lógica de busca de dados em aplicativos React. Ela simplifica a busca, a atualização e o gerenciamento de dados, tornando as solicitações de API mais eficientes e escaláveis.

2. ky (v1.0.1)

    Motivo de Uso: Ky é uma biblioteca para realizar solicitações de rede HTTP no navegador e no Node.js. Ela oferece uma API moderna e amigável para fazer requisições assíncronas a servidores. Ky é uma escolha popular para lidar com chamadas de API em projetos React devido à sua simplicidade e recursos.

3. react-icons (v4.11.0)

    Motivo de Uso: O pacote React Icons fornece uma ampla variedade de ícones que podem ser facilmente incorporados em componentes React. Isso é útil para adicionar ícones a elementos de interface do usuário, como botões, links e barras de navegação, tornando a aplicação mais atraente e intuitiva.

4. styled-components (v6.0.8)

    Motivo de Uso: O styled-components é uma biblioteca que permite criar estilos CSS em JavaScript para componentes React. Com ela, você pode definir estilos de maneira declarativa diretamente nos componentes, facilitando a manutenção e a compreensão do CSS da aplicação. É amplamente utilizado para criar interfaces de usuário elegantes e responsivas.

5. typescript (v5.2.2)

    Motivo de Uso: TypeScript é uma linguagem de programação que adiciona tipagem estática ao JavaScript. Ele ajuda a identificar erros de código em tempo de desenvolvimento, tornando o código mais seguro e fácil de manter. O Next.js pode ser configurado para funcionar perfeitamente com o TypeScript, oferecendo uma experiência de desenvolvimento mais robusta e escalável.


## Escolhas Tecnológicas:

    React Query em vez de Redux:
        Optou-se por React Query devido à sua simplicidade e eficácia no gerenciamento de estados e lógica de busca de dados, sem a complexidade de configurações extensas encontradas em soluções como Redux.

    Ky em vez de Axios:
        Ky foi escolhido por sua API moderna e amigável, e por ser extendida da proprias fetch api, possui uma integraçao melhor com as novas features do next 13.

    Styled-components em vez de CSS puro ou outros pré-processadores:
        Styled-components foi escolhido para permitir a criação de estilos CSS diretamente em JavaScript, simplificando a manutenção e a compreensão do código relacionado à interface do usuário.
    
## Princípios de Engenharia de Software:

Componentização:
    Utilização extensiva de componentes React para modularização e reutilização de código, seguindo o princípio de componentização na engenharia de software.

Tipagem Estática:
    Adoção do TypeScript para introduzir tipagem estática ao código, melhorando a segurança e a facilidade de manutenção.

Desenvolvimento Orientado a Componentes:
    O uso de styled-components promove o desenvolvimento orientado a componentes, permitindo estilos encapsulados e reutilizáveis.
    

## Desafios e Soluções:
    Gerenciamento de Estado e Dados:
        Desafio: Gerenciar eficientemente o estado da aplicação e as chamadas à API.
        Solução: A escolha do React Query simplificou o gerenciamento de estados e integrou-se bem com a lógica de busca de dados.  

## Oportunidades de Melhoria:

    Testes Automatizados:
        Introduzir testes automatizados para garantir a robustez e a estabilidade da aplicação.      
    

## Contato

Telefone e Whatsapp - (11)9 3952-9655
Email: lucasrenan365@outlook.com