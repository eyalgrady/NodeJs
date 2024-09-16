import chalk from "chalk";
import mongoose from "mongoose";

export const connect = async () => {
  const db =
    process.env.NODE_ENV === "development"
      ? process.env.MONGO_DB_URL
      : process.env.ATLAS_DB_URL;

  const dbLoc = process.env.NODE_ENV === "development" ? "Local" : "Atlas";

  try {
    await mongoose.connect(db);
    console.log(chalk.blueBright(`Connected to ${dbLoc} database`));
  } catch (error) {
    console.error(
      chalk.yellow(
        `Failed to establish connection to ${dbLoc} database: ${error}`
      )
    );
  }
};
