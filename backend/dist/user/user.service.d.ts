import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from 'src/auth/dto/register.dto';
export declare class UserService {
    private userRepository;
    constructor(userRepository: Repository<User>);
    create(createUserDto: RegisterDto): Promise<User>;
    findOne(id: number): Promise<User>;
    isConnectedToBoard(id: number, boardId: number): Promise<boolean>;
    isConnectedToSwimlane(id: number, swimlaneId: number): Promise<boolean>;
    update(id: number, updateUserDto: UpdateUserDto): Promise<import("typeorm").UpdateResult>;
    remove(id: number): Promise<import("typeorm").DeleteResult>;
}
