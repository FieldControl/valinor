FROM node:12
LABEL maintainer="mamude@gmail.com"

RUN apt-get update
RUN mkdir /app
WORKDIR /app
COPY . /app
RUN npm install
EXPOSE 3000
EXPOSE 3001