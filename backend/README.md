## Como iniciar o Back End

Acesse a pasta backend usando o comando

```bash
cd backend
```

Agora instale as dependências com
```bash
npm i
```

Crie uma copia do arquivo .env-example e renomeie para
```bash
.env
```

Rode o comando do Docker
```bash
docker-compose up -d
```

Execute as migrações com
```bash
npx prisma migrate dev
```

Execute o projeto com
```bash
npm run start
```