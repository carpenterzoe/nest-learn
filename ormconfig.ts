import { DataSource } from "typeorm";

const connectionSource = new DataSource({
  migrationsTableName: 'migrations',
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'pass123',
  database: 'postgres',
  logging: false,
  synchronize: false,
  entities: ['src/**/entities/**.entity{.ts,.js}'],
  migrations: ['src/migrations/*{.ts,.js}'],
  subscribers: ['src/subscriber/**/*{.ts,.js}'],
});

export default connectionSource;