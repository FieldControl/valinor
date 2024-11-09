import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { PayloadRequest } from 'src/auth/auth/auth.guard';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    findOne(req: PayloadRequest): Promise<import("src/user/entities/user.entity").User>;
    update(updateUserDto: UpdateUserDto, req: PayloadRequest): Promise<import("typeorm").UpdateResult>;
    remove(req: PayloadRequest): Promise<import("typeorm").DeleteResult>;
}
