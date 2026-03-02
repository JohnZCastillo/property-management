import { serve } from "@hono/node-server";
import { Hono } from "hono";
import "dotenv/config";

import routes from "./routes/_index.js";
import { UnauthorizedError } from "./exceptions/Unauthorized.js";
import { ForbiddenError } from "./exceptions/Forbidden.js";

const app = new Hono();

app.route("/api", routes);

app.onError((err, c) => {
	if (err instanceof UnauthorizedError) {
		return c.json({ message: err.message, status: 401 }, 401);
	}

	if (err instanceof ForbiddenError) {
		return c.json({ message: err.message, status: 403 }, 403);
	}

	return c.json({ message: "Something went wrong, please try again" }, 500);
});

serve(
	{
		fetch: app.fetch,
		port: 3000,
	},
	(info) => {
		console.log(`Server is running on http://localhost:${info.port}`);
	},
);
