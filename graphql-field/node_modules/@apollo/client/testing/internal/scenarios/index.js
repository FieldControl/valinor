import { __assign, __makeTemplateObject, __spreadArray } from "tslib";
import { ApolloLink, Observable, gql } from "../../../core/index.js";
export function setupSimpleCase() {
    var query = gql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n    query GreetingQuery {\n      greeting\n    }\n  "], ["\n    query GreetingQuery {\n      greeting\n    }\n  "])));
    var mocks = [
        {
            request: { query: query },
            result: { data: { greeting: "Hello" } },
            delay: 20,
        },
    ];
    return { query: query, mocks: mocks };
}
export function setupVariablesCase() {
    var query = gql(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n      query CharacterQuery($id: ID!) {\n        character(id: $id) {\n          id\n          name\n        }\n      }\n    "], ["\n      query CharacterQuery($id: ID!) {\n        character(id: $id) {\n          id\n          name\n        }\n      }\n    "])));
    var CHARACTERS = ["Spider-Man", "Black Widow", "Iron Man", "Hulk"];
    var mocks = __spreadArray([], CHARACTERS, true).map(function (name, index) { return ({
        request: { query: query, variables: { id: String(index + 1) } },
        result: {
            data: {
                character: { __typename: "Character", id: String(index + 1), name: name },
            },
        },
        delay: 20,
    }); });
    return { mocks: mocks, query: query };
}
export function setupMaskedVariablesCase() {
    var document = gql(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n    query CharacterQuery($id: ID!) {\n      character(id: $id) {\n        id\n        ...CharacterFragment\n      }\n    }\n\n    fragment CharacterFragment on Character {\n      name\n    }\n  "], ["\n    query CharacterQuery($id: ID!) {\n      character(id: $id) {\n        id\n        ...CharacterFragment\n      }\n    }\n\n    fragment CharacterFragment on Character {\n      name\n    }\n  "])));
    var query = document;
    var unmaskedQuery = document;
    var CHARACTERS = ["Spider-Man", "Black Widow", "Iron Man", "Hulk"];
    var mocks = __spreadArray([], CHARACTERS, true).map(function (name, index) { return ({
        request: { query: query, variables: { id: String(index + 1) } },
        result: {
            data: {
                character: { __typename: "Character", id: String(index + 1), name: name },
            },
        },
        delay: 20,
    }); });
    return { mocks: mocks, query: query, unmaskedQuery: unmaskedQuery };
}
export function addDelayToMocks(mocks, delay, override) {
    if (delay === void 0) { delay = 150; }
    if (override === void 0) { override = false; }
    return mocks.map(function (mock) {
        return override ? __assign(__assign({}, mock), { delay: delay }) : __assign({ delay: delay }, mock);
    });
}
export function setupPaginatedCase() {
    var query = gql(templateObject_4 || (templateObject_4 = __makeTemplateObject(["\n      query LettersQuery($limit: Int, $offset: Int) {\n        letters(limit: $limit, offset: $offset) {\n          letter\n          position\n        }\n      }\n    "], ["\n      query LettersQuery($limit: Int, $offset: Int) {\n        letters(limit: $limit, offset: $offset) {\n          letter\n          position\n        }\n      }\n    "])));
    var data = "ABCDEFGHIJKLMNOPQRSTUV".split("").map(function (letter, index) { return ({
        __typename: "Letter",
        letter: letter,
        position: index + 1,
    }); });
    var link = new ApolloLink(function (operation) {
        var _a = operation.variables, _b = _a.offset, offset = _b === void 0 ? 0 : _b, _c = _a.limit, limit = _c === void 0 ? 2 : _c;
        var letters = data.slice(offset, offset + limit);
        return new Observable(function (observer) {
            setTimeout(function () {
                observer.next({ data: { letters: letters } });
                observer.complete();
            }, 10);
        });
    });
    return { query: query, link: link, data: data };
}
var templateObject_1, templateObject_2, templateObject_3, templateObject_4;
//# sourceMappingURL=index.js.map