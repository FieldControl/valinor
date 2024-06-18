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
exports.UpdateProjectInput = void 0;
const create_project_input_1 = require("./create-project.input");
const graphql_1 = require("@nestjs/graphql");
let UpdateProjectInput = class UpdateProjectInput extends (0, graphql_1.PartialType)(create_project_input_1.CreateProjectInput) {
};
exports.UpdateProjectInput = UpdateProjectInput;
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], UpdateProjectInput.prototype, "id", void 0);
exports.UpdateProjectInput = UpdateProjectInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateProjectInput);
//# sourceMappingURL=update-project.input.js.map