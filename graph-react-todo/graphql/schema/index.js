const { buildSchema } = require("graphql");
module.exports = buildSchema(`
type Todo {
  _id: ID
  description: String!
  date: String
  completed: Boolean
}

input TodoInput {
  description: String!
  completed: Boolean
}

type RootQuery {
  getTodo(id: ID!): Todo!
  todos: [Todo!]!
}
type RootMutation {
  createTodo(todoInput: TodoInput): Todo
  updateTodo(id: ID!): Todo
  removeTodo(id: ID!): String
}
schema {
    query: RootQuery
    mutation: RootMutation
}
`);
