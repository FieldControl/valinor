const Connection = require('./connection');

module.exports = function () {
    return AutomovelRepo;
};

function AutomovelRepo() {
    this.con = new Connection();
}

AutomovelRepo.prototype.findById = function (id) {
    return this._executeQuery("select * from automovel where id = ? limit 1", id);
};

// TODO melhorar método para prevenir sql injection 
AutomovelRepo.prototype.list = function (page, filtro) {
    var condicoes = [];     // condicoes inicialmente vazia

    if (filtro.ano) {
        condicoes.push(`ano=${filtro.ano}`); // ano = ao valor do filtro
        delete filtro.ano; // remove a chave ano do objeto filtro
    }

    if (filtro.placa) {
        condicoes.push(`placa='${filtro.placa}'`); // ano = ao valor do filtro
        delete filtro.placa; // remove a chave ano do objeto filtro
    }


    for (key in filtro) { // percorre demais filtros
        let value = filtro[key];
        if (value) { // valor do filtro esta preenchido
            condicoes.push(`${key} like '%${value}%'`) // adiciona condição like
        }
    }

    var where = ""; // convertendo array de filtros para sql 
    if (condicoes.length > 0) { // array preenchido ?

        // conbina todos os elementos do array em um único elemento
        where = "where " + condicoes.reduce((a, b) => {
            return a + " and " + b; // filtros juntados com 'and'
        })
    }

    // montando query final
    page.offset = page.limit * (page.page - 1);
    var sql = `select * from automovel ${where} limit ${page.limit} offset ${page.offset}`;

    return this.count(where).then(count => {
        return this._executeQuery(sql).then(result => {
            page.limit = parseInt(page.limit);
            return {
                pageInfo: {
                    totalItens: count,
                    resultsPerPage: parseInt(page.limit),
                    totalPages: Math.ceil(count / (page.limit === 0 ? 1 : page.limit)),
                    actualPage: parseInt(page.page),
                    actualPageSize: result.length
                },
                data: result
            };

        });
    });

};

AutomovelRepo.prototype.add = function (automovel) {
    return this._executeQuery("insert automovel set ?", automovel);
};

AutomovelRepo.prototype.remove = function (id) {
    return this._executeQuery("delete from automovel where id = ?", id);
};

AutomovelRepo.prototype.count = function (where) {
    let sql = `select count(*) as count
    from automovel ${where}`;
    return this._executeQuery(sql)
        .then(data => {
            return data[0].count
        });
};

AutomovelRepo.prototype.update = function (id, updateNull, automovel) {

    let campos = [];
    for (field in automovel) {

        let value = automovel[field];

        if (updateNull) {

            if (!value) {
                campos.push(`${field}=null`)
            } else {
                campos.push(`${field}='${value}'`)
            }
        } else {

            if (!value) {
                campos.push(`${field}=null`)
            } else {
                campos.push(`${field}='${value}'`)
            }
        }
    }

    sqlCampos = "";
    if (campos.length > 0) {
        sqlCampos = campos.reduce((a, b) => {
            return a + ", " + b;
        });
    }

    let sql = `update automovel set ${sqlCampos} where id = ${id}`;

    return this._executeQuery(sql, automovel, id);
};

AutomovelRepo.prototype.close = function () {
    this.con.end();
};

AutomovelRepo.prototype._executeQuery = function (sql, param) {
    return new Promise((resolve, reject) => {
        this.con.query(sql, param, (err, result) => {
            if (err) reject(err);
            resolve(result)
        });
    });
};
