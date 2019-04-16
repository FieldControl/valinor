//Main Table - CRUD

const express = require('express')
const body_parser = require('body-parser')
//const mysql = require('mysql')

const route = express.Router()
const connection = require("../connections/sql_connect.js")
const QueryResult = require("../query_result.js")
const app = express()

app.use(body_parser.urlencoded({extended: false}))

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////               GETS               ///////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//get Guns View Table (main source of information)
route.get("/guns", function(req, res)
{
    const query = "SELECT * FROM gun_view"
    connection.query(query, function(error, results, fields)
    {
        QueryResult(res, error,results)
    })  
})

//id search
route.get("/guns/:id", function(req, res)
{
    const id = req.params.id
    const query = "SELECT * FROM gun_view WHERE `GUN ID`= ?"
    connection.query(query, [id], function(error, results, fields)
    {
        QueryResult(res, error,results)
    })  
})

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////               POSTS               //////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

route.post("/guns", function(req, res)
{
    const gun= {
     gun_name : req.header('name'),
     gun_desc : req.header('desc'),
     id_manufacturer : req.header('id_man'),
     id_gun_type : req.header('id_type')
    }

    const query = "INSERT INTO guns (gun_name, gun_desc, id_manufacturer, id_gun_type) VALUES (?, ?, ?, ?);"

    connection.query(query, [gun.gun_name, gun.gun_desc, gun.id_manufacturer, gun.id_gun_type], function(error, results, fields)
    {
        QueryResult(res, error,results)
    })  

})

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////               PUTS               ///////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

route.put("/guns/:id", function(req, res)
{
    const gun= {
         gun_name : req.header('name'),
         gun_desc : req.header('desc'),
         id_manufacturer : req.header('id_man'),
         id_gun_type : req.header('id_type')
    }
       
    const id = req.params.id

    const query = "UPDATE guns   SET gun_name = ?, gun_desc = ?, id_manufacturer = ? , id_gun_type = ?    WHERE id_guns = ?;"
    connection.query(query, [gun.gun_name, gun.gun_desc, gun.id_manufacturer, gun.id_gun_type, id], function(error, results, fields)
    {
        QueryResult(res, error,results)
    })  
    
})

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////               PATCHS               /////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

route.patch("/guns/:id", function(req, res)
{
    const gun= {
        gun_name : req.header('name'),
        gun_desc : req.header('desc'),
        id_manufacturer : req.header('id_man'),
        id_gun_type : req.header('id_type')
   }
    
    const id = req.params.id

    //SET THE QUERY BASED IN THE PATCH PARAMETERS
    const query_update = "UPDATE guns "
    temp_query_set = "SET "

    for(const element in gun)
    {
        if(gun[element] != null)
        {
            temp_query_set += element + " = \'" + gun[element] + "\', "
        }
    }

    const set_length =  temp_query_set.length
    const query_set = temp_query_set.slice(0, set_length-2) // remove last comma + space
    // END of Query SET String

    const query_where = " WHERE id_guns = " + id + ";"
    const query = query_update + query_set + query_where


    connection.query(query, function(error, results, fields)
    {
        QueryResult(res, error,results)
    })  

})

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////               DELETES               ////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

route.delete("/guns/:id", function(req, res)
{
    const id = req.params.id
    const query = "DELETE FROM guns WHERE id_guns=?;"

    connection.query(query, [id], function(error, results, fields)
    {
        QueryResult(res, error,results)
    })  

})

//export
module.exports = route