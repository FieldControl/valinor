import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Board } from 'src/board/entities/board.entity';
import { Card } from 'src/card/entities/card.entity';

@Entity() // Indica que essa classe é uma entidade do banco de dados (uma tabela no MySQL).
export class Swimlane {
  @PrimaryGeneratedColumn() // Define a chave primária (id) como um número gerado automaticamente pelo banco.
  id: number;

  @Column({ length: 100 }) // Indica uma Coluna no Banco de Dados, seu atributo indica que o valor da propriedade pode ter um comprimento de no máximo 100 caracteres
  name: string;

  @Column()
  order: number;

  @Column()
  boardId: number;

  @ManyToOne(() => Board, (board) => board.swimlanes) // Indica que um board pode ter várias swimlanes e uma swimlane pertence a um board (relação N:1).

  @JoinColumn() // Cria uma coluna de junção para armazenar a chave estrangeira (boardId) na tabela Swimlane.
  board: Board;

  @OneToMany(() => Card, (card) => card.swimlane) // Indica que uma swimlane pode ter vários cards e um card pertence a uma swimlane (relação 1:N).
  cards: Card[];
}
