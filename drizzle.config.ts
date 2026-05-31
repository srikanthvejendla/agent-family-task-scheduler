import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./db/schema/index.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgresql://family_tasks_user:family_tasks_password@localhost:5433/family_tasks",
  },
});
