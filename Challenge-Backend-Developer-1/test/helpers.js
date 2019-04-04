let supertest = require("supertest");
let chai = require("chai");
let app = require("../index");

global.app = app;
global.request = supertest(app);
global.expect = chai.expect;