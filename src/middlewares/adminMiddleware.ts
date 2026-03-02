import { createMiddleware } from "hono/factory";
import type { Variables } from "../types/index.js";
import { ForbiddenError } from "../exceptions/Forbidden.js";

const adminMiddleware = createMiddleware<{ Variables: Variables }>(
	async (c, next) => {
		const payload = c.get("jwtPayload");

		if (payload.role.name !== "admin") {
			throw new ForbiddenError();
		}

		await next();
	},
);

export default adminMiddleware;
