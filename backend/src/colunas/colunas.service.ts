import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateColunaDto } from './dto/create-coluna.dto';
import { UpdateColunaDto } from './dto/update-coluna.dto';
import { Coluna } from './entities/coluna.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ColunasService {
  constructor(
    @InjectRepository(Coluna)
    private colunasRepository: Repository<Coluna>) {}

    async create(CreateColunaDto: CreateColunaDto) {
      const coluna = this.colunasRepository.create(CreateColunaDto);
      return await this.colunasRepository.save(coluna);
    }

    async findAll() {
      if (!await this.colunasRepository.find()) throw new NotFoundException('Nenhuma coluna encontrada.')
      return await this.colunasRepository.find();
    }

    async findOne(id: number) {
      if (!await this.colunasRepository.findOneBy({id})) throw new NotFoundException(`Coluna id:${id} não encontrada`)
      return await this.colunasRepository.findOneBy({id});
    }

    async update(id: number, updateColunaDto: UpdateColunaDto): Promise<Coluna> {
      const coluna = await this.colunasRepository.findOneBy({id});
      if (!coluna) {
        throw new NotFoundException(`Coluna id:${id} não encontrada.`);
      }
      coluna.title = updateColunaDto.title; 
      return await this.colunasRepository.save(coluna);
    }

    async remove(id: number) {
      const coluna = await this.findOne(id);
      await this.colunasRepository.remove(coluna);
      return { message: `Coluna id:${id} removida com sucesso.` };
    }
}
