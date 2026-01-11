import * as z from 'zod'

export const signupSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
})

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
})
