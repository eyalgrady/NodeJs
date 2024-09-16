import express from "express";
import cors from "cors";
import chalk from "chalk";
import dotenv from "dotenv";
import morgan from "morgan";
import moment from "moment";
import { connect } from "./helpers/dbHelpers.mjs";

dotenv.config();

async function main() {
  await connect();
}

main().catch((err) => console.log(err));

export const app = express();

// JSON
app.use(express.json());

// Logger + Chalk
app.use(
  morgan((tokens, req, res) => {
    const status = tokens.status(req, res);

    return [
      chalk.blue(tokens.method(req, res)),
      chalk.green(tokens.url(req, res)),
      status >= 200 && status < 400
        ? chalk.bgGreen(tokens.status(req, res))
        : chalk.bgRed(tokens.status(req, res)),
      chalk.gray(moment().format("YYYY-MM-DD HH:mm")),
      chalk.bgBlack(tokens["response-time"](req, res), "ms"),
    ].join(" ");
  })
);

// Static files - Public
app.use(express.static("public"));

// Cors
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: "GET,PUT,POST,DELETE,OPTIONS",
    allowedHeaders: "Content-Type, Accept, Authorization",
  })
);

// Middleware to log requests
app.use((req, res, next) => {
  console.log(chalk.bgBlue(req.method));
  console.log(chalk.green(req.url));
  next();
});

// Routes
app.get("/", (req, res) => {
  res.send({
    message: "Hello world!",
  });
});

// Import route handlers
(async () => {
  try {
    await import("./handlers/users/users.mjs");
    await import("./handlers/cards/cards.mjs");
    await import("./initial-data/initial-data.service.mjs");
  } catch (err) {
    console.error("Failed to import modules:", err);
  }

  app.use((req, res) => {
    res.status(404).send(`
            <meta charset="UTF-8">
            <style>
                * {
                    direction: rtl;
                    text-align: center;
                    color: red;
                }
            </style>
            <h1>שגיאה 404</h1>
            <h2>הדף המבוקש לא נמצא</h2>
        `);
  });
})();

// Start the server
app.listen(process.env.PORT, () => {
  console.log("Server is running on port 8087");
});
