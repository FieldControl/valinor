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
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("../models/user.service");
const library_1 = require("@prisma/client/runtime/library");
let UserController = class UserController {
    async postUsers(body) {
        const user = new user_service_1.Users(null, body.name, body.email, body.password);
        return await new user_service_1.Users().postUser(user);
    }
    async putUser(id, body) {
        console.log(body);
        console.log(id);
        try {
            const user = new user_service_1.Users(id, body.name, body.email, body.password);
            console.log(user);
            return await new user_service_1.Users().putUser(user);
        }
        catch (error) {
            if (error instanceof library_1.PrismaClientKnownRequestError &&
                error.code === "P2025") {
                throw new common_1.NotFoundException("Usuário não encontrado");
            }
            throw error;
        }
    }
    async deleteUser(id) {
        return await new user_service_1.Users().deleteUser(id);
    }
    async login(body) {
        return await new user_service_1.Users().login(body.email, body.password);
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_service_1.Users]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "postUsers", null);
__decorate([
    (0, common_1.Put)("/:id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_service_1.Users]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "putUser", null);
__decorate([
    (0, common_1.Delete)("/:id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Post)("/login"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_service_1.Users]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "login", null);
exports.UserController = UserController = __decorate([
    (0, common_1.Controller)("/user")
], UserController);
//# sourceMappingURL=user.controller.js.map