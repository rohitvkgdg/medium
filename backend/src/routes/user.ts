import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign } from "hono/jwt";
import { signinInput, signupInput } from "@rohitvkgdg/medium-common";

export const userRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        JWT_SECRET: string
    }
}>()

userRouter.post('/signup',async (c) => {

	const { name, email, password } = await c.req.json();
	const { success } = signupInput.safeParse({name, email, password})
	if(!success){
		return c.json({message: "Invalid inputs"}, 400)
	}
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
		
		return c.text(jwt, 200)
	} catch(e){
		return c.json({message: 'User already exists'}, 400)
	}
});

userRouter.post('/signin', async (c) => {
	const { email, password } = await c.req.json();
	const { success } = signinInput.safeParse({email, password})
	if(!success){
		return c.json({message: "Invalid inputs"}, 400)
	}
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
	return c.text(jwt, 200)
});