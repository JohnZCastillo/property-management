import { Hono } from "hono";

import db from "../db/connection.js";
import { users as mainTable, companies, roles } from "../db/schema.js";
import withPagination from "../util/pagination.js";
import { eq, getTableColumns, and } from "drizzle-orm";
import { staffValidation as schema } from "../validation/schema.js";
import { sValidator } from "@hono/standard-validator";
import type { Variables } from "../types/index.js";

const route = new Hono<{ Variables: Variables }>();

route.get("/", async (c) => {
	const payload = c.get("jwtPayload");

	const query = db
		.select(getTableColumns(mainTable))
		.from(mainTable)
		.innerJoin(roles, eq(roles.id, mainTable.roleId))
		.where(
			and(eq(mainTable.companyId, payload.company.id), eq(roles.name, "staff")),
		);

	const [result, pagination] = await withPagination(query, "id");

	return c.json({
		data: result,
		pagination: pagination,
	});
});

route.get("/:id", async (c) => {
	const id = parseInt(c.req.param("id"));

	const payload = c.get("jwtPayload");

	const result = await db
		.select(getTableColumns(mainTable))
		.from(mainTable)
		.innerJoin(roles, eq(roles.id, mainTable.roleId))
		.where(
			and(
				eq(mainTable.companyId, payload.company.id),
				eq(roles.name, "staff"),
				eq(mainTable.id, id),
			),
		)
		.limit(1)
		.execute();

	return c.json({
		data: result,
	});
});

route.post("/", sValidator("json", schema), async (c) => {
	const payload = c.get("jwtPayload");

	const data = c.req.valid("json");

	const [role] = await db
		.select()
		.from(roles)
		.where(eq(roles.name, "staff"))
		.limit(1);

	if (role == null) {
		throw new Error("Staff role is missing");
	}

	const result = await db
		.insert(mainTable)
		.values({ ...data, companyId: payload.company.id, roleId: role.id })
		.returning();

	return c.json(
		{
			data: result,
		},
		201,
	);
});

route.patch("/:id", sValidator("json", schema.partial()), async (c) => {
	const id = parseInt(c.req.param("id"));

	const payload = c.get("jwtPayload");

	const data = c.req.valid("json");

	const [role] = await db
		.select()
		.from(roles)
		.where(eq(roles.name, "staff"))
		.limit(1);

	if (role == null) {
		throw new Error("Staff role is missing");
	}

	const result = await db
		.update(mainTable)
		.set(data)
		.where(
			and(
				eq(mainTable.id, id),
				eq(mainTable.companyId, payload.company.id),
				eq(mainTable.roleId, role.id),
			),
		)
		.returning();

	return c.json({
		data: result,
	});
});

route.delete("/:id", async (c) => {
	const id = parseInt(c.req.param("id"));
	const payload = c.get("jwtPayload");

	const [role] = await db
		.select()
		.from(roles)
		.where(eq(roles.name, "staff"))
		.limit(1);

	if (role == null) {
		throw new Error("Staff role is missing");
	}

	const result = await db
		.delete(mainTable)
		.where(
			and(
				eq(mainTable.id, id),
				eq(mainTable.companyId, payload.company.id),
				eq(mainTable.roleId, role.id),
			),
		)
		.execute();

	return c.json({
		data: result,
	});
});

export default route;
