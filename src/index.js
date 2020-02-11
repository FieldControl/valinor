const { GraphQLServer } = require('graphql-yoga')
const { PrismaClient } = require('@prisma/client')
const { Query, Mutation } = require('./graphql/resolvers')
const { appUrl } = require('./utils');
const spawn = require('cross-spawn');

const prisma = new PrismaClient()

const server = new GraphQLServer({
    typeDefs: 'src/graphql/schema.graphql',
    resolvers: { Query, Mutation },
    context: { prisma },
});

server.start(() =>
    console.log("🚀 Server ready at: " + appUrl),
).catch(error => {
    console.log(error)
})

console.log(Object.keys(server))
console.log(Object.keys(server.express))
server.express.on("error", (error) => {
    console.log("Erro ==>")
    console.log(error)
})
