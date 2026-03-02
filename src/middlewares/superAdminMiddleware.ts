import { createMiddleware } from "hono/factory";
import type { Variables } from "../types/index.js";
import { ForbiddenError } from "../exceptions/Forbidden.js";

const superAdminMiddleware = createMiddleware<{ Variables: Variables }>(
	async (c, next) => {
		const payload = c.get("jwtPayload");

		if (payload.role.name !== "super_admin") {
			throw new ForbiddenError();
		}

		await next();
	},
);

export default superAdminMiddleware;
