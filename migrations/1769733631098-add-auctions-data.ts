import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAuctionsData1769733631098 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Cleanup existing records for a fresh demo start
    await queryRunner.query('DELETE FROM "bid"');
    await queryRunner.query('DELETE FROM "auction_log"');
    await queryRunner.query('DELETE FROM "auction"');

    const auctions = [
      {
        title: 'MacBook Pro 16" M2',
        img: 'macbook_pro.jpeg',
        price: 1500,
        step: 100,
      },
      {
        title: 'Rolex Submariner Date',
        img: 'rolex_submariner_date.jpg',
        price: 8000,
        step: 500,
      },
      {
        title: 'Sony A7 IV Mirrorless Camera',
        img: 'sony_a7_mirrorless_camera.webp',
        price: 2000,
        step: 150,
      },
      {
        title: 'Electric Scooter (Segway Ninebot)',
        img: 'electric_scooter.webp',
        price: 400,
        step: 30,
      },
      {
        title: 'Vintage Fender Stratocaster',
        img: 'vintage_fender_stratocaster.jpg',
        price: 1200,
        step: 80,
      },
    ];

    const cdnBase = '/cdn/';
    const now = new Date();

    for (let i = 0; i < auctions.length; i++) {
      const a = auctions[i];
      // Stagger start times: 
      // Slot 0 starts now
      // Slot 1 starts in 30s
      // Slot 2 in 60s, etc.
      const startsAt = new Date(now.getTime() + i * 30000);
      const endsAt = new Date(startsAt.getTime() + (Math.floor(Math.random() * 3) + 3) * 60000); // 3-5 mins duration

      await queryRunner.query(`
                INSERT INTO "auction" 
                ("id", "title", "thumbnail", "initialPrice", "currentPrice", "minStep", "startsAt", "endsAt", "status", "version")
                VALUES 
                (gen_random_uuid(), '${a.title}', '${cdnBase}${a.img}', ${a.price}, ${a.price}, ${a.step}, '${startsAt.toISOString()}', '${endsAt.toISOString()}', 'Created', 1)
            `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "bid"');
    await queryRunner.query('DELETE FROM "auction_log"');
    await queryRunner.query('DELETE FROM "auction"');
  }
}
