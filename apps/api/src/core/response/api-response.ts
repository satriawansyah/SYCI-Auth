import { Response } from "express";

export class ApiResponse {

    static success<T>(
        res: Response,
        data?: T,
        message = "Success",
        status = 200
    ) {
        return res.status(status).json({
            success: true,
            message,
            data,
            timestamp: new Date().toISOString()
        });
    }

    static created<T>(
        res: Response,
        data?: T,
        message = "Created"
    ) {
        return this.success(res, data, message, 201);
    }

    static error(
        res: Response,
        message: string,
        status = 500,
        errors?: unknown
    ) {
        return res.status(status).json({
            success: false,
            message,
            errors,
            timestamp: new Date().toISOString()
        });
    }

}