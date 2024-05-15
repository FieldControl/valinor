import { Quadro } from "src/quadro/entities/quadro.entity";
import { Tarefa } from "src/tarefa/entities/tarefa.entity";
import { BeforeInsert, Column, Entity, InsertQueryBuilder, JoinColumn, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Usuario {
    @PrimaryGeneratedColumn()
    id : number;
    
    @Column()
    email: string;

    @Column()
    senha: string;

    @Column()
    nome: string;
    
    @Column()
    sobrenome: string;
    
    @OneToMany(()=> Tarefa, (tarefa) => tarefa.destinatario)
    tarefas : Tarefa[];

    @OneToMany(()=> Quadro, (quadro) => quadro.usuario)
    quadros : Quadro[];

}
  
