import { Router } from "express";
import { database } from "../config/database";

const router = Router();

router.get("/health", async (_, res) => {

    await database.client.$queryRaw`SELECT 1`;

    res.json({

        success: true,

        message: "Database Connected"

    });

});

export default router;