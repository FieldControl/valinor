import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';
import { TokenService } from 'src/token/token.service';

@Injectable()
export class AuthService {
  constructor(private userService: UsersService, 
              private jwtService: JwtService,
              private tokenService: TokenService) {
  }

    async validateUser(email: string, password: string): Promise<User> {
      const user = await this.userService.findByMail(email)
      if (user && user.password === password) {
        return user
      }
      return null
    }

    async login(user: any) {
      const payload = { username: user.email, sub: user._id }
      const token = this.jwtService.sign(payload)
      this.tokenService.saveToken(token, user.email)
      return {
        acess_token: token
      }
    }
}
