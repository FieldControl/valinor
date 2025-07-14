// ARQUIVO: src/users/entities/user.entity.ts

import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

/**
 * @Entity() marca esta classe como uma entidade do TypeORM.
 * Isto significa que ela será mapeada para uma tabela no banco de dados
 * que, por defeito, terá o nome da classe em minúsculas: 'user'.
 */
@Entity()
export class User {
  /**
   * @PrimaryGeneratedColumn() define a 'id' como a chave primária da tabela.
   * O banco de dados irá gerar automaticamente um valor numérico único e incremental
   * para cada novo utilizador criado (1, 2, 3, ...).
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * @Column({ unique: true }) marca a propriedade 'email' como uma coluna na tabela.
   * - O 'unique: true' é uma restrição importante que garante que não possam
   * existir dois utilizadores com o mesmo endereço de email no banco de dados.
   */
  @Column({ unique: true })
  email: string;

  /**
   * @Column() marca a propriedade 'password' como uma coluna.
   * Esta coluna irá guardar a senha do utilizador de forma CRIPTOGRAFADA (o "hash"),
   * nunca em texto plano.
   */
  @Column()
  password: string;

  /**
   * Armazena o URL da imagem de perfil do utilizador.
   * - 'nullable: true' permite que o campo seja vazio (para novos utilizadores).
   * - 'default: ...' define uma imagem genérica padrão para novos utilizadores.
   */
  @Column({
    nullable: true,
    default: 'https://www.shutterstock.com/image-vector/default-avatar-profile-icon-social-600nw-1906669723.jpg' // URL de uma imagem de perfil genérica
  })
  profileImageUrl: string;
}