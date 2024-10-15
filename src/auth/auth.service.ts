import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterUserDto } from 'src/DTO/register-user-dto';
import { UserEntity } from 'src/Entity/user.entity';
import { Repository } from 'typeorm/repository/Repository';
import * as bcrypt from 'bcryptjs';
import { UserLoginDto } from 'src/DTO/user-login-dto';
import { JwtService } from '@nestjs/jwt/dist/jwt.service';

@Injectable()
export class AuthService {
    constructor(@InjectRepository(UserEntity) private repo: Repository<UserEntity>,
        private jwt: JwtService) {
    }

    async registerUser(registerDTO: RegisterUserDto) {
        const hashed = await bcrypt.hash(registerDTO.password, 12);
        const salt = await bcrypt.getSalt(hashed);

        const user = new UserEntity();
        user.username = registerDTO.username;
        user.password = hashed;
        user.salt = salt;

        this.repo.create(user);

        try {
            return await this.repo.save(user);
        } catch (err) {
            throw new InternalServerErrorException('Ocorreu um erro ao criar o usuario.');
        }
    }

    async loginUser(userLoginDTO: UserLoginDto) {
        const { username, password } = userLoginDTO;

        const user = await this.repo.findOneBy({ username });

        if (!user) {
            throw new UnauthorizedException('Credenciais invalidas');
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password)

        if (isPasswordMatch) {
            const jwtPayload = { username };
            const jwtToken = await this.jwt.signAsync(jwtPayload, { expiresIn: '1d', algorithm: 'HS512' });
            return { token: jwtToken };
        } else {
            throw new UnauthorizedException('Credenciais invalidas');
        }
    }
}
