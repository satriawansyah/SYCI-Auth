import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";
import { AppError } from "../errors/app-error";

export function validate(schema: ZodSchema) {

    return (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {

        const result = schema.safeParse(req.body);

        if (!result.success) {

            return next(
                new AppError(
                    400,
                    "Validation Error",
                    result.error.flatten()
                )
            );

        }

        req.body = result.data;

        next();

    };

}