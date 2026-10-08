// First step of `npm run setup`: create .env from .env.example unless it exists.
import { constants, copyFileSync } from "node:fs";

try {
  copyFileSync(".env.example", ".env", constants.COPYFILE_EXCL);
  console.log("Created .env from .env.example");
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
  console.log(".env already exists; leaving it unchanged");
}
