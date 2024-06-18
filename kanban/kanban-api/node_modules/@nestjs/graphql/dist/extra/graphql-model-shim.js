"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerEnumType = exports.createUnionType = exports.dummyFn = exports.Scalar = exports.ObjectType = exports.InterfaceType = exports.InputType = exports.HideField = exports.Field = exports.Extensions = exports.Directive = exports.ArgsType = void 0;
// for webpack this is resolved this way:
// resolve: { // see: https://webpack.js.org/configuration/resolve/
//     alias: {
//         @nestjs/graphql: path.resolve(__dirname, "../node_modules/@nestjs/graphql/dist/extra/graphql-model-shim")
//     }
// }
function ArgsType() {
    return (target) => { };
}
exports.ArgsType = ArgsType;
function Directive(sdl) {
    return (target, key) => { };
}
exports.Directive = Directive;
function Extensions(value) {
    return (target, propertyKey) => { };
}
exports.Extensions = Extensions;
function Field(typeOrOptions, fieldOptions) {
    return (prototype, propertyKey, descriptor) => { };
}
exports.Field = Field;
function HideField() {
    return (target, propertyKey) => { };
}
exports.HideField = HideField;
function InputType(nameOrOptions, inputTypeOptions) {
    return (target) => { };
}
exports.InputType = InputType;
function InterfaceType(nameOrOptions, interfaceOptions) {
    return (target) => { };
}
exports.InterfaceType = InterfaceType;
function ObjectType(nameOrOptions, objectTypeOptions) {
    return (target) => { };
}
exports.ObjectType = ObjectType;
function Scalar(name, typeFunc) {
    return (target, key, descriptor) => { };
}
exports.Scalar = Scalar;
function dummyFn() {
    return;
}
exports.dummyFn = dummyFn;
exports.createUnionType = dummyFn;
exports.registerEnumType = dummyFn;
