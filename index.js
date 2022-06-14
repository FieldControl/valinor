// config inicial
const express = require('express')
const mongoose = require('mongoose')
const app = express()



// forma de ler JSON /middlewares
app.use(
    express.urlencoded({
      extended: true,  
    }),
)

app.use(express.json())

// rotas api
const personRoutes = require('./routes/personRoutes')

app.use('/person', personRoutes)

// rota inicial / endpoint
app.get('/', (req, res) =>{

    //mostrar req

    res.json({ message: 'Oi Express!'})

})

//mongodb+srv://Jov-Ito:123321/Sobre2:@apicluster.dkhms.mongodb.net/bancodaapi?retryWrites=true&w=majority

// entregar uma porta
const DB_USER = 'Jov-Ito'
const DB_PASSWORD = encodeURIComponent('123321/Sobre2:')

mongoose
.connect(
    `mongodb+srv://${DB_USER}:${DB_PASSWORD}@apicluster.dkhms.mongodb.net/bancodaapi?retryWrites=true&w=majority`,
)
.then(() => {
    console.log('Conectamos ao MongoDB!')
    app.listen(3000)
})
.catch((err) => console.log(err))

