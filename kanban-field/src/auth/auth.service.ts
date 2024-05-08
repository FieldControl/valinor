import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(private userService: UsersService, private jwtService: JwtService) {
  }

    async validateUser(email: string, password: string): Promise<User> {
      const user = await this.userService.findByMail(email)
      if (user && user.password === password) {
        return user
      }
      return null
    }

    async login(user: any) {
      const payload = { username: user.username, sub: user._id }
      return {
        acess_token: this.jwtService.sign(payload)
      }
    }
}
