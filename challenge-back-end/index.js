const app = require("express")();
const expressGraphql = require("express-graphql");
const { buildSchema } = require("graphql");
const Pool = require('pg').Pool;
const port = 3000;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'api',
  password: '',
  port: 5432,
})

const schema = buildSchema(`
  type User {
    id: ID
    name: String
    repo: String
    age: Int,
  }
  type Message {
    message: String
  }
  type Query {
    user(id: ID!): User
    users: [User]
  }
  type Mutation {
    userCreate(name: String!, repo: String!, age: Int!): User
    userDelete(id: ID!): Message
    userUpdate(id: ID!, name: String!, repo: String, age: Int): User
  }
`);

const providers = {
  users: []
};

let id = 0;

const resolvers = {
  async user({ id }) {
    try {
      const results = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      return results.rows[0];
    } catch (error) {
      console.error(error);
    }
  },
  async users() {
    try {
      const results = await pool.query('SELECT * FROM users ORDER BY id ASC')
      return results.rows;
    } catch (error) {
      console.error(error);
    }
  },
  async userCreate({ name, repo, age }) {
    try {
      const results = await pool.query('INSERT INTO users (name, repo, age) VALUES ($1, $2, $3) RETURNING *', [name, repo, age]);
      return results.rows[0];
    } catch (error) {
      console.error(error);
    }
  },
  async userDelete({ id }) {
    try {
      const result = await pool.query('DELETE FROM users WHERE id = $1', [id]);
      console.log(result);
      if (result.rowCount) {
        return { message: `User deleted with ID: ${id}` };
      } else {
        if(!result.rows[0]) {
          throw new Error(`No user found with ID: ${id}!`);
        }
      }
    } catch (error) {
      throw new Error(error);
    }
  },
  async userUpdate({ id, name, repo, age }) {
    try {
      let query = 'UPDATE users SET name = $1';
      let paramQuantity = 1;
      const values = [name];
      if (repo) {
        paramQuantity++;
        values.push(repo);
        query += `,repo = $${paramQuantity}`;
      }
      if (age) {
        paramQuantity++;
        values.push(age);
        query += `,age = $${paramQuantity}`;
      }
      paramQuantity++;
      values.push(id);
      query += ` WHERE id = $${paramQuantity} RETURNING *`;
      const result = await pool.query(query, values);
      if(!result.rows.length) {
        throw new Error(`No user found with ID: ${id}!`);
      }
      return result.rows[0];
    } catch (error) {
      console.error(error);
    }
  }
};

app.use(
  "/graphql",
  expressGraphql({
    schema,
    rootValue: resolvers,
    graphiql: true
  })
);


app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})