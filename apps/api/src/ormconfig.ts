import { DataSource, DataSourceOptions } from 'typeorm';
import { join } from 'path';
import * as dotenv from 'dotenv';
dotenv.config();

const {
  POSTGRES_PORT,
  POSTGRES_HOST,
  POSTGRES_DB,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  DATABASE_URL,
} = process.env;

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  ...(DATABASE_URL
    ? { url: DATABASE_URL }
    : {
        port: parseInt(POSTGRES_PORT),
        host: POSTGRES_HOST,
        database: POSTGRES_DB,
        username: POSTGRES_USER,
        password: POSTGRES_PASSWORD,
      }),
  name: 'default',
  synchronize: false,
  migrationsRun: false,
  migrationsTableName: 'migrations_typeorm',
  entities: [join(__dirname, '**', '*.entity.{ts,js}')],
  migrations: ['migrations/*{.ts,.js}'],
};
export const dataSource = new DataSource(dataSourceOptions);
