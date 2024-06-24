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
exports.Project = void 0;
const graphql_1 = require("@nestjs/graphql");
const user_entity_1 = require("./user.entity");
const column_entity_1 = require("./column.entity");
let Project = class Project {
};
exports.Project = Project;
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], Project.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { description: 'Example field (placeholder)' }),
    __metadata("design:type", String)
], Project.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { description: 'Example field (placeholder)' }),
    __metadata("design:type", String)
], Project.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => [column_entity_1.Column], { nullable: 'itemsAndList' }),
    __metadata("design:type", Array)
], Project.prototype, "columns", void 0);
__decorate([
    (0, graphql_1.Field)(() => [user_entity_1.User], { nullable: 'itemsAndList' }),
    __metadata("design:type", Array)
], Project.prototype, "users", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { description: 'Creation date of the project' }),
    __metadata("design:type", Date)
], Project.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { description: 'Last update date of the project' }),
    __metadata("design:type", Date)
], Project.prototype, "updatedAt", void 0);
exports.Project = Project = __decorate([
    (0, graphql_1.ObjectType)()
], Project);
//# sourceMappingURL=project.entity.js.map