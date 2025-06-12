import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './DTO/create-user.dto';
import { UserService } from 'src/user/user.service';

@Controller('auth')
export class AuthController {
    private readonly _authService: AuthService;
    private readonly _userService: UserService;
    constructor(authService: AuthService, userService: UserService) {
        this._authService = authService;
        this._userService = userService;
    }

    @Post('register')
    async register(@Body() model: CreateUserDto) {
        model.email = model.email.toLowerCase();
        this._userService.create(model);
    }
}
