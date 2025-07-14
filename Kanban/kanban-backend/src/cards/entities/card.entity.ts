// Importa os decorators necessários do TypeORM.
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

/**
 * @Entity() marca esta classe como uma entidade do TypeORM.
 * A tabela correspondente no banco de dados será chamada 'card'.
 */
@Entity()
export class Card {
  /**
   * @PrimaryGeneratedColumn() define a 'id' como a chave primária da tabela,
   * com valor gerado automaticamente pelo banco de dados.
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * @Column() define 'title' como uma coluna do tipo texto.
   */
  @Column()
  title: string;

  /**
   * @Column({ default: '' }) define 'description' como uma coluna de texto.
   * O 'default: '' ' garante que, se nenhuma descrição for fornecida,
   * o banco de dados salvará uma string vazia em vez de 'null'.
   */
  @Column({ default: '' })
  description: string;

  /**
   * @Column() para a ID da coluna à qual este card pertence.
   * No futuro, isso se tornará uma relação (foreign key) com a entidade 'Column'.
   */
  @Column()
  columnId: number;

  /**
   * @Column() para a 'badge' de prioridade.
   */
  @Column()
  badge: 'low' | 'medium' | 'high';

  
  // Armazena a ID do utilizador que é o "dono" deste card.
  @Column()
  userId: number;
}
   
  