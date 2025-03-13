import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super();
  }
  //metodo para conectar ao banco de dados
  async onModuleInit() {
    await this.$connect();
  }
  //metodo para desconectar do banco de dados
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
