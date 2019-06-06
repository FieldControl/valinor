var express = require('express');
var path = require('path');
//var favicon = require('serve-favicon');
var logger = require('morgan');
//var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

var User = require('./models/user');

var app = express();
var mongoose = require('mongoose');

//connection og MongoDB
var conn = mongoose.connect('mongodb://localhost:27017/api',{ useNewUrlParser: true});

if(conn){
  console.log('MongoDB Connected');
}else{
  console.log('MongoDB NOT Connected');
}

// view engine setup
//app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public


//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

//recupera todos os recursos
app.get('/resources',function(req,res){
    User.find(function(err,docs){
      //console.log(docs);
      res.json(docs)
    })
});

//recupera um recurso
app.get('/resources/:id',function(req,res){
    var id = req.params.id;
    User.findOne({_id:id},function(err,doc){
      res.json(doc);
    });
});

//adiciona um recurso
app.post('/resources',function(req,res){
  var userTable = new User(req.body);
  userTable.save(function(err,docs){
    console.log(docs);
    res.json(docs);
  })
});

//altera totalmete um recurso
app.put('/resources/:id',function(req,res){
    var id = req.params.id;
    User.findOneAndUpdate({_id:id},{$set:{
        nome:req.body.nome,
        email:req.body.email,
        telefone:req.body.telefone,
        endereco:req.body.endereco
    }}, 
    {new: true}, function(err, doc){
      res.json(doc);
    });
});

//altera parcialmete um recurso (telefone e endereco)
app.patch('/resources/:id',function(req,res){
    var id = req.params.id;
    User.findOneAndUpdate({_id:id},{$set:{
        telefone:req.body.telefone,
        endereco:req.body.endereco
    }}, 
    {new: true}, function(err, doc){
      res.json(doc);
    });
});

// exclui um recurso
app.delete('/resources/:id',function(req,res){
  var id = req.params.id;
  User.deleteOne({ _id: id },function(err,doc){
    res.json(doc);
  })
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
