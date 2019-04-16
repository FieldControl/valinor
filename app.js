const express = require('express')
//const mysql = require('mysql')

const app = express()

//#requires
const gun_route = require("./routes/guns.js")
const type_route = require("./routes/gun_types.js")
const man_route = require("./routes/manufacturers")

//uses
app.use(gun_route)
app.use(type_route)
app.use(man_route)

//server @ localhost:3000
app.listen(3000, function()
{
    console.log("Server Started at Port 3000")
})

//root
app.get("/", function(req, res)
{
    res.send("Welcome to Pandora!")
})


















//easter egg
app.get("/is_borderlands_3_confirmed?", function(req, res)
{
    res.send("YES!")
})
