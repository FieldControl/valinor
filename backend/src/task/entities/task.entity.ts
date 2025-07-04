import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm"
import { StatusTarefa } from "../task.status.enum"

@Entity('Tarefas')
export class Task 
{
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    titulo: string
    
    @Column({nullable: true})
     descricao?: string
    
    @Column(
        {
            type: 'int',
            enum: StatusTarefa,
        }
    )
    status: StatusTarefa
}
