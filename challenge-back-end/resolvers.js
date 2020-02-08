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

const heroes = async ({ count, page }) => {
    console.log(count);
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