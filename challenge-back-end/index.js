const app = require("express")();
const port = process.env.PORT || 3000;
const expressGraphQL = require("express-graphql");
const schema = require('./schema').schema;
const resolvers = require('./resolvers');

app.use(
  "/graphql",
  expressGraphQL({
    schema,
    rootValue: resolvers,
    graphiql: true
  })
);

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})
