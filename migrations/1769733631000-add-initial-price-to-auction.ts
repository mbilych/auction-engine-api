import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInitialPriceToAuction1769733631000 implements MigrationInterface {
  name = 'AddInitialPriceToAuction1769733631000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "auction" ADD "initialPrice" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
    // Update initialPrice to match currentPrice for existing records
    await queryRunner.query(
      `UPDATE "auction" SET "initialPrice" = "currentPrice"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "auction" DROP COLUMN "initialPrice"`);
  }
}
