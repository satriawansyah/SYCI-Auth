import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/app-error";

export function errorMiddleware(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {

  if (error instanceof AppError) {

    return res.status(error.statusCode).json({
      success: false,
      message: error.message
    });

  }

  console.error(error);

  return res.status(500).json({
    success: false,
    message: "Internal Server Error"
  });

}