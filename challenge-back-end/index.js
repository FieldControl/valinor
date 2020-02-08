const app = require("express")();
const expressGraphql = require("express-graphql");
const { buildSchema } = require("graphql");
const Pool = require('pg').Pool;
const port = 3000;
const axios = require('axios');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'db_dota',
  password: '',
  port: 5432,
})

/**
 * Verifica se existe a tabela dos Heróis e consulta uma API para inseri-los na tabela caso a mesma não exista
 */
const setHeroes = async () => {

  try {
    await pool.query(`SELECT * FROM tb_heroes`);
  } catch (error) {
    await pool.query({
      text: `CREATE TABLE tb_heroes (
        sr_id SERIAL PRIMARY KEY,
        vc_name VARCHAR(30),
        vc_role VARCHAR(30),
        vc_type VARCHAR(30)
      );`
    })
    const results = await axios.get('https://api.opendota.com/api/heroes');
    results.data.forEach(async hero => {
      await pool.query({
        text: 'INSERT INTO tb_heroes (vc_name, vc_role, vc_type) VALUES ($1, $2, $3)',
        values: [hero.localized_name, hero.attack_type, hero.primary_attr]
      })
    })

    console.error(error);
  }

}
setHeroes();

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
    heroes(count: Int, page: Int, sort: String, order: String): Paginated
  }
  type Mutation {
    heroCreate(vc_name: String!, vc_role: String!, vc_type: String!): Hero
    heroDelete(sr_id: ID!): Message
    heroUpdate(sr_id: ID!, vc_name: String!, vc_role: String, vc_type: String): Hero
  }
`);

const resolvers = {
  async hero({ sr_id }) {
    try {
      const results = await pool.query('SELECT * FROM tb_heroes WHERE sr_id = $1', [sr_id]);
      if (!results.rows.length) {
        throw `No hero found with id ${sr_id}`;
      }
      return results.rows[0];
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  },
  async heroes({ count, page }) {
    try {
      const results = await pool.query({
        text: `SELECT * FROM tb_heroes ORDER BY vc_name`,
      });
      if (!results.rows.length) {
        throw 'No heroes found!';
      }
      console.log(results.rows);
      if (count === undefined || page === undefined) {
        return {
          total: results.rows.length,
          data: results.rows,
          currentPage: 1,
          lastPage: 1
        };
      }
      const paginated = [];
      const total = results.rows.length;
      while (results.rows.length) {
        paginated.push(results.rows.splice(0, count));
      }
      if (page === 0) { page++; }
      if (page > paginated.length) { page = paginated.length }
      return {
        total,
        data: paginated[page - 1],
        currentPage: page,
        lastPage: paginated.length
      }
    } catch (error) {
      console.error(error);
      throw new Error(error);

    }
  },
  async heroCreate({ vc_name, vc_role, vc_type }) {
    try {
      const results = await pool.query('INSERT INTO tb_heroes (vc_name, vc_role, vc_type) VALUES ($1, $2, $3) RETURNING *', [vc_name, vc_role, vc_type]);
      return results.rows[0];
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  },
  async heroDelete({ sr_id }) {
    try {
      const result = await pool.query('DELETE FROM tb_heroes WHERE sr_id = $1', [sr_id]);
      if (result.rowCount) {
        return { message: `Hero deleted with ID: ${sr_id}` };
      } else {
        if (!result.rows[0]) {
          throw new Error(`No Hero found with ID: ${sr_id}!`);
        }
      }
    } catch (error) {
      console.error(error);

      throw new Error(error);
    }
  },
  async userUpdate({ id, vc_name, vc_role, vc_type }) {
    try {
      let query = 'UPDATE tb_heroes SET vc_name = $1';
      let paramQuantity = 1;
      const values = [vc_name];
      if (vc_role) {
        paramQuantity++;
        values.push(vc_role);
        query += `,vc_role = $${paramQuantity}`;
      }
      if (vc_type) {
        paramQuantity++;
        values.push(vc_type);
        query += `,vc_type = $${paramQuantity}`;
      }
      paramQuantity++;
      values.push(sr_id);
      query += ` WHERE sr_id = $${paramQuantity} RETURNING *`;
      const result = await pool.query(query, values);
      if (!result.rows.length) {
        throw new Error(`No Hero found with ID: ${sr_id}!`);
      }
      return result.rows[0];
    } catch (error) {
      console.error(error);
      throw new Error(error);
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