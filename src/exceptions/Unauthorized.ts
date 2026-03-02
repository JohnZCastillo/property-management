// Unauthorized.ts
export class UnauthorizedError extends Error {
	public readonly status: number = 401;
	public readonly name: string = "UnauthorizedError";

	constructor(message: string = "Unauthorized access") {
		super(message);
		Object.setPrototypeOf(this, UnauthorizedError.prototype);
	}
}
