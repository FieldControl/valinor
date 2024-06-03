import { Coluna } from 'src/colunas/entities/coluna.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, OneToMany } from 'typeorm';

@Entity()
export class Quadro {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nome: string;
    
    @ManyToMany(() => Usuario, (usuario)=> usuario.quadro,{
        onDelete: 'CASCADE',
    })
    usuario: Usuario[];

    @OneToMany(() => Coluna, (quadro) => quadro.quadro, { cascade: true })
    colunas: Coluna[];

}
