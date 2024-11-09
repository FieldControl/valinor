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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("./entities/user.entity");
const typeorm_2 = require("typeorm");
let UserService = class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    create(createUserDto) {
        const user = new user_entity_1.User();
        user.email = createUserDto.email;
        user.firstName = createUserDto.firstName;
        user.lastName = createUserDto.lastName;
        user.password = createUserDto.password;
        return this.userRepository.save(user);
    }
    findOne(id) {
        return this.userRepository.findOneBy({ id });
    }
    async isConnectedToBoard(id, boardId) {
        const user = await this.userRepository.findOne({
            where: {
                id,
                boards: {
                    id: boardId,
                },
            },
            relations: ['boards'],
        });
        if (!user) {
            throw new common_1.UnauthorizedException('You are not a part of this board.');
        }
        return true;
    }
    async isConnectedToSwimlane(id, swimlaneId) {
        const user = await this.userRepository.findOne({
            where: {
                id,
                boards: {
                    swimlanes: {
                        id: swimlaneId,
                    },
                },
            },
            relations: ['boards', 'boards.swimlanes'],
        });
        if (!user) {
            throw new common_1.UnauthorizedException('You are not a part of this board.');
        }
        return true;
    }
    update(id, updateUserDto) {
        return this.userRepository.update(id, {
            firstName: updateUserDto.firstName,
            lastName: updateUserDto.lastName,
        });
    }
    remove(id) {
        return this.userRepository.delete(id);
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UserService);
//# sourceMappingURL=user.service.js.map