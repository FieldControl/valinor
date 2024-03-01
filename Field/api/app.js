const express = require('express');
const app = express();
const cors = require('cors');

const {mongoose} = require('./db/mongoose');

const bodyParser = require('body-parser');

// carregar os models
const { List, Task } = require('./db/models');

app.use(bodyParser.json());

// CORS
app.use(cors());
app.use(function (req, res, next) {
    res.header("Acess-Control-Allow_Methods", "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE");
    next();
});

app.get('/lists', (req, res) => {
    // return do array com todas as lists
    List.find().then((lists) => {
        res.send(lists);
    }).catch((e) => {
        res.send(e);
    });
});

app.post('/lists', (req, res) => {
    // create uma nova list
    let title = req.body.title;

    let newList = new List({
        title
    });
    newList.save().then((listDoc) => {
        res.send(listDoc);
    })
});

app.patch('/lists/:id', (req, res) => {
    // update uma list especifica
    List.findOneAndUpdate({ _id: req.params.id }, {
        $set: req.body
    }).then(() => {
        res.send({ 'message': 'updated successfully'});
    });
});

app.delete('/lists/:id', (req, res) => {
    // delete uma list especifica
    List.findOneAndDelete({ _id: req.params.id }).then((removedListDoc) => {
        res.send(removedListDoc);
    });
});


app.get('/lists/:listId/tasks', (req, res) => {
    Task.find({ _listId: req.params.listId }).then((tasks) => {
        res.send(tasks);
    });
});

app.post('/lists/:listId/tasks', (req, res) => {
    let newTask = new Task({ 
        title: req.body.title,
        _listId: req.params.listId
    });
    newTask.save().then((newTaskDoc) => {
        res.send(newTaskDoc);
    });
});

app.patch('/lists/:listId/tasks/:taskId', (req, res) => {
    Task.findOneAndUpdate({ 
        _id: req.params.taskId,
        _listId: req.params.listId
    }, {
        $set: req.body
    }).then(() => {
        res.send({message: "Updated successfully"});
    });
});

app.delete('/lists/:listId/tasks/:taskId', (req, res) => {
    Task.findOneAndDelete({
        _id: req.params.taskId,
        _listId: req.params.listId
    }, {
        $set: req.body
    }).then((removedTaskDoc) => {
        res.send(removedTaskDoc);
    });
});

// para achar uma task pelo Id, não usado no projeto
app.get('lists/:listId/tasks/:taskId', (req, res) => {
    Task.findOne({
        _id: req.params.taskId,
        _listId: req.params.listId
    }).then((task) => {
        res.send(task);
    });
});


// port
app.listen(3000, () => {
    console.log("Server is listening on port 3000");
});