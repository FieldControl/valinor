import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';

@Injectable()
export class CardsService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateCardDto) {
    return this.prisma.card.create({ data });
  }

findAll() {
  return this.prisma.card.findMany({
    include: { column: true },
  });
}

update(id: number, data: UpdateCardDto) {
  return this.prisma.card.update({
    where: { id },
    data,
  });
}

remove(id: number) {
  return this.prisma.card.delete({ where: { id } });
}
}