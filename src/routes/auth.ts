import { Hono } from "hono";
import { sign, decode } from "hono/jwt";
import db from "../db/connection.js";
import { companies, roles, users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import "dotenv/config";
import { sValidator } from "@hono/standard-validator";
import { authValidation, registerValidtion } from "../validation/schema.js";
import bcrypt from "bcryptjs";

const route = new Hono();

route.get("/:id", async (c) => {
	const id = parseInt(c.req.param("id"));

	const [query] = await db
		.select({
			user: {
				id: users.id,
				name: users.name,
				email: users.email,
			},
			company: {
				id: companies.id,
				name: companies.name,
			},
			role: {
				id: roles.id,
				name: roles.name,
			},
		})
		.from(users)
		.innerJoin(companies, eq(users.companyId, companies.id))
		.innerJoin(roles, eq(users.roleId, roles.id))
		.where(eq(users.id, id))
		.limit(1);

	const token = await sign(query, process.env.JWT_SECRET!);

	const { header, payload } = decode(token);

	return c.json({
		token: token,
		data: payload,
	});
});

route.post("/login", sValidator("json", authValidation), async (c) => {
	const data = c.req.valid("json");

	const [user] = await db
		.select({
			user: {
				id: users.id,
				name: users.name,
				email: users.email,
				password: users.password,
			},
			company: {
				id: companies.id,
				name: companies.name,
			},
			role: {
				id: roles.id,
				name: roles.name,
			},
		})
		.from(users)
		.innerJoin(companies, eq(users.companyId, companies.id))
		.innerJoin(roles, eq(users.roleId, roles.id))
		.where(eq(users.email, data.email))
		.limit(1);

	if (user == null) {
		throw new Error("Invalid email/Password");
	}

	const isMatch = await bcrypt.compare(data.password, user.user.password);

	if (!isMatch) {
		throw new Error("Invalid email/Password");
	}

	const token = await sign(
		{
			...user,
			user: {
				id: user.user.id,
				name: user.user.name,
				email: user.user.email,
			},
		},
		process.env.JWT_SECRET!,
	);

	const { header, payload } = decode(token);

	return c.json({
		token: token,
		data: payload,
	});
});

route.post("/register", sValidator("json", registerValidtion), async (c) => {
	const data = c.req.valid("json");

	const [role] = await db.select().from(roles).where(eq(roles.name, "admin"));

	if (role == null) {
		throw new Error("Admin role not found");
	}

	const [company] = await db
		.insert(companies)
		.values({
			name: data.company_name,
			code: data.company_code,
		})
		.returning();

	const [user] = await db
		.insert(users)
		.values({
			name: data.name,
			email: data.email,
			password: data.password,
			roleId: role.id,
			companyId: company.id,
		})
		.returning();

	const token = await sign(
		{
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
			},
			company: {
				id: company.id,
				name: company.name,
			},
			role: {
				id: role.id,
				name: role.name,
			},
		},
		process.env.JWT_SECRET!,
	);

	const { header, payload } = decode(token);

	return c.json({
		token: token,
		data: payload,
	});
});

export default route;
