import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/PrismaService';
import { cardDTO } from './cards.dto';

@Injectable()
export class CardsService {

    constructor(private prisma: PrismaService) {}

    async create(data: cardDTO){
        const cardExist = await this.prisma.card.findFirst({
            where: {
                OR: [
                  {
                    title: data.title, 
                    columnId: data.columnId, 
                  },
                  {
                    position: data.position, 
                    columnId: data.columnId, 
                  },
                ],
              },
        });

        if(cardExist?.title == data.title && cardExist.columnId == data.columnId) {
            throw new HttpException("Esse Card já existe na coluna atual!", HttpStatus.CONFLICT);
        }

        if(cardExist?.position == data.position){
            throw new HttpException("Já existe um card nessa posição, edite o card existente ou escolha novamente", HttpStatus.CONFLICT);
        }

        const columExist = await this.prisma.column.findFirst({
            where: {
                id: data.columnId
            }
        });

        if(!columExist) {
            throw new HttpException("A coluna informada no card não existe", HttpStatus.NOT_FOUND);
        }
        
        try {
            return await this.prisma.card.create({
                data: {
                    title: data.title,
                    description: data.description,
                    position: data.position,
                    columnId: data.columnId
                }
            });
        } catch(error){
            throw new HttpException("Erro ao Cadastrar Card", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findAll(){
        try {
            return await this.prisma.card.findMany({
                orderBy: {
                    position: 'asc'
                }
            });
        } catch(error){
            throw new HttpException('Não foi possível localizar nenhum card', HttpStatus.NOT_FOUND);
        }
    }

    async findById(id: number){
        const cardExist = await this.prisma.card.findUnique({
            where: {
                id
            }
        })

        if(!cardExist) {
            throw new HttpException('Card não encontrado', HttpStatus.NOT_FOUND)
        }

        return cardExist;
    }
    
    async update(id: number, data: cardDTO){

        await this.findById(id);

        if(data.columnId){
            const columExist = await this.prisma.column.findUnique({
                where: {
                    id: data.columnId
                }
            })

            if(!columExist) {
                throw new HttpException("A coluna informada não existe", HttpStatus.NOT_FOUND);
            }
        }
        
        return await this.prisma.card.update({
            data,
            where: {
                id
            }
        })
    }

    async delete(id: number){

        await this.findById(id);

        return await this.prisma.card.delete({
            where: {
                id
            }
        })
    }
}
