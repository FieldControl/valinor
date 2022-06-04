    FROM node

    WORKDIR /app

    COPY . ./

    RUN npm install

    EXPOSE 8086

    CMD ["npm", "start"]

