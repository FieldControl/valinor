# Etapa de build
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx ng build --configuration=development

# Etapa de produção
FROM nginx:alpine

# Copia os arquivos de build do Ionic
COPY --from=build /app/www /usr/share/nginx/html

# Copia a configuração personalizada do NGINX (opcional)
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
