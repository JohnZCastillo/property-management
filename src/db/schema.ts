// schema.ts
import {
	pgTable,
	pgEnum,
	serial,
	varchar,
	text,
	decimal,
	timestamp,
	boolean,
	integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const bookingStatus = pgEnum("booking_status", [
	"pending",
    "confirmed",
    "cancelled",
    "for_checkin",
    "for_checkout",
    "checked_in",
    "checkout"
]);

export const paymentStatus = pgEnum("payment_status", [
	"pending",
    "success",
    "failed",
]);

export const roomStatus = pgEnum("room_status", [
	"available",
	"occupied",
	"maintenance",
	"reserved",
]);

export const jobStatus = pgEnum("job_status", [
	"pending",
	"in_progress",
	"completed",
	"cancelled",
]);
export const expenseTargetType = pgEnum("expense_target_type", [
	"property",
	"room",
	"job_order",
]);

// Tables
export const companies = pgTable("companies", {
	id: serial("id").primaryKey(),
	name: varchar("name", { length: 255 }).notNull(),
	code: varchar("code", { length: 50 }).unique().notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const roles = pgTable("roles", {
	id: serial("id").primaryKey(),
	name: varchar("name", { length: 100 }).unique().notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
	id: serial("id").primaryKey(),
	name: varchar("name", { length: 255 }).notNull(),
	email: varchar("email", { length: 255 }).unique().notNull(),
	password: varchar("password", { length: 255 }).notNull(),
	verifiedAt: timestamp("verified_at", { withTimezone: true }),
	archived: boolean("archived").default(false),
	roleId: integer("role_id")
		.notNull()
		.references(() => roles.id, { onDelete: "restrict" }),
	companyId: integer("company_id")
		.notNull()
		.references(() => companies.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const properties = pgTable("properties", {
	id: serial("id").primaryKey(),
	title: varchar("title", { length: 255 }).notNull(),
	companyId: integer("company_id")
		.notNull()
		.references(() => companies.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const rooms = pgTable("rooms", {
	id: serial("id").primaryKey(),
	propertyId: integer("property_id")
		.notNull()
		.references(() => properties.id, { onDelete: "cascade" }),
	companyId: integer("company_id")
		.notNull()
		.references(() => companies.id, { onDelete: "cascade" }),
	
	title: varchar("title", { length: 255 }).notNull(),
	status: roomStatus("status").default("available"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
	amount: decimal("amount", { precision: 10, scale: 2 }).default('0.0').notNull(),
});

export const customers = pgTable("customers", {
	id: serial("id").primaryKey(),
	name: varchar("name", { length: 255 }).notNull(),
	email: varchar("email", { length: 255 }),
	contact: varchar("contact", { length: 20 }),
	age: integer("age"),
	companyId: integer("company_id")
		.notNull()
		.references(() => companies.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const bookings = pgTable("bookings", {
	id: serial("id").primaryKey(),
	roomId: integer("room_id")
		.notNull()
		.references(() => rooms.id, { onDelete: "restrict" }),
	companyId: integer("company_id")
		.notNull()
		.references(() => companies.id, { onDelete: "cascade" }),
	amount: decimal("amount", { precision: 10, scale: 2 }).default('0.0').notNull(),
	timeIn: timestamp("time_in", { withTimezone: true }).notNull(),
	timeOut: timestamp("time_out", { withTimezone: true }).notNull(),
	status: bookingStatus("status").default("confirmed"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const attachment = pgTable("attachments", {
	id: serial("id").primaryKey(),
	filename: varchar("name", { length: 255 }).notNull(),
	path: varchar("name", { length: 255 }).notNull(),
	attachableId: varchar("name", { length: 255 }).notNull(),
	attachableType: varchar("name", { length: 255 }).notNull(),
	companyId: integer("company_id")
		.notNull()
		.references(() => companies.id, { onDelete: "restrict" }),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const bookingPayments = pgTable("booking_payments", {
	id: serial("id").primaryKey(),
	bookingsId: integer("booking_id")
		.notNull()
		.references(() => bookings.id, { onDelete: "cascade" }),
	status: paymentStatus("status").default("pending"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const bookingGuest = pgTable("booking_guest", {
	id: serial("id").primaryKey(),
	bookingId: integer("booking_id")
		.notNull()
		.references(() => bookings.id, { onDelete: "cascade" }),
	customerId: integer("customer_id")
		.notNull()
		.references(() => customers.id, { onDelete: "cascade" }),
	isPointPerson: boolean("is_point_person").default(false),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const jobOrders = pgTable("job_orders", {
	id: serial("id").primaryKey(),
	title: varchar("title", { length: 255 }).notNull(),
	description: text("description"),
	status: jobStatus("status").default("pending"),
	staffId: integer("staff_id").references(() => users.id, {
		onDelete: "restrict",
	}),
	roomId: integer("room_id").references(() => rooms.id, {
		onDelete: "set null",
	}),
	companyId: integer("company_id")
		.notNull()
		.references(() => companies.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const expenses = pgTable("expenses", {
	id: serial("id").primaryKey(),
	companyId: integer("company_id")
		.notNull()
		.references(() => companies.id, { onDelete: "cascade" }),
	title: varchar("title", { length: 255 }).notNull(),
	amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
	targetType: expenseTargetType("target_type"),
	targetId: integer("target_id"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations (same as before)
export const companiesRelations = relations(companies, ({ many }) => ({
	properties: many(properties),
	users: many(users),
	expenses: many(expenses),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
	users: many(users),
}));

export const usersRelations = relations(users, ({ many, one }) => ({
	company: one(companies, {
		fields: [users.companyId],
		references: [companies.id],
	}),
	role: one(roles, {
		fields: [users.roleId],
		references: [roles.id],
	}),
	jobOrders: many(jobOrders),
}));

export const propertiesRelations = relations(properties, ({ one, many }) => ({
	company: one(companies, {
		fields: [properties.companyId],
		references: [companies.id],
	}),
	rooms: many(rooms),
}));

export const roomsRelations = relations(rooms, ({ one, many }) => ({
	property: one(properties, {
		fields: [rooms.propertyId],
		references: [properties.id],
	}),
	bookings: many(bookings),
	jobOrders: many(jobOrders),
}));

export const customersRelations = relations(customers, ({ many }) => ({
	bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
	customer: one(customers, {
		fields: [bookings.customerId],
		references: [customers.id],
	}),
	room: one(rooms, {
		fields: [bookings.roomId],
		references: [rooms.id],
	}),
}));

export const jobOrdersRelations = relations(jobOrders, ({ one }) => ({
	staff: one(users, {
		fields: [jobOrders.staffId],
		references: [users.id],
	}),
	room: one(rooms, {
		fields: [jobOrders.roomId],
		references: [rooms.id],
	}),
}));
