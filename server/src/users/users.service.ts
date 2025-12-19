import { Injectable } from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { PrismaService } from 'src/prisma/prisma.service';
import { HashService } from 'src/common/hash/hash.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hashService: HashService
  ) {}

  async create(createUserInput: CreateUserInput) {
    const hash = await this.hashService.hashPassword(createUserInput.password)
    const user = await this.prismaService.user.create({
      data: {
        vc_name: createUserInput.name,
        vc_email: createUserInput.email,
        vc_password: hash
      }
    });
    return {
      id: user.sr_id,
      name: user.vc_name,
      email: user.vc_email,
      createdAt: user.dt_createdAt
    };
  }


  findAll() {
    return `This action returns all users`;
  }

  async findOne(id: number) {
    return await this.prismaService.user.findUnique({
      where: { sr_id: id }
    });
  }

  async findByEmail(email: string) {
    return await this.prismaService.user.findUnique({
      where: { vc_email: email }
    });
  }

}
