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
exports.SwimlaneService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const swimlane_entity_1 = require("./entities/swimlane.entity");
const typeorm_2 = require("typeorm");
const user_service_1 = require("../user/user.service");
let SwimlaneService = class SwimlaneService {
    constructor(swimlaneRepository, userService) {
        this.swimlaneRepository = swimlaneRepository;
        this.userService = userService;
    }
    async create(createSwimlaneDto, userId) {
        const swimlane = new swimlane_entity_1.Swimlane();
        swimlane.name = createSwimlaneDto.name;
        swimlane.order = createSwimlaneDto.order;
        swimlane.boardId = createSwimlaneDto.boardId;
        await this.userService.isConnectedToBoard(userId, swimlane.boardId);
        return this.swimlaneRepository.save(swimlane);
    }
    async updateSwimlaneOrders(reorder, userId) {
        await this.userService.isConnectedToBoard(userId, reorder.boardId);
        const promises = reorder.items.map((swimlane) => this.swimlaneRepository.update(swimlane.id, { order: swimlane.order }));
        await Promise.all(promises);
        return true;
    }
    async hasAccessToSwimlane(swimlaneId, userId) {
        const hasAccess = await this.swimlaneRepository.count({
            where: {
                id: swimlaneId,
                board: { users: { id: userId } },
            },
        });
        return hasAccess > 0;
    }
    findAllByBoardId(boardId, userId) {
        return this.swimlaneRepository.find({
            where: {
                boardId,
                board: { users: { id: userId } },
            },
        });
    }
    async update(id, userId, updateSwimlaneDto) {
        await this.userService.isConnectedToBoard(userId, updateSwimlaneDto.boardId);
        return this.swimlaneRepository.update(id, {
            name: updateSwimlaneDto.name,
        });
    }
    async remove(id, userId) {
        await this.userService.isConnectedToSwimlane(userId, id);
        return this.swimlaneRepository.delete(id);
    }
};
exports.SwimlaneService = SwimlaneService;
exports.SwimlaneService = SwimlaneService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(swimlane_entity_1.Swimlane)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        user_service_1.UserService])
], SwimlaneService);
//# sourceMappingURL=swimlane.service.js.map