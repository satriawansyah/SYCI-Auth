import { Response } from "express";

export class ApiResponse {

    static success(
        res: Response,
        data: unknown,
        message = "Success"
    ) {

        return res.status(200).json({

            success: true,

            message,

            data

        });

    }

    static created(
        res: Response,
        data: unknown,
        message = "Created"
    ) {

        return res.status(201).json({

            success: true,

            message,

            data

        });

    }

    static error(
        res: Response,
        message: string,
        status = 500
    ) {

        return res.status(status).json({

            success: false,

            message

        });

    }

}