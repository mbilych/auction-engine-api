import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAuctionLog1769732185542 implements MigrationInterface {
    name = 'AddAuctionLog1769732185542'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "auction_log" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "auctionId" uuid NOT NULL,
                "type" character varying(50) NOT NULL,
                "payload" jsonb,
                CONSTRAINT "PK_940e2c2f2caa58bd9ba2ddf37fb" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "auction"
            ADD "startsAt" TIMESTAMP NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "bid" DROP CONSTRAINT "FK_2e00b0f268f93abcf693bb682c6"
        `);
        await queryRunner.query(`
            ALTER TABLE "auction" DROP CONSTRAINT "PK_9dc876c629273e71646cf6dfa67"
        `);
        await queryRunner.query(`
            ALTER TABLE "auction" DROP COLUMN "id"
        `);
        await queryRunner.query(`
            ALTER TABLE "auction"
            ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()
        `);
        await queryRunner.query(`
            ALTER TABLE "auction"
            ADD CONSTRAINT "PK_9dc876c629273e71646cf6dfa67" PRIMARY KEY ("id")
        `);
        await queryRunner.query(`
            ALTER TABLE "auction"
            ALTER COLUMN "version" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "bid" DROP CONSTRAINT "PK_ed405dda320051aca2dcb1a50bb"
        `);
        await queryRunner.query(`
            ALTER TABLE "bid" DROP COLUMN "id"
        `);
        await queryRunner.query(`
            ALTER TABLE "bid"
            ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()
        `);
        await queryRunner.query(`
            ALTER TABLE "bid"
            ADD CONSTRAINT "PK_ed405dda320051aca2dcb1a50bb" PRIMARY KEY ("id")
        `);
        await queryRunner.query(`
            ALTER TABLE "bid" DROP COLUMN "auctionId"
        `);
        await queryRunner.query(`
            ALTER TABLE "bid"
            ADD "auctionId" uuid NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "bid"
            ADD CONSTRAINT "FK_2e00b0f268f93abcf693bb682c6" FOREIGN KEY ("auctionId") REFERENCES "auction"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "auction_log"
            ADD CONSTRAINT "FK_d4bac2e54087248e5a69a585247" FOREIGN KEY ("auctionId") REFERENCES "auction"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "auction_log" DROP CONSTRAINT "FK_d4bac2e54087248e5a69a585247"
        `);
        await queryRunner.query(`
            ALTER TABLE "bid" DROP CONSTRAINT "FK_2e00b0f268f93abcf693bb682c6"
        `);
        await queryRunner.query(`
            ALTER TABLE "bid" DROP COLUMN "auctionId"
        `);
        await queryRunner.query(`
            ALTER TABLE "bid"
            ADD "auctionId" integer NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "bid" DROP CONSTRAINT "PK_ed405dda320051aca2dcb1a50bb"
        `);
        await queryRunner.query(`
            ALTER TABLE "bid" DROP COLUMN "id"
        `);
        await queryRunner.query(`
            ALTER TABLE "bid"
            ADD "id" SERIAL NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "bid"
            ADD CONSTRAINT "PK_ed405dda320051aca2dcb1a50bb" PRIMARY KEY ("id")
        `);
        await queryRunner.query(`
            ALTER TABLE "auction"
            ALTER COLUMN "version"
            SET DEFAULT '0'
        `);
        await queryRunner.query(`
            ALTER TABLE "auction" DROP CONSTRAINT "PK_9dc876c629273e71646cf6dfa67"
        `);
        await queryRunner.query(`
            ALTER TABLE "auction" DROP COLUMN "id"
        `);
        await queryRunner.query(`
            ALTER TABLE "auction"
            ADD "id" SERIAL NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "auction"
            ADD CONSTRAINT "PK_9dc876c629273e71646cf6dfa67" PRIMARY KEY ("id")
        `);
        await queryRunner.query(`
            ALTER TABLE "bid"
            ADD CONSTRAINT "FK_2e00b0f268f93abcf693bb682c6" FOREIGN KEY ("auctionId") REFERENCES "auction"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "auction" DROP COLUMN "startsAt"
        `);
        await queryRunner.query(`
            DROP TABLE "auction_log"
        `);
    }

}
