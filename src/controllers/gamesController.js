const db = require('../connection/connection')
const Games = require('../models/games')

// Responsável pelos métodos da API
exports.get = async (req, res, next) => {
  await Games.find().then(function (result, error) {
    if (error) {
      res.sendStatus(400)
    } else {
      res.json(result)
    }
  })
}

exports.getId = async (req, res, next) => {
  await Games.find({
    _id: req.params.id
  }).then(function (result, error) {
    if (error) {
      res.sendStatus(404)
    } else {
      res.json(result)
    }
  })
}

exports.post = async (req, res, next) => {
  Games.insertMany(req.body, function (error, result) {
    if (error) {
      res.json(error)
    } else {
      res.json(result)
    }
  })
}

exports.put = async (req, res, next) => {
  await Games.updateOne({
    _id: req.params.id
  }, {
    $set: req.body
  }).then(function (result, error) {
    if (result) {
      res.json(req.body)
    }
    if (error) {
      throw error
    }
  })
}

exports.patch = async (req, res, next) => {
  await Games.updateMany({
    _id: req.params.id
  }, {
    $set: req.body
  }).then(function (result) {})
  await Games.find({
    _id: req.params.id
  }).then(function (result) {
    res.json(result)
  })
}

exports.delete = async (req, res, next) => {
  await Games.deleteOne({
    _id: req.params.id
  }).then(function (result) {
    res.sendStatus(200)
  })
}
