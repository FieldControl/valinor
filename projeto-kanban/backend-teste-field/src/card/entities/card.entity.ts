import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType() // necessário para GraphQL
@Entity()
export class Card {
	@Field(() => Int)
	@PrimaryGeneratedColumn()
	id: number;

	@Field()
	@Column()
	title: string;

	@Field({ nullable: true })
	@Column({ nullable: true })
	description: string;

	@Field({ nullable: true })
	@Column({ nullable: true })
	columnId: number;
}