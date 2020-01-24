const express = require("express");
const expressGraphql = require("express-graphql");
const bodyParser = require("body-parser");
const { buildSchema } = require("graphql");
const mongoose = require("mongoose");

// models
const Todo = require("./models/todo");

// schemas
const graphQLSchema = require("./graphql/schema/index");
const graphQLResolvers = require("./graphql/resolvers/index");

// app
const app = express();

app.use(bodyParser.json());
app.use(
  "/graphql",
  expressGraphql({
    schema: graphQLSchema,
    rootValue: graphQLResolvers,
    graphiql: true
  })
);

mongoose
  .connect("mongodb://mongo:27017/fieldcontrol", {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  });
