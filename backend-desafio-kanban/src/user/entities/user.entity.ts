import {
  BeforeInsert,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm'; // Importa os decoradores necessários para definir a entidade e suas colunas
import * as bcrypt from 'bcrypt'; // Importa a biblioteca `bcrypt` para criar hashes seguros de senhas e verificar sua autenticidade.
import { Board } from 'src/board/entities/board.entity';
import { Card } from 'src/card/entities/card.entity';

// Define a classe "User" como uma entidade do banco de dados
@Entity()
export class User {
  // Define o campo "id" como a chave primária gerada automaticamente
  @PrimaryGeneratedColumn()
  idUser: number;

  // Define as colunas com o tipo string e limite de 100 caracteres
  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ length: 100 })
  emailUser: string;

  // nesse caso são 200 caracteres
  @Column({ length: 200 })
  passwordUser: string;

  // Define a coluna "emailVerified" com o valor padrão "false"
  @Column({ default: false })
  emailVerified: boolean;

  @ManyToMany(() => Board, (board) => board.users)
  @JoinTable()
  boards: Board[];

  @OneToMany(() => Card, (user) => user.assigne)
  @JoinTable()
  cards: Card[];

  // O método `hashPassword` utiliza o `bcrypt` para hash da senha antes de inseri-la no banco de dados, garantindo segurança.
  @BeforeInsert()
  async hashPassword() {
    if (this.passwordUser) {
      this.passwordUser = await bcrypt.hash(this.passwordUser, 10);
    }
  }
}
