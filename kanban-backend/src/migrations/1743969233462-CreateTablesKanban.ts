import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTablesKanban1743969233462 implements MigrationInterface {
  name = 'CreateTablesKanban1743969233462';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "card_entity" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "description" character varying, "columnId" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b9a88963999378ac2b88052a3ce" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "card_entity"`);
  }
}
