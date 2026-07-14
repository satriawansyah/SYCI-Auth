import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";

export class AuthController {

  constructor(
    private readonly service = new AuthService()
  ) {}

  register = async (req: Request, res: Response) => {

    const user = await this.service.register(req.body);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user
    });

  };

}