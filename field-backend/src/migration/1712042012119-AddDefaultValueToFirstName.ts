import {MigrationInterface, QueryRunner} from "typeorm";

export class AddDefaultValueToFirstNameXXXXXXXXXXXX implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user"
            ADD COLUMN "firstName" VARCHAR(255) NOT NULL DEFAULT 'Nome Padrão';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user" DROP COLUMN "firstName";
        `);
    }

}
