FROM node:latest

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Garante o build da aplicação
RUN npm run build
 
# Roda as migrations e inicia o app
CMD ["sh", "-c", "npm run migration:run && node dist/src/main"]

EXPOSE 3000