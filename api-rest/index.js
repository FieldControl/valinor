var app = require('./config/custom-express')();

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000')
});

