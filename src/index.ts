import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from 'hono/cors'

import "dotenv/config";

import routes from "./routes/_index.js";
import { UnauthorizedError } from "./exceptions/Unauthorized.js";
import { ForbiddenError } from "./exceptions/Forbidden.js";
import { HTTPException } from 'hono/http-exception';
import { InvalidBookingError } from "./exceptions/InvalidBookingError.ts";

process.env.TZ = "Asia/Manila";

const app = new Hono();

app.use('/api/*', cors())
app.route("/api", routes);

app.onError((err, c) => {

	if(process.env.ENVIRONMENT === 'DEVELOPMENT'){
		console.log(err);
	}

	if (err instanceof UnauthorizedError || err instanceof  HTTPException) {
		return c.json({ message: err.message, status: 401 }, 401);
	}

	if (err instanceof ForbiddenError) {
		return c.json({ message: err.message, status: 403 }, 403);
	}

	if (err instanceof InvalidBookingError) {
		return c.json({ message: err.message, status: 400 }, 400);
	}

	return c.json({ message: "Something went wrong, please try again" }, 500);
});

serve(
	{
		fetch: app.fetch,
		port: parseInt(process.env.APP_PORT!),
	},
	(info) => {
		console.log(`Server is running on http://localhost:${info.port}`);
	},
);
