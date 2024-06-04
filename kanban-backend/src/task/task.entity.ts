import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

     @Entity()
     export class Task {
       @PrimaryGeneratedColumn()
       id: number;

       @Column()
       title: string;

       @Column()
       description: string;

       @Column()
       status: string;
     }