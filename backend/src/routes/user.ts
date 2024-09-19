import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign } from "hono/jwt";

export const userRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        JWT_SECRET: string
    }
}>()

userRouter.post('/signup',async (c) => {

	const { name, email, password } = await c.req.json();
	const prisma = new PrismaClient({
		datasourceUrl : c.env.DATABASE_URL,
	}).$extends(withAccelerate());
	try{
		const user = await prisma.user.create({
			data:{
				name,
				email,
				password,
			}
		});
		const jwt = await sign({id: user.id}, c.env.JWT_SECRET);
		
		return c.json({jwt}, 200)
	} catch(e){
		return c.json({message: 'User already exists'}, 400)
	}
});

userRouter.post('/signin', async (c) => {
	const { email, password } = await c.req.json();
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL,
	}).$extends(withAccelerate());

	const user = await prisma.user.findUnique({
		where: {
			email,
			password
		}
	});

	if(!user){
		return c.json({message: 'Invalid email or password'}, 401)
	}
	const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
	return c.json({jwt}, 200)
});