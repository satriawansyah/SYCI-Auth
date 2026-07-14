import { z } from "zod";

export const registerSchema = z.object({
  email: z.email(),

  username: z
    .string()
    .min(3)
    .max(50)
    .optional(),

  password: z
    .string()
    .min(8)
    .max(100),

  fullName: z
    .string()
    .min(3)
    .max(150),

  phone: z
    .string()
    .max(20)
    .optional()
});

export type RegisterRequest = z.infer<typeof registerSchema>;