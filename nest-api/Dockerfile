FROM node:20-alpine

WORKDIR /home/api

COPY package.json .
COPY package-lock.json .

RUN npm install

COPY . .

CMD npm run start:dev