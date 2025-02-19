import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/PrismaService';
import { columnDTO } from './columns.dto';

@Injectable()
export class ColumnsService {

    constructor(private prisma: PrismaService) {}

    async findById(id: number){
        const columnExist = await this.prisma.column.findUnique({
            where: {
                id,
            },
            include: {
                cards: true
            }
        });

        if(!columnExist){
            throw new HttpException("Coluna não encontrada", HttpStatus.NOT_FOUND);
        }

        return columnExist;
    }

    async create(data: columnDTO){
        
        if(data.position >= 0) {
            const columExist = await this.prisma.column.findFirst({
                where: {
                    position: data.position
                }
            })

            if(columExist){
                throw new HttpException("Número de coluna em uso, escolha outra ou edite a existente", HttpStatus.CONFLICT)
            }

            return await this.prisma.column.create({data})

        } else {
            throw new HttpException("A posição da coluna deve ser maior que zero", HttpStatus.CONFLICT)
        }
    }

    async findAll(){
        try {
            return await this.prisma.column.findMany({
                include: {
                    cards: true
                },
                orderBy: {
                    position: 'asc', 
                }
            });
        } catch(error) {
            throw new HttpException("Não foi possível encontrar as colunas", HttpStatus.INTERNAL_SERVER_ERROR);
        }   
    }

    async update(id: number, data: columnDTO){

        await this.findById(id);

        if(data.position >= 0){
            return await this.prisma.column.update({
                data,
                where: {
                    id
                }
            })
        } else {
            throw new HttpException("A posição da coluna deve ser maior que zero", HttpStatus.CONFLICT)
        }
    }

    async delete(id: number){

        const cardExistAtColumn = await this.prisma.card.findFirst({
            where: {
                columnId: id
            }
        })

        if(cardExistAtColumn) {
            throw new HttpException("Não é possível excluir uma coluna que possui cards", HttpStatus.CONFLICT); 
        }

        await this.findById(id)

        return await this.prisma.column.delete({
            where: {
                id,
            }
        });
    }
}
