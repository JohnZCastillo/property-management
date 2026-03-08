// Unauthorized.ts
export class InvalidBookingError extends Error {
	public readonly status: number = 403;
	public readonly name: string = "InvalidBooking";

	constructor(message: string = "Invalid Booking") {
		super(message);
		Object.setPrototypeOf(this, InvalidBookingError.prototype);
	}
}
