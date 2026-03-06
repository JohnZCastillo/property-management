import { Hono } from "hono";

import db from "../db/connection.js";
import { bookings as mainTable, customers, properties, rooms, bookings } from "../db/schema.js";
import withPagination from "../util/pagination.js";
import { eq, getTableColumns, and } from "drizzle-orm";
import { bookingValidation as schema } from "../validation/schema.js";
import { sValidator } from "@hono/standard-validator";
import type { Variables } from "../types/index.js";
import qs from 'qs';

const route = new Hono<{ Variables: Variables }>();

route.get("/", async (c) => {

	const payload = c.get("jwtPayload");

	const {page = 1, perPage = 10, filter = {}} = qs.parse (c.req.query())

	const whereFilter = [];

	Object.keys(filter).forEach(key => {
		whereFilter.push(eq(mainTable[key], filter[key]));
	})

	const query = db
		.select()
		.from(mainTable)
		.innerJoin(customers, eq(customers.id, mainTable.customerId))
		.leftJoin(rooms, eq(rooms.id, mainTable.roomId))
		.leftJoin(properties, eq(properties.id, rooms.propertyId))
		.where(
			and(
				...whereFilter,
				eq(mainTable.companyId, payload.company.id),
			)
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
		.innerJoin(customers, eq(customers.id, mainTable.customerId))
		.where(
			and(eq(mainTable.companyId, payload.company.id), eq(mainTable.id, id)),
		)
		.limit(1)
		.execute();

	return c.json({
		data: result,
	});
});

route.post("/", sValidator("json", schema), async (c) => {
	const data = c.req.valid("json");

	const payload = c.get("jwtPayload");

	const result = await db
		.insert(mainTable)
		.values({ ...data, companyId: payload.company.id })
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

	const result = await db
		.update(mainTable)
		.set(data)
		.where(
			and(eq(mainTable.id, id), eq(mainTable.companyId, payload.company.id)),
		)
		.returning();

	return c.json({
		data: result,
	});
});

route.delete("/:id", async (c) => {
	const id = parseInt(c.req.param("id"));
	const payload = c.get("jwtPayload");

	const result = await db
		.delete(mainTable)
		.where(
			and(eq(mainTable.id, id), eq(mainTable.companyId, payload.company.id)),
		)
		.execute();

	return c.json({
		data: result,
	});
});

export default route;
