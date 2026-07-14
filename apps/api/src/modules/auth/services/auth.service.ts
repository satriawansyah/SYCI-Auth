import bcrypt from "bcrypt";
import type { RegisterDto } from "../dto/register.dto";
import { AuthRepository } from "../repositories/auth.repository";

export class AuthService {

  constructor(
    private readonly repository = new AuthRepository()
  ) {}

  async register(request: RegisterDto) {

    const email = await this.repository.findByEmail(request.email);

    if (email) {
      throw new Error("Email already registered");
    }

    if (request.username) {

      const username = await this.repository.findByUsername(request.username);

      if (username) {
        throw new Error("Username already exists");
      }

    }

    const passwordHash = await bcrypt.hash(request.password, 12);

    const user = await this.repository.create({
      ...request,
      passwordHash
    });

    return user;
  }

}