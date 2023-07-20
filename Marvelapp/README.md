<h1 align="center">
<img  src="/web/src/Media/imgs/logo.png" alt="" />
</h1>
<h1 align="center">Marvel Explorer | Consumo de API 🚀</h1>

<p align="center">
<a href="#Sobre">Sobre</a> |
<a href="#Layout">Layout</a> |
<a href="#Tecnologias">Tecnologias</a> |
<a href="#ultilizar">Como ultilizar</a> |
<a href="#Infos">Infos</a> |
</p>

<h2 id="Sobre">💻 Sobre</h2>
<p>Marvel Explorer - É uma aplicação WEB que leva você para uma emocionante jornada pelo universo da Marvel. Com acesso à API da Marvel, essa plataforma permite que você explore uma vasta coleção de personagens, séries e histórias em quadrinhos</p>
<br>

<h2 id="Layout">🎨 Layout</h2>
<p>Veja o Layout da aplicação a seguir</p>

<h2 id="">Home</h2>
<h1 align="center">
<img  src="/github/home.png" alt="" />
<img  src="/github/home2.png" alt="" />
</h1>
<h2 id="">Personagens</h2>
<h1 align="center">
<img  src="/github/personagens.png" alt="" />
</h1>
<h2 id="">HQ</h2>
<h1 align="center">
<img  src="/github/hq.png" alt="" />
</h1>
<h2 id="">Séries</h2>
<h1 align="center">
<img  src="/github/series.png" alt="" />
</h1>
<h2 id="">Informações Gerais</h2>
<h1 align="center">
<img  src="/github/infos.png" alt="" />
</h1>
<h2 id="">Pesquisas específicas</h2>
<h1 align="center">
<img  src="/github/pesquisa.png" alt="" />
</h1>
<h2 id="">Paginação</h2>
<h1 align="center">
<img  src="/github/paginacao.png" alt="" />
</h1>
<h2 id="">Erro 404</h2>
<h1 align="center">
<img  src="/github/erro.png" alt="" />
</h1>

<h2 id="Tecnologias">🛠 Tecnologias</h2>
<p>As seguintes tecnologias foram empregadas na criação deste projeto:</p>

- [ReactJs](https://reactjs.org/)
- [API Marvel](https://developer.marvel.com/)
- [Typescript](https://www.typescriptlang.org/)
- [CSS](https://developer.mozilla.org/pt-BR/docs/Web/HTML)
- [HTML](https://developer.mozilla.org/pt-BR/docs/Web/CSS)
- [Vite](https://vitejs.dev/)

<h2 id="ultilizar">🚀 Pré-requisitos</h2>
<p>💡 É recomendado que você tenha instalado em sua máquina as seguintes ferramentas:<a href="https://git-scm.com/">Git</a>, <a href="https://nodejs.org/en/">Node.js</a>. Além disso é bom ter um editor para trabalhar com o código como o <a href="https://code.visualstudio.com/">VScode</a>.</p>
<h4>💻 Instalação</h4>

```bash
# Clone este repositório para o seu ambiente de desenvolvimento:
$ git clone https://github.com/seu-usuario/Marvel-Explorer.git

# Acesse o diretório do projeto:
$ cd Marvelapp/web

#Instale as dependências do projeto utilizando o npm:
$ npm install

#Instale o pacote "react-paginate" usando o gerenciador de pacotes npm:
$ npm install react-paginate
```
<h2>⚙️ Configuração</h2>
<h4>💡 Antes de executar o projeto, você precisa fornecer as chaves de acesso à API da Marvel. Siga os passos abaixo para configurar as chaves:</h4>
<p><strong>1.</strong> Acesse o site <a href="https://developer.marvel.com/">Marvel Developer Portal</a> e crie uma conta.</p>
<p><strong>2.</strong> Após fazer login, vá para a seção "My Developer Account" e clique em "Create a new App".</p>
<p><strong>3.</strong> Preencha o formulário e registre a sua aplicação. Anote as chaves de acesso geradas (public key e private key).</p>
<p><strong>4.</strong> No diretório do projeto, crie um arquivo .env.local e adicione as chaves no seguinte formato:</p>

```bash
REACT_APP_MARVEL_PUBLIC_KEY=SuaMarvelPublicKey
REACT_APP_MARVEL_PRIVATE_KEY=SuaMarvelPrivateKey
# Substitua SuaMarvelPublicKey pela sua chave pública e SuaMarvelPrivateKey pela sua chave privada obtidas no passo anterior.
```

<h4>💻 Executando o projeto (web)</h4>
<p>Após a instalação e configuração, você pode executar o projeto com o seguinte comando:</p>

```bash
$ npm run dev
# Isso iniciará o servidor de desenvolvimento e abrirá o projeto em seu navegador padrão. Agora você pode explorar os personagens, quadrinhos e séries da Marvel.

# Confira se o servidor está em execução e abra ele no seu navegador preferido. Por padrão, o endereço de execução deverá ser esse:
$ http://localhost:5173/  
```
<h2 id="Infos">🛠 Funcionalidades</h2>
<p>🗺️ O projeto inclui as seguintes funcionalidades:</p>

<p>1. <strong>Lista de personagens: </strong>Exibe uma lista paginada de personagens da Marvel, com informações básicas como nome e foto.</p>
<p>2. <strong>Detalhes do personagem: </strong>o clicar em um personagem, exibe informações detalhadas, incluindo nome, descrição.</p>
<p>3. <strong>Lista de quadrinhos: </strong>Exibe uma lista paginada de quadrinhos da Marvel, com informações básicas como título e imagem de capa.</p>
<p>4. <strong>Detalhes do quadrinho: </strong>Ao clicar em um quadrinho, exibe informações detalhadas, incluindo título e descrição.</p>
<p>5. <strong>Lista de séries: </strong>Exibe uma lista paginada de séries da Marvel, com informações básicas como título e imagem de capa.</p>
<p>6. <strong>Detalhes da série: </strong>Ao clicar em uma série, exibe informações detalhadas, incluindo título, descrição.</p>

---
Made with 💚 by Ives Pires 👋 [See my LinkedIn](https://www.linkedin.com/in/ives-pires-de-miranda/)
