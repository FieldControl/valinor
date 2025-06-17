const { ApolloServer, gql } = require('apollo-server-express');
const express = require('express');
const cors = require('cors');

const tasksCriada = []; // Array para armazenar as tarefas temporariamente

const schema = gql(`
    type Query { 
        tasks: [String!]!
    }

    type Mutation {
        createTask(task: String!): String!
    }
`);

const resolvers = {
    Query: {
        tasks: () => tasksCriada,
    },
    Mutation: {
        createTask: (_, { task }) => {
            console.log('Recebido do front:', task); // Log para verificar recebimento
            tasksCriada.push(task);
            return `${task} foi criado com sucesso!`;
        },
    },
};

async function startServer() {
    const server = new ApolloServer({ typeDefs: schema, resolvers });
    await server.start();
    const app = express();

    app.use(cors()); // Permite chamadas do front end

    server.applyMiddleware({ app });

    app.listen({ port: 4000 }, () =>
        console.log(`Servidor funcionando em http://localhost:4000/graphql`)
    );
}

startServer();
