import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";

import { Env } from "./config/env";
import routes from "./routes";
import authRoutes from "./modules/auth/routes/auth.routes";
import { errorMiddleware } from "./middlewares/error.middleware";

const app = express();

app.use(helmet());

app.use(cors({

    origin: Env.FRONTEND_URL,

    credentials: true

}));

app.use(errorMiddleware);
app.use("/api/v1", routes);
app.use("/api/v1/auth", authRoutes);


app.use(express.json());

app.use(cookieParser());

export default app;