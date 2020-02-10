const pool = require('./pool').pool;

const hero = async ({ sr_id }) => {
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
};

const heroes = async ({ limit, page }) => {
    try {
        if (page <= 0 || !page) { page = 1; }

        let tableLength = await pool.query({
            text: `SELECT COUNT(*) FROM tb_heroes`
        });
        tableLength = tableLength.rows[0].count;
        let offset
        if(offset) {
            offset = (page - 1) * limit;
            if(offset > tableLength) {
                throw 'No heroes found!'
            }
        }
        let results;
        if(limit) {
            results = await pool.query({
                text: `SELECT * FROM tb_heroes ORDER BY vc_name LIMIT $1 OFFSET $2`,
                values: [limit, offset]
            });
        } else {
            results = await pool.query({
                text: `SELECT * FROM tb_heroes ORDER BY vc_name`,
            });
            limit = tableLength;
        }
        if (!results.rows.length) {
            throw 'No heroes found!';
        }
        const lastPage = Math.ceil(tableLength / limit);
        return {
            total: tableLength,
            data: results.rows,
            currentPage: page > lastPage ? lastPage : page,
            lastPage
        };
    } catch (error) {
        console.error(error);
        throw new Error(error);
    }
};

const heroCreate = async ({ vc_name, vc_role, vc_type }) => {
    try {
        const results = await pool.query('INSERT INTO tb_heroes (vc_name, vc_role, vc_type) VALUES ($1, $2, $3) RETURNING *', [vc_name, vc_role, vc_type]);
        return results.rows[0];
    } catch (error) {
        console.error(error);
        throw new Error(error);
    }
};

const heroDelete = async ({ sr_id }) => {
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
};

const heroUpdate = async ({ sr_id, vc_name, vc_role, vc_type }) => {
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
};

module.exports = {
    hero,
    heroCreate,
    heroes,
    heroDelete,
    heroUpdate
}