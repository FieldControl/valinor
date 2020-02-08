const Pool = require('pg').Pool;
const axios = require('axios');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'db_dota',
    password: '',
    port: 5432,
});

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

module.exports = {
    pool
} 