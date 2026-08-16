import pino from "pino";
import { Env } from "./env";

export const logger = pino({

    level: process.env.LOG_LEVEL || (Env.NODE_ENV === "production" ? "info" : "debug"),

    transport:
        Env.NODE_ENV === "production"
            ? undefined
            : {
                  target: "pino-pretty",
              },

});