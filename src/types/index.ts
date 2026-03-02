export type Variables = {
	jwtPayload: {
		user: {
			id: number;
			name: string;
		};
		company: {
			id: number;
			name: string;
			code: string;
		};
		role: {
			id: number;
			name: string;
		};
	};
};
