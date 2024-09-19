import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { Hono } from "hono";
import { verify } from "hono/jwt";
import { createBlogInput } from "@rohitvkgdg/medium-common";

export const blogRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        JWT_SECRET: string,
        blogs: JSON
    }
    Variables: {
        userId: string
    }
}>();

blogRouter.use('*', async (c, next) => {
    const authHeader = c.req.header('Authorization') || ""
    const token = authHeader.split(' ')[1]
    try {
        const user = await verify(token, c.env.JWT_SECRET)
        if (!user) {
            return c.json({
                message: "Unauthorized user"
            }, 401)
        }
        c.set("userId", user.id as string)
        await next();
    } catch (e) {
        return c.json({
            message: "Unauthorized user"
        }, 401)
    }
})

blogRouter.post('/', async (c) => {
    const { title, content } = await c.req.json();
    const { success } = createBlogInput.safeParse({ title, content })
    if (!success) {
        return c.json({
            message: "Invalid inputs"
        }, 400)
    }
    const userId = c.get("userId")
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate());

    const blog = await prisma.blog.create({
        data: {
            title,
            content,
            authorId: userId
        }
    })
    return c.json({
        id: blog.id
    })
});

blogRouter.put('/', async (c) => {
    const { id, title, content, published } = await c.req.json();
    const { success } = createBlogInput.safeParse({ id, title, content, published })
    if (!success) {
        return c.json({
            message: "Invalid inputs"
        }, 400)
    }
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate());

    const blog = await prisma.blog.update({
        where: {
            id
        },
        data: {
            title,
            content,
            published
        }
    })

    return c.json({
        id: blog.id
    })
});

blogRouter.get('/bulk', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate());

    const blogs = await prisma.blog.findMany()
    return c.json({
        blogs
    })
});

blogRouter.get('/:id', async (c) => {
    const { id } = c.req.param();
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate());
    try {
        const blog = await prisma.blog.findFirst({
            where: {
                id
            }
        })

        return c.json({
            blog
        })
    } catch (e) {
        return c.json({
            message: "Couldn't fetch the blog"
        }, 411)
    }
});