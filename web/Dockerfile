FROM node:20.16

WORKDIR /web

COPY package*.json ./

RUN npm install

RUN npm install -g @angular/cli@17

COPY . .

CMD ["ng", "serve", "--host", "0.0.0.0"]