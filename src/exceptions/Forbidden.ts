// Unauthorized.ts
export class ForbiddenError extends Error {
	public readonly status: number = 403;
	public readonly name: string = "ForbiddenError";

	constructor(message: string = "Forbidden access") {
		super(message);
		Object.setPrototypeOf(this, ForbiddenError.prototype);
	}
}
