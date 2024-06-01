import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Token, TokenDocument } from './token.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class TokenService {

  constructor(@InjectModel(Token.name) private tokenModel: Model<TokenDocument>,
              private userService: UsersService,
              @Inject(forwardRef(() => AuthService))
              private authService: AuthService) {}

  async saveToken(hash: string, responsible: string) {
    try {
      let objToken = await this.tokenModel.findOne({ responsible: responsible })
      if (objToken) {
        await this.tokenModel.findByIdAndUpdate(objToken._id, { hash: hash }, { new: true })
      } else {

        return await this.tokenModel.create({hash: hash, responsible: responsible});
      }
    } catch (error) {
      throw new Error(`Falha ao salvar o token: ${error.message}`);
    }
}

async refreshToken(oldToken: string){
  let objToken = await this.tokenModel.findOne({ hash: oldToken })
  if (objToken) {
    let user = await this.userService.findByMail(objToken.responsible)

    return this.authService.login(user)
  } else {  // requisição invalida, token não existe
    return new HttpException({ errorMessage: 'Token inválido' }, HttpStatus.UNAUTHORIZED) // nao consegui implementar no front, apesar de funcional
  }
}
  
}
