"use strict";

function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
const express = require('express');
const write = require('./write');
const getFullURL = require('./get-full-url');
const delay = require('./delay');
module.exports = (db, name, opts) => {
  const router = express.Router();
  router.use(delay);
  function show(req, res, next) {
    res.locals.data = db.get(name).value();
    next();
  }
  function create(req, res, next) {
    if (opts._isFake) {
      res.locals.data = req.body;
    } else {
      db.set(name, req.body).value();
      res.locals.data = db.get(name).value();
    }
    res.setHeader('Access-Control-Expose-Headers', 'Location');
    res.location(`${getFullURL(req)}`);
    res.status(201);
    next();
  }
  function update(req, res, next) {
    if (opts._isFake) {
      if (req.method === 'PUT') {
        res.locals.data = req.body;
      } else {
        const resource = db.get(name).value();
        res.locals.data = _objectSpread(_objectSpread({}, resource), req.body);
      }
    } else {
      if (req.method === 'PUT') {
        db.set(name, req.body).value();
      } else {
        db.get(name).assign(req.body).value();
      }
      res.locals.data = db.get(name).value();
    }
    next();
  }
  const w = write(db);
  router.route('/').get(show).post(create, w).put(update, w).patch(update, w);
  return router;
};