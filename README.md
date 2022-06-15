# Pokedex in Github

> O projeto Pokedex in Github feito em Vite (ReactJS) consiste em uma pokedex onde é possível buscar o nome do pokemon e lhe retornará suas habilidades e condições físicas.
> seria possível futuramente, a troca de API para, por exemplo, um catálogo de automóveis onde o comprador poderia buscar seu veiculo e retornaria seus detalhes!

## Pré-requisitos

- NodeJS
- Yarn

### Ferramentas de desenvolvimento

- Vite/ReactJS
- Sass/Scss
- Yarn

### Para iniciar a aplicação em sua máquina use:

- yarn run dev

### Bibliotecas utilizadas

- React-toastify
  url: https://www.npmjs.com/package/react-toastify
- Radix-ui
  url: https://www.radix-ui.com/
- Axios
  url: https://axios-http.com/
- React-icons
  url: https://react-icons.github.io/react-icons/

### Arquivo: package.json

```json
{
  "name": "pokedex",
  "private": true,
  "version": "0.0.0",
  "scripts": {
    "start": "PORT=8000 react-scripts start",
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@radix-ui/colors": "^0.1.8",
    "@radix-ui/react-dropdown-menu": "^0.1.6",
    "@stitches/react": "^1.2.8",
    "axios": "^0.27.2",
    "esbuild": "^0.14.43",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "react-icons": "^4.4.0",
    "react-toastify": "^9.0.1",
    "sass": "^1.51.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "@vitejs/plugin-react": "^1.3.0",
    "vite": "^2.9.7"
  }
}
```

### API de desenvolvimento

`https://pokeapi.co/docs/v2`

### Possíveis alterações para aperfeiçoamento

- Typescript
- Tailwind
- Redux ou Context API
- Implementação do firebase para autenticação de login e cadastro
- Aperfeiçoamento de design
- Filtro de pokemons
- Versão mobile (React Native)
