//confiiguração padrão, service injetavel
import { Injectable, UnauthorizedException } from '@nestjs/common';

//arquivos DTO das Colunas
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';

//Database
import { InjectRepository } from '@nestjs/typeorm';
import { Card } from './entities/card.entity';
import { Repository } from 'typeorm';
import { ColumnService } from 'src/column/column.service';

@Injectable()
export class CardService {

  //importando o Repositorio contendo a coluna User do DataBase SQL.
  constructor(@InjectRepository(Card) private cardRepository : Repository<Card>,
private columnService : ColumnService) {}
  

  async create(createCardDto: CreateCardDto, userId: number) {
    const card = new Card();
    card.name = createCardDto.name;
    card.content = createCardDto.content;
    card.columnId = createCardDto.columnId;
    const hasAccessToColumn = await this.columnService.hasAccessToColumn(createCardDto.columnId, userId);
    return this.cardRepository.save(card);

    if (!hasAccessToColumn){
      throw new UnauthorizedException('acesso não autorizado')
    }
  }


  update(id: number,userId: number, updateCardDto: UpdateCardDto) {
    return this.cardRepository.update({
      id,
      columns: {
        board: {
          users: {id: userId},
        }
      }
    },
    {
      name: UpdateCardDto.name,
      content: updateCardDto.content,
    });
  }

  remove(id: number, userId : number) {
    return this.cardRepository.delete({
      id,
      columns: {
        board: {
          users: {
            id: userId
          }
        }
      }
    });
  }
}
