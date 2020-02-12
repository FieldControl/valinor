const { GraphQLServer } = require('graphql-yoga')
const { PrismaClient } = require('@prisma/client')
const { Query, Mutation } = require('./graphql/resolvers')
const { appUrl } = require('./utils/config')

async function start () {
  const prisma = new PrismaClient()
  const server = new GraphQLServer({
    typeDefs: 'src/graphql/schema.graphql',
    resolvers: { Query, Mutation },
    context: { prisma }
  })
  await server.start(() => console.log('🚀 Server ready at: ' + appUrl))
}

const server = start()

module.exports = {
  server
}
