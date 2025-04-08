import { Swimlane } from 'src/swimlane/entities/swimlane.entity'; // Importando a entidade Swimlane
import { User } from 'src/user/entities/user.entity'; // Importando a entidade User
import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm'; // Importando decorators do TypeORM

@Entity() // Indica que essa classe é uma entidade do banco de dados (uma tabela no MySQL).
export class Board { // Definindo a classe Board
  @PrimaryGeneratedColumn() // Define a chave primária (id) como um número gerado automaticamente pelo banco.
  id: number;

  @Column({ length: 100 }) // Indica uma Coluna no Banco de Dados, seu atributo indica que o valor da propriedade pode ter um comprimento de no máximo 100 caracteres
  name: string;

  @ManyToMany(() => User, (user) => user.boards, { // Indica que um board pode ter vários usuários e um usuário pode participar de vários boards (relação N:N).
    onDelete: 'CASCADE', // Se o board for deletado, os usuários associados também serão deletados.
  })
  users: User[]; // Array de usuários associados a esse board

  @OneToMany(() => Swimlane, (board) => board.board) // Indica que um board pode ter várias swimlanes (relação 1:N).
  swimlanes: Swimlane[]; // Array de swimlanes associadas a esse board
}
