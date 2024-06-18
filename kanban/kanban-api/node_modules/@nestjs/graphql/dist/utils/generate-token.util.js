"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateString = void 0;
const uuid_1 = require("uuid");
const generateString = () => (0, uuid_1.v4)();
exports.generateString = generateString;
