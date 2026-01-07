import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'your-secret-key-change-this-in-production'),
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findOne(payload.sr_id);
    
    if (!user) {
      throw new UnauthorizedException();
    }

    return { 
      sr_id: payload.sr_id, 
      email: payload.email,
      name: payload.name 
    };
  }
}
