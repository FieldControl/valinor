import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'teste123', // Use the same key as in the module
    });
  }

  
  async validate(payload: any) {
    const user = await this.usersService.findOneByUsername(payload.username);
    if (!user) {
      throw new UnauthorizedException();
    }
    return { userId: user.id, username: user.username };
  }
}