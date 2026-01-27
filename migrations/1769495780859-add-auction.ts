import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAuction1769495780859 implements MigrationInterface {
    name = 'AddAuction1769495780859'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."auction_status_enum" AS ENUM('Created', 'Active', 'Finished')
        `);
        await queryRunner.query(`
            CREATE TABLE "auction" (
                "id" SERIAL NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "status" "public"."auction_status_enum" NOT NULL DEFAULT 'Created',
                "title" character varying(255) NOT NULL,
                "thumbnail" text,
                "currentPrice" numeric(10, 2) NOT NULL,
                "minStep" numeric(10, 2) NOT NULL,
                "endsAt" TIMESTAMP NOT NULL,
                "winnerBidId" uuid,
                "version" integer NOT NULL DEFAULT '0',
                CONSTRAINT "PK_9dc876c629273e71646cf6dfa67" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "auction"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."auction_status_enum"
        `);
    }

}
