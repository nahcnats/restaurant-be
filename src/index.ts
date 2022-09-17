import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";

import { dbConnect, disconnectDb } from "./utils/database";
import { CORS_ORIGIN } from "./constants";
import logger from "./utils/logger";
import deserializeUser from "./middleware/deserializeUser";

const PORT = process.env.PORT || 4000;

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(
    cors({
        origin: CORS_ORIGIN,
        credentials: true,
    })
);
app.use(helmet());
app.use(deserializeUser);

const server = app.listen(PORT, async () => {
    await dbConnect();
    logger.info(`Server listening at http://localhost:${PORT}`);
});

const signals = ["SIGTERM", "SIGINT"];

function gracefulShutdown(signal: string) {
    process.on(signal, async () => {
        server.close();
        await disconnectDb();
        process.exit(0);
    });
}

for (let i = 0; i < signals.length; i++) {
    gracefulShutdown(signals[i]);
}
