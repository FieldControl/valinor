//READ ONLY TABLE

const express = require('express')
//const mysql = require('mysql')

const route = express.Router()
const connection = require("../connections/sql_connect.js")
const QueryResult = require("../query_result.js")



//get Manufactures Table
route.get("/manufacturers", function(req, res)
{
    const query = "SELECT * FROM manufacturers"
    connection.query(query, function(error, results, fields)
    {
        QueryResult(res, error,results)
    }) 
})

//id search
route.get("/manufacturers/:id", function(req, res)
{
    const id = req.params.id
    const query = "SELECT * FROM manufacturers WHERE id_manufacturer= ?"
    connection.query(query, [id] ,function(error, results, fields)
    {
        QueryResult(res, error,results)
    }) 
})

//export
module.exports = route