import { BeforeInsert, Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import * as bcrypt from 'bcrypt'; // Biblioteca para criptografar a senha no banco
import { Board } from 'src/board/entities/board.entity';
import { Card } from 'src/card/entities/card.entity';

@Entity() // Indica que essa classe é uma entidade do banco de dados (uma tabela no MySQL).
export class User {
  @PrimaryGeneratedColumn() // Define a chave primária (id) como um número gerado automaticamente pelo banco.
  id: number;

  @Column({ length: 100 }) // Indica uma Coluna no Banco de Dados, seu atributo indica que o valor da propriedade pode ter um comprimento de no máximo 100 caracteres
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ length: 100, unique: true }) // O atributo unique indica que o valor presente nessa propriedade não poderá será igual ao de nenhuma outra linha nessa coluna
  email: string;

  @Column({ length: 200 })
  password: string;

  @Column({ default: false })
  emailVerified: boolean;

  @ManyToMany(() => Board, (board) => board.users) // Indica que um usuário pode participar de vários boards e um board pode ter vários usuários (relação N:N).
  @JoinTable() // Cria uma tabela intermediária para armazenar essa relação.
  boards: Board[];

  @OneToMany(() => Card, (user) => user.assign) // Indica que um usuário pode ter por muitos cards (relação 1:N).
  cards: Card[];

  @BeforeInsert() // Antes de inserir, criptografa a senha
  async hashPassword() { // este método criptografa a senha usando bcrypt, o valor 10 representa o salt rounds, que aumenta a segurança do hash.
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }
}
