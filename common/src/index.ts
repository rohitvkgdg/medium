import { z } from "zod";

export const signupInput = z.object({
    name: z.string().optional(),
    email: z.string().email(),
    password: z.string().min(8)
})

export const signinInput = z.object({
    email: z.string().email(),
    password: z.string().min(8)
})

export const createBlogInput = z.object({
    id: z.string(),
    title: z.string(),
    content: z.string(),
    published: z.boolean()
})

export const updateBlogInput = z.object({
    id: z.string(),
    title: z.string(),
    content: z.string()
})

//type inference in zod
export type SignupInput = z.infer<typeof signupInput>;
export type UpdateBlogInput = z.infer<typeof updateBlogInput>
export type CreateBlogInput = z.infer<typeof createBlogInput>