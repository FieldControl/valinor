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
exports.Column = void 0;
const graphql_1 = require("@nestjs/graphql");
const task_entity_1 = require("./task.entity");
const project_entity_1 = require("./project.entity");
let Column = class Column {
};
exports.Column = Column;
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], Column.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { description: 'Example field (placeholder)' }),
    __metadata("design:type", String)
], Column.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { description: 'Example field (placeholder)' }),
    __metadata("design:type", String)
], Column.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => project_entity_1.Project, { nullable: true }),
    __metadata("design:type", project_entity_1.Project)
], Column.prototype, "project", void 0);
__decorate([
    (0, graphql_1.Field)(() => [task_entity_1.Task], { nullable: 'itemsAndList' }),
    __metadata("design:type", Array)
], Column.prototype, "tasks", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { description: 'Creation date of the project' }),
    __metadata("design:type", Date)
], Column.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { description: 'Last update date of the project' }),
    __metadata("design:type", Date)
], Column.prototype, "updatedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { description: 'Order of the column' }),
    __metadata("design:type", Number)
], Column.prototype, "order", void 0);
exports.Column = Column = __decorate([
    (0, graphql_1.ObjectType)()
], Column);
//# sourceMappingURL=column.entity.js.map