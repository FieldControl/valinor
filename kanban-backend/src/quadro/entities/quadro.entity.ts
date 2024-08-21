import { Coluna } from '../../coluna/entities/coluna.entity';
import { Usuario } from '../../usuario/entities/usuario.entity';
import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Quadro {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nome: string;

  @ManyToMany(() => Usuario, (usuario) => usuario.quadros, {
    onDelete: 'CASCADE',
  })
  usuarios: Usuario[];

  @OneToMany(() => Coluna, (quadro) => quadro.quadro)
  colunas: Coluna[];
}
