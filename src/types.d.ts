type Env = {
	__STATIC_CONTENT: KVNamespace;
	DEFAULT_PUBLIC_KEY: string;
	DEFAULT_PRIVATE_KEY: string;
	COOKIE_NAME: string;
	COOKIE_PASSWORD: string;
	DB: D1Database;
};

type Admin = {
	id: number;
	fullname: string;
	username: string;
	email: string;
};
