import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEmailPasswordToUser1749818793120 implements MigrationInterface {
    name = 'AddEmailPasswordToUser1749818793120'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "temporary_task" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "columnId" integer, "title" varchar(255) NOT NULL, "description" varchar NOT NULL, "status" varchar NOT NULL, "position" integer NOT NULL, CONSTRAINT "FK_f56fe6f2d8ab0b970f764bd601b" FOREIGN KEY ("columnId") REFERENCES "column" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_task"("id", "createdAt", "updatedAt", "columnId") SELECT "id", "createdAt", "updatedAt", "columnId" FROM "task"`);
        await queryRunner.query(`DROP TABLE "task"`);
        await queryRunner.query(`ALTER TABLE "temporary_task" RENAME TO "task"`);
        await queryRunner.query(`CREATE TABLE "temporary_column" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "boardId" integer, "title" varchar NOT NULL, "position" integer NOT NULL, CONSTRAINT "FK_cf15a522eb00160987b6fcf91e4" FOREIGN KEY ("boardId") REFERENCES "board" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_column"("id", "createdAt", "updatedAt", "boardId") SELECT "id", "createdAt", "updatedAt", "boardId" FROM "column"`);
        await queryRunner.query(`DROP TABLE "column"`);
        await queryRunner.query(`ALTER TABLE "temporary_column" RENAME TO "column"`);
        await queryRunner.query(`CREATE TABLE "temporary_board" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer, "title" varchar NOT NULL, CONSTRAINT "FK_c9951f13af7909d37c0e2aec484" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_board"("id", "createdAt", "updatedAt", "userId") SELECT "id", "createdAt", "updatedAt", "userId" FROM "board"`);
        await queryRunner.query(`DROP TABLE "board"`);
        await queryRunner.query(`ALTER TABLE "temporary_board" RENAME TO "board"`);
        await queryRunner.query(`CREATE TABLE "temporary_user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "email" varchar NOT NULL, "password" varchar NOT NULL, CONSTRAINT "UQ_ed766a9782779b8390a2a81f444" UNIQUE ("email"))`);
        await queryRunner.query(`INSERT INTO "temporary_user"("id", "createdAt", "updatedAt") SELECT "id", "createdAt", "updatedAt" FROM "user"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`ALTER TABLE "temporary_user" RENAME TO "user"`);
        await queryRunner.query(`CREATE TABLE "temporary_task" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "columnId" integer, "title" varchar(255) NOT NULL, "description" varchar NOT NULL, "status" varchar NOT NULL, "position" integer NOT NULL)`);
        await queryRunner.query(`INSERT INTO "temporary_task"("id", "createdAt", "updatedAt", "columnId", "title", "description", "status", "position") SELECT "id", "createdAt", "updatedAt", "columnId", "title", "description", "status", "position" FROM "task"`);
        await queryRunner.query(`DROP TABLE "task"`);
        await queryRunner.query(`ALTER TABLE "temporary_task" RENAME TO "task"`);
        await queryRunner.query(`CREATE TABLE "temporary_task" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "columnId" integer NOT NULL, "title" varchar(255) NOT NULL, "description" varchar NOT NULL, "status" varchar NOT NULL, "position" integer NOT NULL)`);
        await queryRunner.query(`INSERT INTO "temporary_task"("id", "createdAt", "updatedAt", "columnId", "title", "description", "status", "position") SELECT "id", "createdAt", "updatedAt", "columnId", "title", "description", "status", "position" FROM "task"`);
        await queryRunner.query(`DROP TABLE "task"`);
        await queryRunner.query(`ALTER TABLE "temporary_task" RENAME TO "task"`);
        await queryRunner.query(`CREATE TABLE "temporary_column" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "boardId" integer, "title" varchar NOT NULL, "position" integer NOT NULL)`);
        await queryRunner.query(`INSERT INTO "temporary_column"("id", "createdAt", "updatedAt", "boardId", "title", "position") SELECT "id", "createdAt", "updatedAt", "boardId", "title", "position" FROM "column"`);
        await queryRunner.query(`DROP TABLE "column"`);
        await queryRunner.query(`ALTER TABLE "temporary_column" RENAME TO "column"`);
        await queryRunner.query(`CREATE TABLE "temporary_column" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "boardId" integer NOT NULL, "title" varchar NOT NULL, "position" integer NOT NULL)`);
        await queryRunner.query(`INSERT INTO "temporary_column"("id", "createdAt", "updatedAt", "boardId", "title", "position") SELECT "id", "createdAt", "updatedAt", "boardId", "title", "position" FROM "column"`);
        await queryRunner.query(`DROP TABLE "column"`);
        await queryRunner.query(`ALTER TABLE "temporary_column" RENAME TO "column"`);
        await queryRunner.query(`CREATE TABLE "temporary_board" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer, "title" varchar NOT NULL)`);
        await queryRunner.query(`INSERT INTO "temporary_board"("id", "createdAt", "updatedAt", "userId", "title") SELECT "id", "createdAt", "updatedAt", "userId", "title" FROM "board"`);
        await queryRunner.query(`DROP TABLE "board"`);
        await queryRunner.query(`ALTER TABLE "temporary_board" RENAME TO "board"`);
        await queryRunner.query(`CREATE TABLE "temporary_board" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer NOT NULL, "title" varchar NOT NULL)`);
        await queryRunner.query(`INSERT INTO "temporary_board"("id", "createdAt", "updatedAt", "userId", "title") SELECT "id", "createdAt", "updatedAt", "userId", "title" FROM "board"`);
        await queryRunner.query(`DROP TABLE "board"`);
        await queryRunner.query(`ALTER TABLE "temporary_board" RENAME TO "board"`);
        await queryRunner.query(`CREATE TABLE "temporary_task" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "columnId" integer NOT NULL, "title" varchar(255) NOT NULL, "description" varchar NOT NULL, "status" varchar NOT NULL, "position" integer NOT NULL, CONSTRAINT "FK_f56fe6f2d8ab0b970f764bd601b" FOREIGN KEY ("columnId") REFERENCES "column" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_task"("id", "createdAt", "updatedAt", "columnId", "title", "description", "status", "position") SELECT "id", "createdAt", "updatedAt", "columnId", "title", "description", "status", "position" FROM "task"`);
        await queryRunner.query(`DROP TABLE "task"`);
        await queryRunner.query(`ALTER TABLE "temporary_task" RENAME TO "task"`);
        await queryRunner.query(`CREATE TABLE "temporary_column" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "boardId" integer NOT NULL, "title" varchar NOT NULL, "position" integer NOT NULL, CONSTRAINT "FK_cf15a522eb00160987b6fcf91e4" FOREIGN KEY ("boardId") REFERENCES "board" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_column"("id", "createdAt", "updatedAt", "boardId", "title", "position") SELECT "id", "createdAt", "updatedAt", "boardId", "title", "position" FROM "column"`);
        await queryRunner.query(`DROP TABLE "column"`);
        await queryRunner.query(`ALTER TABLE "temporary_column" RENAME TO "column"`);
        await queryRunner.query(`CREATE TABLE "temporary_board" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer NOT NULL, "title" varchar NOT NULL, CONSTRAINT "FK_c9951f13af7909d37c0e2aec484" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_board"("id", "createdAt", "updatedAt", "userId", "title") SELECT "id", "createdAt", "updatedAt", "userId", "title" FROM "board"`);
        await queryRunner.query(`DROP TABLE "board"`);
        await queryRunner.query(`ALTER TABLE "temporary_board" RENAME TO "board"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "board" RENAME TO "temporary_board"`);
        await queryRunner.query(`CREATE TABLE "board" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer NOT NULL, "title" varchar NOT NULL)`);
        await queryRunner.query(`INSERT INTO "board"("id", "createdAt", "updatedAt", "userId", "title") SELECT "id", "createdAt", "updatedAt", "userId", "title" FROM "temporary_board"`);
        await queryRunner.query(`DROP TABLE "temporary_board"`);
        await queryRunner.query(`ALTER TABLE "column" RENAME TO "temporary_column"`);
        await queryRunner.query(`CREATE TABLE "column" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "boardId" integer NOT NULL, "title" varchar NOT NULL, "position" integer NOT NULL)`);
        await queryRunner.query(`INSERT INTO "column"("id", "createdAt", "updatedAt", "boardId", "title", "position") SELECT "id", "createdAt", "updatedAt", "boardId", "title", "position" FROM "temporary_column"`);
        await queryRunner.query(`DROP TABLE "temporary_column"`);
        await queryRunner.query(`ALTER TABLE "task" RENAME TO "temporary_task"`);
        await queryRunner.query(`CREATE TABLE "task" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "columnId" integer NOT NULL, "title" varchar(255) NOT NULL, "description" varchar NOT NULL, "status" varchar NOT NULL, "position" integer NOT NULL)`);
        await queryRunner.query(`INSERT INTO "task"("id", "createdAt", "updatedAt", "columnId", "title", "description", "status", "position") SELECT "id", "createdAt", "updatedAt", "columnId", "title", "description", "status", "position" FROM "temporary_task"`);
        await queryRunner.query(`DROP TABLE "temporary_task"`);
        await queryRunner.query(`ALTER TABLE "board" RENAME TO "temporary_board"`);
        await queryRunner.query(`CREATE TABLE "board" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer, "title" varchar NOT NULL)`);
        await queryRunner.query(`INSERT INTO "board"("id", "createdAt", "updatedAt", "userId", "title") SELECT "id", "createdAt", "updatedAt", "userId", "title" FROM "temporary_board"`);
        await queryRunner.query(`DROP TABLE "temporary_board"`);
        await queryRunner.query(`ALTER TABLE "board" RENAME TO "temporary_board"`);
        await queryRunner.query(`CREATE TABLE "board" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer, "title" varchar NOT NULL, CONSTRAINT "FK_c9951f13af7909d37c0e2aec484" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "board"("id", "createdAt", "updatedAt", "userId", "title") SELECT "id", "createdAt", "updatedAt", "userId", "title" FROM "temporary_board"`);
        await queryRunner.query(`DROP TABLE "temporary_board"`);
        await queryRunner.query(`ALTER TABLE "column" RENAME TO "temporary_column"`);
        await queryRunner.query(`CREATE TABLE "column" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "boardId" integer, "title" varchar NOT NULL, "position" integer NOT NULL)`);
        await queryRunner.query(`INSERT INTO "column"("id", "createdAt", "updatedAt", "boardId", "title", "position") SELECT "id", "createdAt", "updatedAt", "boardId", "title", "position" FROM "temporary_column"`);
        await queryRunner.query(`DROP TABLE "temporary_column"`);
        await queryRunner.query(`ALTER TABLE "column" RENAME TO "temporary_column"`);
        await queryRunner.query(`CREATE TABLE "column" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "boardId" integer, "title" varchar NOT NULL, "position" integer NOT NULL, CONSTRAINT "FK_cf15a522eb00160987b6fcf91e4" FOREIGN KEY ("boardId") REFERENCES "board" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "column"("id", "createdAt", "updatedAt", "boardId", "title", "position") SELECT "id", "createdAt", "updatedAt", "boardId", "title", "position" FROM "temporary_column"`);
        await queryRunner.query(`DROP TABLE "temporary_column"`);
        await queryRunner.query(`ALTER TABLE "task" RENAME TO "temporary_task"`);
        await queryRunner.query(`CREATE TABLE "task" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "columnId" integer, "title" varchar(255) NOT NULL, "description" varchar NOT NULL, "status" varchar NOT NULL, "position" integer NOT NULL)`);
        await queryRunner.query(`INSERT INTO "task"("id", "createdAt", "updatedAt", "columnId", "title", "description", "status", "position") SELECT "id", "createdAt", "updatedAt", "columnId", "title", "description", "status", "position" FROM "temporary_task"`);
        await queryRunner.query(`DROP TABLE "temporary_task"`);
        await queryRunner.query(`ALTER TABLE "task" RENAME TO "temporary_task"`);
        await queryRunner.query(`CREATE TABLE "task" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "columnId" integer, "title" varchar(255) NOT NULL, "description" varchar NOT NULL, "status" varchar NOT NULL, "position" integer NOT NULL, CONSTRAINT "FK_f56fe6f2d8ab0b970f764bd601b" FOREIGN KEY ("columnId") REFERENCES "column" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "task"("id", "createdAt", "updatedAt", "columnId", "title", "description", "status", "position") SELECT "id", "createdAt", "updatedAt", "columnId", "title", "description", "status", "position" FROM "temporary_task"`);
        await queryRunner.query(`DROP TABLE "temporary_task"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME TO "temporary_user"`);
        await queryRunner.query(`CREATE TABLE "user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`INSERT INTO "user"("id", "createdAt", "updatedAt") SELECT "id", "createdAt", "updatedAt" FROM "temporary_user"`);
        await queryRunner.query(`DROP TABLE "temporary_user"`);
        await queryRunner.query(`ALTER TABLE "board" RENAME TO "temporary_board"`);
        await queryRunner.query(`CREATE TABLE "board" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer, CONSTRAINT "FK_c9951f13af7909d37c0e2aec484" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "board"("id", "createdAt", "updatedAt", "userId") SELECT "id", "createdAt", "updatedAt", "userId" FROM "temporary_board"`);
        await queryRunner.query(`DROP TABLE "temporary_board"`);
        await queryRunner.query(`ALTER TABLE "column" RENAME TO "temporary_column"`);
        await queryRunner.query(`CREATE TABLE "column" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "boardId" integer, CONSTRAINT "FK_cf15a522eb00160987b6fcf91e4" FOREIGN KEY ("boardId") REFERENCES "board" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "column"("id", "createdAt", "updatedAt", "boardId") SELECT "id", "createdAt", "updatedAt", "boardId" FROM "temporary_column"`);
        await queryRunner.query(`DROP TABLE "temporary_column"`);
        await queryRunner.query(`ALTER TABLE "task" RENAME TO "temporary_task"`);
        await queryRunner.query(`CREATE TABLE "task" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "columnId" integer, CONSTRAINT "FK_f56fe6f2d8ab0b970f764bd601b" FOREIGN KEY ("columnId") REFERENCES "column" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "task"("id", "createdAt", "updatedAt", "columnId") SELECT "id", "createdAt", "updatedAt", "columnId" FROM "temporary_task"`);
        await queryRunner.query(`DROP TABLE "temporary_task"`);
    }

}
