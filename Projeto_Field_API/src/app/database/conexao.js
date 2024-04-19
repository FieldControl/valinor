import mysql from 'mysql'

const conexao = mysql.createConnection({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: '13951',
    database: 'bd_tarefas'
})

conexao.connect()


export default conexao

