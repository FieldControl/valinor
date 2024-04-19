import conexao from "../database/conexao.js";

class TarefaRepository {
 
  create(tarefas) {
    const sql = "INSERT INTO tarefas SET ?;"
        return new Promise((resolve, reject) => {
            conexao.query(sql, tarefas, (erro, resultado) => {
                if (erro) return reject("Não foi possivel inserir");

                const result = JSON.parse(JSON.stringify(resultado));
                return resolve(result);
            });
        });
  }

  findAll() {
    const sql = "SELECT * FROM tarefas;";
        return new Promise((resolve, reject) => {
            conexao.query(sql, (erro, resultado) => {
                if (erro) return reject("Não foi possivel localizar");

                const result = JSON.parse(JSON.stringify(resultado));
                return resolve(result);
            });
        });
    }

  findByEstado(estado) {
    const sql = "SELECT * FROM tarefas where estado=?;"
        return new Promise((resolve, reject) => {
            conexao.query(sql, estado, (erro, resultado) => {
                if (erro) return reject("Não foi possivel localizar");

                const result = JSON.parse(JSON.stringify(resultado));
                return resolve(result);
            });
        });
  }

  update(tarefas, id) {
    const sql = "UPDATE tarefas SET ? where idtarefas=?;"
    return new Promise((resolve, reject) => {
        conexao.query(sql, [tarefas, id], (erro, resultado) => {
            if (erro) return reject("Não foi possivel atualizar");

            const result = JSON.parse(JSON.stringify(resultado));
            return resolve(result);
        });
    });
  }

  delete(id) {
    const sql = "DELETE FROM tarefas where idtarefas=?;"
    return new Promise((resolve, reject) => {
        conexao.query(sql, id, (erro, resultado) => {
            if (erro) return reject("Não foi possivel apagar");

            const result = JSON.parse(JSON.stringify(resultado));
            return resolve(result);
        });
    });
  }
}

export default new TarefaRepository();
