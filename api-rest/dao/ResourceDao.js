function ResourceDao(connection) {
    this._connection = connection;
}

ResourceDao.prototype.salva = function (resource, callback){
    this._connection.query('INSERT INTO resources SET ?', resource, callback);
}

ResourceDao.prototype.lista = function (page, limit, callback){
    var offset = (page - 1) * limit;
    this._connection.query(`SELECT * FROM resources 
                            WHERE status != 'EXCLUIDO' 
                            LIMIT ? OFFSET ?`, [limit, offset], callback);
}

ResourceDao.prototype.atualiza = function (resource, callback){
    this._connection.query(`UPDATE resources SET ? WHERE id = ?`, 
                            [resource, resource.id], callback );
}

ResourceDao.prototype.buscaPorId = function (id, callback){
    this._connection.query('SELECT * FROM resources where id = ?', [id], callback);
}

ResourceDao.prototype.deletaTodosResourcesBD = function(callback) {
    this._connection.query('DELETE FROM resources', callback);
}

ResourceDao.prototype.inicializaResourcesBDTeste = function(callback) {
    this._connection.query(`INSERT INTO resources VALUES 
                            ('1','Luiz Freneda','luiz@gmail.com','INICIAL','2018-06-20'),
                            ('2','Eduardo','eduardo@gmail.com','INICIAL','2018-06-20'),
                            ('3','Tadeu','tadeu@gmail.com','INICIAL','2018-06-20'),
                            ('4','Pessoa','pessoa@example.com','INICIAL','2018-06-20');`, callback);
}

module.exports = function(){
    return ResourceDao;
};