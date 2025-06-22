import { Entity, PrimaryGeneratedColumn, Column} from 'typeorm';


//Representar a entidade Task
export enum TaskStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;// ID único da tarefa

  @Column()
  title: string;// Título da tarefa

  @Column() //
  description: string;// Descrição da tarefa


  @Column({ default: false })
  completed: boolean; // Indica se a tarefa foi concluída


  @Column({ type: 'varchar' , default: TaskStatus.OPEN }) //Use o tipo 'varchar' para armazenar o status como string, pois o TypeORM não suporta enums diretamente
  status: TaskStatus;// Status da tarefa, pode ser OPEN, IN_PROGRESS ou DONE

}