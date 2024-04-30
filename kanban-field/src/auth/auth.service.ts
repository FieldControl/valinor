import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
  constructor(private userService: UsersService) {}

    async validateUser(email: string, password: string): Promise<any> {
      const user = await this.userService.findByMail(email)
      if (user && user.password === password) {
        const { password, ...result } = user
        return result
      }
      return null
    }
}
