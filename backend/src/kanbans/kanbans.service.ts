import { Body, Get, Injectable, Post } from '@nestjs/common';
import { EntityManager } from 'typeorm';
@Injectable()
export class KanbansService {

    constructor(
        @EntityManager()
        private readonly entityManager: EntityManager,) {}

    private kanbans = [
        {
            id : 1,
            name: 'Field',
            description: 'Entrega kanban FieldControl',
            dataInicio: '18/04/2024',
            dataFim : '25/04/2024',
            status: 'Fazendo'
        }
    ]

    @Get()
    getKanbans(){
        
        return this.kanbans
    }

    @Post()
    createKanbans( dados : any){
        const newKanban = {
            id: this.kanbans.length + 1,
            name: dados.nome,
            description: dados.descricao,
            dataInicio: '',
            dataFim: '',
            status: ''
        };
        this.kanbans.push(newKanban);
    }

    async updateKanban(id: string, dados: any) {
        const kanban = await this.entityManager.findOne(dados, id);
      
        const updateKanban = { ...kanban, ...dados };
        return this.entityManager.save(dados, updateKanban);
      }

}
