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
exports.BoardService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const board_entity_1 = require("./entities/board.entity");
const user_service_1 = require("../user/user.service");
let BoardService = class BoardService {
    constructor(boardRepository, userService) {
        this.boardRepository = boardRepository;
        this.userService = userService;
    }
    async isUserAssociatedWithBoard(boardId, userId) {
        const count = await this.boardRepository.count({
            where: { id: boardId, users: { id: userId } },
        });
        if (count === 0) {
            throw new common_1.UnauthorizedException('User is not associated with board');
        }
        return true;
    }
    async create(createBoardDto, userId) {
        const board = new board_entity_1.Board();
        board.name = createBoardDto.name;
        const user = await this.userService.findOne(userId);
        board.users = [user];
        return this.boardRepository.save(board);
    }
    findAllByUserId(userId) {
        return this.boardRepository.find({
            where: { users: { id: userId } },
            relations: ['users'],
        });
    }
    findOne(id, userId) {
        return this.boardRepository.findOne({
            where: {
                id,
                users: { id: userId },
            },
            relations: ['users', 'swimlanes', 'swimlanes.cards'],
        });
    }
    async update(id, userId, updateBoardDto) {
        await this.isUserAssociatedWithBoard(id, userId);
        return this.boardRepository.update(id, {
            name: updateBoardDto.name,
        });
    }
    async remove(id, userId) {
        await this.isUserAssociatedWithBoard(id, userId);
        return this.boardRepository.delete(id);
    }
};
exports.BoardService = BoardService;
exports.BoardService = BoardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(board_entity_1.Board)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        user_service_1.UserService])
], BoardService);
//# sourceMappingURL=board.service.js.map