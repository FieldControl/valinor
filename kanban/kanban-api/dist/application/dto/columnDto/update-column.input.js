"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateColumnsInput = exports.UpdateColumnInput = void 0;
const create_column_input_1 = require("./create-column.input");
const graphql_1 = require("@nestjs/graphql");
let UpdateColumnInput = class UpdateColumnInput extends (0, graphql_1.PartialType)(create_column_input_1.CreateColumnInput) {
};
exports.UpdateColumnInput = UpdateColumnInput;
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], UpdateColumnInput.prototype, "id", void 0);
exports.UpdateColumnInput = UpdateColumnInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateColumnInput);
let UpdateColumnsInput = class UpdateColumnsInput {
};
exports.UpdateColumnsInput = UpdateColumnsInput;
__decorate([
    (0, graphql_1.Field)(() => [UpdateColumnInput]),
    __metadata("design:type", Array)
], UpdateColumnsInput.prototype, "columns", void 0);
exports.UpdateColumnsInput = UpdateColumnsInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateColumnsInput);
//# sourceMappingURL=update-column.input.js.map