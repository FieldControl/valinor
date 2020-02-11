const {GraphQLServer} = require('graphql-yoga')
const {PrismaClient} = require('@prisma/client')
const {Query, Mutation} = require('./graphql/resolvers')

const prisma = new PrismaClient()

const server = new GraphQLServer({
    typeDefs: 'src/graphql/schema.graphql',
    resolvers: {Query, Mutation},
    context: {prisma},
});

server.start(() =>
    console.log(`🚀 Server ready at: http://localhost:4000`),
).catch(error => {
    console.log(error)
})
