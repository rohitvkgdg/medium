import { Hono } from "hono";

export const blogRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        JWT_SECRET: string
    }
}>();

blogRouter.post('/', async (c) => {
	const { title, content } = await c.req.json();
});

blogRouter.put('/', async (c) => {
	const { id, title, content } = await c.req.json();
});

blogRouter.get('/:id', async (c) => {
	const { id } = c.req.param();
});

blogRouter.get('/bulk', async (c) => {
	const { ids } = c.req.query();
});