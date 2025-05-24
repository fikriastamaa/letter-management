import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

// MySQL connection for user only
export const mysqlDb = new Sequelize(
  process.env.MYSQL_DB_NAME,
  process.env.MYSQL_DB_USERNAME,
  process.env.MYSQL_DB_PASSWORD,
  {
    host: process.env.MYSQL_DB_HOST,
    dialect: "mysql",
    logging: false,
  }
);

// PostgreSQL connection for surat masuk & jawaban surat
export const pgDb = new Sequelize(
  process.env.PG_DB_NAME,
  process.env.PG_DB_USERNAME,
  process.env.PG_DB_PASSWORD,
  {
    host: process.env.PG_DB_HOST,
    dialect: "postgres",
    logging: false,
  }
);