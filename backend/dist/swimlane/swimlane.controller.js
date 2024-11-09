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
exports.SwimlaneController = void 0;
const common_1 = require("@nestjs/common");
const swimlane_service_1 = require("./swimlane.service");
const create_swimlane_dto_1 = require("./dto/create-swimlane.dto");
const update_swimlane_dto_1 = require("./dto/update-swimlane.dto");
const auth_guard_1 = require("../auth/auth/auth.guard");
const reorder_swimlane_dto_1 = require("./dto/reorder-swimlane.dto");
let SwimlaneController = class SwimlaneController {
    constructor(swimlaneService) {
        this.swimlaneService = swimlaneService;
    }
    create(req, createSwimlaneDto) {
        return this.swimlaneService.create(createSwimlaneDto, req.user.id);
    }
    updateOrder(req, reorderedSwimlanes) {
        return this.swimlaneService.updateSwimlaneOrders(reorderedSwimlanes, req.user.id);
    }
    findAll(boardId, req) {
        return this.swimlaneService.findAllByBoardId(Number(boardId), req.user.id);
    }
    update(id, updateSwimlaneDto, req) {
        return this.swimlaneService.update(+id, req.user.id, updateSwimlaneDto);
    }
    remove(id, req) {
        return this.swimlaneService.remove(+id, req.user.id);
    }
};
exports.SwimlaneController = SwimlaneController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_swimlane_dto_1.CreateSwimlaneDto]),
    __metadata("design:returntype", void 0)
], SwimlaneController.prototype, "create", null);
__decorate([
    (0, common_1.Put)('update-order'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, reorder_swimlane_dto_1.ReordereSwimlaneDto]),
    __metadata("design:returntype", void 0)
], SwimlaneController.prototype, "updateOrder", null);
__decorate([
    (0, common_1.Get)('/board/:boardId'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)('boardId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SwimlaneController.prototype, "findAll", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_swimlane_dto_1.UpdateSwimlaneDto, Object]),
    __metadata("design:returntype", void 0)
], SwimlaneController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SwimlaneController.prototype, "remove", null);
exports.SwimlaneController = SwimlaneController = __decorate([
    (0, common_1.Controller)('swimlane'),
    __metadata("design:paramtypes", [swimlane_service_1.SwimlaneService])
], SwimlaneController);
//# sourceMappingURL=swimlane.controller.js.map