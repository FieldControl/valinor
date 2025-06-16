import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'SEU_JWT_SECRET_AQUI',
    });
  }

  async validate(payload: any) {
    // Aqui o payload é o objeto que assinamos no login
    return { userId: payload.sub, username: payload.username, role: payload.role };
  }
}
