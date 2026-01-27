import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBid1769497545896 implements MigrationInterface {
    name = 'AddBid1769497545896'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "bid" (
                "id" SERIAL NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "userId" uuid NOT NULL,
                "amount" numeric(10, 2) NOT NULL,
                "auctionId" integer NOT NULL,
                CONSTRAINT "PK_ed405dda320051aca2dcb1a50bb" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "bid"
            ADD CONSTRAINT "FK_2e00b0f268f93abcf693bb682c6" FOREIGN KEY ("auctionId") REFERENCES "auction"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "bid" DROP CONSTRAINT "FK_2e00b0f268f93abcf693bb682c6"
        `);
        await queryRunner.query(`
            DROP TABLE "bid"
        `);
    }

}
