"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphQLException = void 0;
const graphql_1 = require("graphql");
class GraphQLException extends graphql_1.GraphQLError {
    constructor(message, options) {
        super(message, options);
    }
}
exports.GraphQLException = GraphQLException;
