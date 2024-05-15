import { Quadro } from "src/quadro/entities/quadro.entity";
import { Tarefa } from "src/tarefa/entities/tarefa.entity";
import { Usuario } from "src/usuario/entities/usuario.entity";
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { JoinAttribute } from "typeorm/query-builder/JoinAttribute";

@Entity()
export class Coluna {

    @PrimaryGeneratedColumn()
    id : number;

    @Column()
    nome : string;

    @Column()
    ordem : number = 0;


    @ManyToOne(()=> Quadro, (quadro) => quadro.colunas)
    @JoinColumn()
    quadro : Quadro;

    @Column()
    quadroId: number;
    

    @OneToMany(()=> Tarefa, (tarefa) => tarefa.coluna)
    tarefas : Tarefa[];


}
