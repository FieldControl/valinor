import { Swimlane } from 'src/swimlane/entities/swimlane.entity'; // Importa a entidade Swimlane
import { User } from 'src/user/entities/user.entity'; // Importa a entidade User
import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'; // Importa os decoradores do TypeORM

@Entity()
export class Board {
  @PrimaryGeneratedColumn() // Define a coluna 'id' como chave primária e autoincrementada
  id: number;

  @Column({ length: 100 }) // Define a coluna 'name' com um limite de 100 caracteres
  name: string;

  @ManyToMany(() => User, (user) => user.boards, {
    onDelete: 'CASCADE', // Se um usuário for deletado, remove suas associações com boards
  })
  users: User[]; // Relação muitos-para-muitos com a entidade User

  @OneToMany(() => Swimlane, (swimlane) => swimlane.board) // Define a relação um-para-muitos com Swimlane
  swimlanes: Swimlane[]; // Um board pode ter várias swimlanes
}
