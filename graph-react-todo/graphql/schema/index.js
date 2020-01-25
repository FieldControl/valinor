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
