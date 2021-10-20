FROM node:current-alpine3.13

WORKDIR /app

COPY ["package.json", "package-lock.json", "./"]

RUN npm install

COPY . .

EXPOSE 4200

CMD ["npm", "start"]