import * as z from "zod";
import bcrypt from "bcryptjs";
import "dotenv/config";

export const companyValidation = z.object({
	name: z.string(),
	code: z.string(),
});

export const customerValidation = z.object({
	name: z.string().max(255).nonempty("Name is required"),
	email: z.email().max(255).optional(),
	contact: z.string().max(20).optional(),
	age: z.number().int().min(0, "Age must be positive").optional(),
});

export const roomValidation = z.object({
	title: z.string().max(255).nonempty("Name is required"),
	status: z.enum([ "available",
	"occupied",
	"maintenance",
	"reserved"]),
	propertyId: z.number().int(),
});

export const expenseValidation = z.object({
	title: z.string().max(255).nonempty("Title is required"),
	amount: z
		.number()
		.min(0, "Amount must be positive")
		.refine((val) => Number.isInteger(val * 100), {
			message: "Amount must have max 2 decimal places",
		})
		.transform((val) => val.toFixed(2)),
	targetType: z.enum(["property", "room", "job_order"]),
	targetId: z.number().int().positive("Valid target ID required").optional(),
});

export const propertyValidation = z.object({
	title: z.string().max(255).nonempty("Title is required"),
});

export const userValidation = z.object({
	name: z.string().max(255).min(1),
	email: z.string().email().max(255),
	password: z.string().max(255).min(8),
	archived: z.boolean().default(false),
	roleId: z.number().int().positive(),
	companyId: z.number().int().positive(),
});

export const staffValidation = z.object({
	name: z.string().max(255).min(1),
	email: z.string().email().max(255),
	password: z.string().max(255).min(8),
	archived: z.boolean().default(false),
});

export const roleValidation = z.object({
	name: z.string().max(255).min(1),
});

export const bookingValidation = z.object({
	customerId: z.number().int().positive(),
	roomId: z.number().int().positive(),
	timeIn: z
		.string()
		.refine((val) => !isNaN(Date.parse(val)), {
			message: "Invalid date format",
		})
		.transform((val) => new Date(val)),
	timeOut: z
		.string()
		.refine((val) => !isNaN(Date.parse(val)), {
			message: "Invalid date format",
		})
		.transform((val) => new Date(val)),
	status: z.enum(["confirmed", "checked_in", "checked_out", "cancelled"]),
});

export const jobOrderValidation = z.object({
	title: z.string().max(255).min(1),
	description: z.string().optional(),
	status: z.enum(["pending", "in_progress", "completed", "cancelled"]),
	staffId: z.number().int().positive().optional(),
	roomId: z.number().int().positive().nullable().optional(),
});

export const authValidation = z.object({
	email: z.email().max(255).min(1),
	password: z.string().max(255).min(1),
});

export const registerValidtion = z.object({
	name: z.string().min(1).max(255),
	email: z.string().email().max(255),
	password: z
		.string()
		.min(8)
		.max(255)
		.transform((val) => bcrypt.hash(val, parseInt(process.env.SALT_ROUNDS!))),
	company_name: z.string().min(1).max(255),
	company_code: z.string().min(1).max(50),
});
