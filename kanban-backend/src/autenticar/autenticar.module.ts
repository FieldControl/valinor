import { Module } from '@nestjs/common';
import { AutenticarService } from './autenticar.service'; 
import { AutenticarController } from './autenticar.controller'; 
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from '../usuario/entities/usuario.entity'; 
import { JwtModule } from '@nestjs/jwt';
import { UsuarioModule } from '../usuario/usuario.module'; 

@Module({
  controllers: [AutenticarController],
  providers: [AutenticarService],
  imports: [
    UsuarioModule,
    TypeOrmModule.forFeature([Usuario]),
    JwtModule.register({
      global: true,
      secret: 'secretKey',
      signOptions: { expiresIn: '3h' },
    }),
  ],
})
export class AutenticarModule {}
