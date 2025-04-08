import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Swimlane } from 'src/swimlane/entities/swimlane.entity';
import { User } from 'src/user/entities/user.entity';

@Entity() // Indica que essa classe é uma entidade do banco de dados (uma tabela no MySQL).
export class Card {
  @PrimaryGeneratedColumn() // Define a chave primária (id) como um número gerado automaticamente pelo banco.
  id: number;

  @Column({ length: 100 }) // Indica uma Coluna no Banco de Dados, seu atributo indica que o valor da propriedade pode ter um comprimento de no máximo 100 caracteres
  name: string;

  @Column()
  content: string;

  @Column()
  order: number;

  @Column({ nullable: true }) // O atributo nullable indica que o valor presente nessa propriedade pode ser nulo
  assignId: number;

  @ManyToOne(() => User, (user) => user.cards) // Indica que um usuário pode ter por muitos cards (relação 1:N).
  @JoinColumn()
  assign: User;

  @Column()
  swimlaneId: number;

  @ManyToOne(() => Swimlane, (swimlane) => swimlane.cards) // Indica que um card pode ter apenas um swimlane (relação N:1).
  @JoinColumn() // Cria uma coluna de junção para armazenar a relação entre o card e o swimlane
  swimlane: Swimlane;
}
