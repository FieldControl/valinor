import { ObjectType, Field } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
@ObjectType()
export class User {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @Column()
  @Field()
  name: string;

  @Column({ unique: true }) // O email não pode repetir no banco
  @Field()
  email: string;

  @Column()
  // @Field() <--- NÃO colocamos @Field aqui. Assim a senha nunca é enviada para o Frontend!
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}