import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert, OneToMany } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { BoardEntity } from './board.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  theme: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
  creation_date: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
  change_date: Date;

  @OneToMany(() => BoardEntity, board => board.user) 
  boards: BoardEntity[];

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  async comparePassword(password: string): Promise<boolean> {
    return password === this.password;
  }

  async comparePasswordCrypt(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}
