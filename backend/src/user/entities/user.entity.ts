import {
  BeforeInsert,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Board } from 'src/board/entities/board.entity';
import { Card } from 'src/card/entities/card.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ unique: true, length: 100 }) // Adicionando a restrição de unicidade para o email
  email: string;

  @Column({ length: 200 })
  password: string;

  @Column({ default: false })
  emailVerified: boolean;

  @ManyToMany(() => Board, (board) => board.users)
  @JoinTable()
  boards: Board[];

  @OneToMany(() => Card, (card) => card.assigne) // Corrigido o nome do parâmetro para 'card'
  cards: Card[];

  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }
}
