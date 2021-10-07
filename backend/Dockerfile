FROM node:13.4-alpine3.10

WORKDIR /app

COPY ["package.json", "package-lock.json", "./"]

RUN npm install

COPY . .

EXPOSE 8080

CMD ["npm", "start"]