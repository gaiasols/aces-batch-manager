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

type Batch = {
	id: number;
	token: string;
	org_id: number;
	date: string;
	type: string;
	mode: string | null;
	split: number;
	title: string;
	status: number;
	time1: string | null;
	time2: string | null;
	time3: string | null;
	time4: string | null;
	created?: string | null;
	updated?: string | null;
};

type VBatch = Batch & {
	org_name: string;
	modules: number;
};

type Module = {
	id: string;
	category: string;
	title: string;
	ascent: number;
	version: string | null;
	created?: string;
	updated?: string | null;
};

type BatchModule = {
	batch_id: number;
	module_id: string;
	category: string;
};

type Organization = {
	id: string;
	name: string;
	address: string | null;
	created?: string | null;
	updated?: string | null;
};

type VOrganization = Organization & {
	batches: number;
	persons: number;
	last_batch_date: string;
	prev_id: number | null;
	next_id: number | null;
};

type TParticipant = {
	name: string,
	hash?: string,
	username?: string,
}

type TParticipants = TParticipant[]