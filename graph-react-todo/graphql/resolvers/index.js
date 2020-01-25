const mongoose = require("mongoose");

// models
const Todo = require("../../models/todo");

module.exports = {
  getTodo: id => {
    const ObjectId = mongoose.Types.ObjectId;
    return Todo.findById(id.id).then(todo => {
      return {
        ...todo._doc,
        date: new Date(todo._doc.date).toUTCString()
      };
    });
  },
  todos: () => {
    return Todo.find()
      .then(todos => {
        return todos.map(todo => {
          return {
            ...todo._doc,
            date: new Date(todo._doc.date).toISOString()
          };
        });
      })
      .catch(err => {
        throw err;
      });
  },
  createTodo: args => {
    const todo = new Todo({
      description: args.todoInput.description,
      date: new Date().toISOString(),
      completed: args.todoInput.completed
    });
    return todo
      .save()
      .then(result => {
        console.log(result);
        return { ...result._doc };
      })
      .catch(err => {
        console.log(err);
        throw err;
      });
  }
};
