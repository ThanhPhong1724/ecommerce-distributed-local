import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateCategoryImgColumn1684734000000 implements MigrationInterface {
    name = 'UpdateCategoryImgColumn1684734000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "categories" ALTER COLUMN "img" TYPE character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "categories" ALTER COLUMN "img" TYPE text`);
    }
}