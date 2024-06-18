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
exports.CreateColumnInput = void 0;
const graphql_1 = require("@nestjs/graphql");
let CreateColumnInput = class CreateColumnInput {
};
exports.CreateColumnInput = CreateColumnInput;
__decorate([
    (0, graphql_1.Field)(() => String, { description: 'Example field (placeholder)' }),
    __metadata("design:type", String)
], CreateColumnInput.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { description: 'Example field (placeholder)' }),
    __metadata("design:type", String)
], CreateColumnInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, {
        description: 'User associated with the projects',
        nullable: true,
    }),
    __metadata("design:type", String)
], CreateColumnInput.prototype, "projectId", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], {
        description: 'User associated with the projects',
        nullable: true,
    }),
    __metadata("design:type", Array)
], CreateColumnInput.prototype, "taskIds", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, {
        description: 'Order of the column',
        nullable: true,
    }),
    __metadata("design:type", Number)
], CreateColumnInput.prototype, "order", void 0);
exports.CreateColumnInput = CreateColumnInput = __decorate([
    (0, graphql_1.InputType)()
], CreateColumnInput);
//# sourceMappingURL=create-column.input.js.map