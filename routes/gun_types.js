//READ ONLY TABLE

const express = require('express')
//const mysql = require('mysql')

const route = express.Router()
const connection = require("../connections/sql_connect.js")
const QueryResult = require("../query_result.js")



//get Gun_Type Table 
route.get("/types", function(req, res)
{
    const query = "SELECT * FROM gun_types"
    connection.query(query, function(error, results, fields)
    {
        QueryResult(res, error,results)
    }) 
})

//id search
route.get("/types/:id", function(req, res)
{
    const id = req.params.id
    const query = "SELECT * FROM gun_types WHERE id_gun_types= ?"
    connection.query(query, [id] ,function(error, results, fields)
    {
        QueryResult(res, error,results)
    }) 
})

//export
module.exports = route