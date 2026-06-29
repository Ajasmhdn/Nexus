import { z } from "zod";
import { JOB_TITLES } from "../constants";
import { passwordSchema } from "./auth.validators";

export const createUserSchema = z.object({
  userId:   z.string().min(4).max(20)
              .regex(/^[a-zA-Z0-9_]+$/),
  email:    z.string().email(),
  fullName: z.string().min(2).max(100),
  jobTitle: z.enum(JOB_TITLES),
  password: passwordSchema,
  role:     z.enum(['admin', 'user'])
});

export const updateUserSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  jobTitle: z.enum(JOB_TITLES).optional(),
  role:     z.enum(['admin', 'user']).optional(),
  email:    z.string().email().optional()
});

export const listUsersSchema = z.object({
  search: z.string().max(50).optional(),
  page:   z.coerce.number().min(1).default(1),
  limit:  z.coerce.number().min(1).max(100).default(20)
});

export const adminResetPasswordSchema = z.object({
  newPassword: passwordSchema
});
