import { MigrationInterface, QueryRunner } from "typeorm";

export class FixTasksTable1749864325186 implements MigrationInterface {
    name = 'FixTasksTable1749864325186'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "temporary_task" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "columnId" integer NOT NULL, "title" varchar(255) NOT NULL, CONSTRAINT "FK_f56fe6f2d8ab0b970f764bd601b" FOREIGN KEY ("columnId") REFERENCES "column" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_task"("id", "createdAt", "updatedAt", "columnId", "title") SELECT "id", "createdAt", "updatedAt", "columnId", "title" FROM "task"`);
        await queryRunner.query(`DROP TABLE "task"`);
        await queryRunner.query(`ALTER TABLE "temporary_task" RENAME TO "task"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task" RENAME TO "temporary_task"`);
        await queryRunner.query(`CREATE TABLE "task" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "columnId" integer NOT NULL, "title" varchar(255) NOT NULL, "description" varchar NOT NULL, "status" varchar NOT NULL, "position" integer NOT NULL, CONSTRAINT "FK_f56fe6f2d8ab0b970f764bd601b" FOREIGN KEY ("columnId") REFERENCES "column" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "task"("id", "createdAt", "updatedAt", "columnId", "title") SELECT "id", "createdAt", "updatedAt", "columnId", "title" FROM "temporary_task"`);
        await queryRunner.query(`DROP TABLE "temporary_task"`);
    }

}
