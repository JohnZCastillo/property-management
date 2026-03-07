import { Hono } from "hono";

import db from "../db/connection.js";
import { bookingGuest as mainTable, customers as customerTable, bookings, companies } from "../db/schema.js";
import { eq, and, count } from "drizzle-orm";
import { guestValidation as schema } from "../validation/schema.js";
import { sValidator } from "@hono/standard-validator";
import type { Variables } from "../types/index.js";

const route = new Hono<{ Variables: Variables }>();

route.post("/:companyId/:bookingId", sValidator("json", schema), async (c) => {

	const {companyId, bookingId} = c.req.param();

	const data = c.req.valid("json");

	const isValid = await db.select({
		guestCount: count(mainTable.id)
	}).from(bookings)
	.innerJoin(companies, eq(companies.id, bookings.companyId))
	.leftJoin(mainTable, eq(mainTable.bookingId, bookings.id))
	.where(and(
		eq(bookings.id, parseInt(bookingId)),
		eq(companies.id, parseInt(companyId)),
	))
	.having(({ guestCount }) => eq(guestCount, 0));

	console.log(isValid);

	if(isValid.length <= 0){
		throw new Error('Invalid request');
	}

	const guests = await db.transaction(async (tx) => {

		const customers = await db
			.insert(customerTable)
			.values(data.guests.map(guest => ({...guest, companyId: parseInt(companyId)})))
			.returning();
	
		return await db
			.insert(mainTable)
			.values(customers.map(customer => ({customerId: customer.id, bookingId: parseInt(bookingId)})))
			.returning();
	});

	return c.json({ data: guests}, 201);

});

export default route;