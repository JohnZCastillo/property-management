import { Hono } from "hono";

import db from "../db/connection.js";
import { bookings as mainTable, customers, properties, rooms, bookingGuest, bookings } from "../db/schema.js";
import withPagination from "../util/pagination.js";
import { eq, getTableColumns, and, count} from "drizzle-orm";

import { bookingValidation as schema } from "../validation/schema.js";
import { sValidator } from "@hono/standard-validator";
import type { Variables } from "../types/index.js";
import qs from 'qs';
import { alias } from "drizzle-orm/pg-core";

const route = new Hono<{ Variables: Variables }>();

route.get("/", async (c) => {

	const payload = c.get("jwtPayload");

	const {page = 1, perPage = 10, filter = {}} = qs.parse (c.req.query())

	const whereFilter = [];

	Object.keys(filter).forEach(key => {
		whereFilter.push(eq(mainTable[key], filter[key]));
	})

	const guest = alias(bookingGuest, 'guest');
	const pointPerson = alias(bookingGuest, 'point_person');

	const query = db
		.select({
			bookings: getTableColumns(mainTable),
			properties: getTableColumns(properties),	
			rooms: getTableColumns(rooms),	
			pointPerson: getTableColumns(customers),
			totalGuest: count(guest.id) 
		})
		.from(mainTable)
		.leftJoin(rooms, eq(rooms.id, mainTable.roomId))
		.leftJoin(properties, eq(properties.id, rooms.propertyId))
		.leftJoin(guest,
			and(
				eq(guest.bookingId, mainTable.id),
			))
		.leftJoin(pointPerson,
			and(
				eq(pointPerson.bookingId, mainTable.id),
				eq(pointPerson.isPointPerson, true)
			))
		.leftJoin(customers, eq(customers.id, pointPerson.customerId))
		.where(
			and(
				...whereFilter,
				eq(mainTable.companyId, payload.company.id),
			)
		).groupBy(bookings.id, properties.id, rooms.id, pointPerson.id, customers.id)

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

	const [{roomFee}] = await db.select({roomFee: rooms.amount}).from(rooms).where(eq(rooms.id, data.roomId)).limit(1);

	const totalPayment = 2 * parseFloat(roomFee);

	const result = await db
		.insert(mainTable)
		.values({ ...data, companyId: payload.company.id, amount: `${totalPayment}` })
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
