import { Prisma } from "@prisma/client";
import { PrismaClient } from "@prisma/client/extension";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";

export const blogRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        JWT_SECRET: string,
        blogs: JSON
    }
}>();

blogRouter.use('/*', async (c, next) => {
    next();
})

blogRouter.post('/', async (c) => {
    const { title, content } = await c.req.json();
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate());

    const blog = await prisma.blog.create({
        data: {
            title,
            content
        }
    })

    return c.json({
        id: blog.id
    })
});

blogRouter.put('/', async (c) => {
    const { id, title, content } = await c.req.json();
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate());

    const blog = await prisma.blog.update({
        where: {
            id
        },
        data: {
            title,
            content
        }
    })

    return c.json({
        id: blog.id
    })
});

blogRouter.get('/:id', async (c) => {
    const { id } = c.req.param();
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate());
    try {
        const blog = await prisma.blog.find({
            where: {
                id
            }
        })

        return c.json({
            blog
        })
    } catch(e){
        return c.json({
            message: "Couldn't fetch the blog"
        }, 411)
    }
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