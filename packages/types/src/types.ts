import { z } from "zod"

export const SignupApiSchema = z.object({
  name: z.string().optional(),
  username: z.string().min(1),
  password: z.string().min(1)
})

export const SigninApiSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
})

export const initProjectSchema = z.object({
  initialPrompt: z.string().trim().min(1)
})

export type SignupApiType = z.infer<typeof SignupApiSchema>
export type SigninApiType = z.infer<typeof SigninApiSchema>

