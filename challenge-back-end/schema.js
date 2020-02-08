const { buildSchema } = require("graphql");

const schema = buildSchema(`
  type Hero {
    sr_id: ID
    vc_name: String
    vc_role: String
    vc_type: String
  }
  type Paginated {
    total: Int
    currentPage: Int
    lastPage: Int
    data: [Hero]
  }
  type Message {
    message: String
  }
  type Query {
    hero(sr_id: ID!): Hero
    heroes(limit: Int, page: Int, sort: String, order: String): Paginated
  }
  type Mutation {
    heroCreate(vc_name: String!, vc_role: String!, vc_type: String!): Hero
    heroDelete(sr_id: ID!): Message
    heroUpdate(sr_id: ID!, vc_name: String!, vc_role: String, vc_type: String): Hero
  }
`);

module.exports = {
    schema
}