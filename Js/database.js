// database.js
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
  console.error("❌ Faltando DATABASE_URL no .env / Render");
  process.exit(1);
}

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  protocol: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Supabase + Render funciona assim
    },
  },
  logging: false, // coloca true se quiser ver as queries no log
});

export default sequelize;
