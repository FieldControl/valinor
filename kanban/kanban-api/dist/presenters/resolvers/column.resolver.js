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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColumnResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const column_entity_1 = require("../../domain/entities/column.entity");
const create_column_input_1 = require("../../application/dto/columnDto/create-column.input");
const update_column_input_1 = require("../../application/dto/columnDto/update-column.input");
const column_service_1 = require("../../application/services/column.service");
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../../guard/auth.guard");
let ColumnResolver = class ColumnResolver {
    constructor(columnService) {
        this.columnService = columnService;
    }
    createColumn(createColumnInput) {
        return this.columnService.create(createColumnInput);
    }
    findAll() {
        return this.columnService.findAll();
    }
    findOne(id) {
        return this.columnService.findOne(id);
    }
    updateColumn(updateColumnInput) {
        return this.columnService.update(updateColumnInput.id, updateColumnInput);
    }
    updateColumns(updateColumnsInput) {
        return this.columnService.updateMany(updateColumnsInput);
    }
    removeColumn(id) {
        return this.columnService.remove(id);
    }
};
exports.ColumnResolver = ColumnResolver;
__decorate([
    (0, graphql_1.Mutation)(() => column_entity_1.Column),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, graphql_1.Args)('createColumnInput')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_column_input_1.CreateColumnInput]),
    __metadata("design:returntype", void 0)
], ColumnResolver.prototype, "createColumn", null);
__decorate([
    (0, graphql_1.Query)(() => [column_entity_1.Column], { name: 'columns' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ColumnResolver.prototype, "findAll", null);
__decorate([
    (0, graphql_1.Query)(() => column_entity_1.Column, { name: 'column' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => String })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ColumnResolver.prototype, "findOne", null);
__decorate([
    (0, graphql_1.Mutation)(() => column_entity_1.Column),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, graphql_1.Args)('updateColumnInput')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_column_input_1.UpdateColumnInput]),
    __metadata("design:returntype", void 0)
], ColumnResolver.prototype, "updateColumn", null);
__decorate([
    (0, graphql_1.Mutation)(() => [column_entity_1.Column]),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, graphql_1.Args)('updateColumnsInput')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_column_input_1.UpdateColumnsInput]),
    __metadata("design:returntype", void 0)
], ColumnResolver.prototype, "updateColumns", null);
__decorate([
    (0, graphql_1.Mutation)(() => column_entity_1.Column),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, graphql_1.Args)('id', { type: () => String })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ColumnResolver.prototype, "removeColumn", null);
exports.ColumnResolver = ColumnResolver = __decorate([
    (0, graphql_1.Resolver)(() => column_entity_1.Column),
    __metadata("design:paramtypes", [column_service_1.ColumnService])
], ColumnResolver);
//# sourceMappingURL=column.resolver.js.map