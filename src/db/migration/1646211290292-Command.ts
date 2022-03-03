import {MigrationInterface, QueryRunner} from "typeorm";

export class Command1646211290292 implements MigrationInterface {
    name = 'Command1646211290292'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "command" ("id" SERIAL NOT NULL, "from" character varying NOT NULL, "to" character varying NOT NULL, "body" character varying NOT NULL, CONSTRAINT "PK_5bfa4e1cb54b62f512078f3e7cb" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "command"`);
    }

}
