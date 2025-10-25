// session.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';

@Injectable()
export class SessionMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    let sessionId = req.cookies['sessionId'];
    if (!sessionId) {
      sessionId = uuid();
      res.cookie('sessionId', sessionId, { httpOnly: true, sameSite: 'none', secure: true });
    }
    req['sessionId'] = sessionId;
    next();
  }
}
