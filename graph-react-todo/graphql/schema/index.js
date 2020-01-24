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
}

type RootQuery {
  todos: [Todo!]!
}
type RootMutation {
  createTodo(todoInput: TodoInput): Todo
}
schema {
    query: RootQuery
    mutation: RootMutation
}
`);
