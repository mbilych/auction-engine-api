import { MigrationInterface, QueryRunner } from "typeorm";

export class AuctionAddWinnerId1769791421344 implements MigrationInterface {
    name = 'AuctionAddWinnerId1769791421344'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "auction"
            ADD "winnerUserId" uuid
        `);
        await queryRunner.query(`
            ALTER TABLE "auction"
            ALTER COLUMN "initialPrice" DROP DEFAULT
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "auction"
            ALTER COLUMN "initialPrice"
            SET DEFAULT '0'
        `);
        await queryRunner.query(`
            ALTER TABLE "auction" DROP COLUMN "winnerUserId"
        `);
    }

}
