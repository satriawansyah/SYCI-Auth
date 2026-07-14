import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error";
import { ApiResponse } from "../response/api-response";
import { logger } from "../../config/logger";

export function errorMiddleware(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) {

    if (err instanceof AppError) {

        return ApiResponse.error(
            res,
            err.message,
            err.statusCode,
            err.errors
        );

    }

    logger.error(err);

    return ApiResponse.error(
        res,
        "Internal Server Error",
        500
    );

}