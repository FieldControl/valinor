import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'colunas' })
export class Coluna {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ nullable: false })
  title: string;
  
}
