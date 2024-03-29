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
	regrouping: number;
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
	persons: number;
};

type AcesModule = {
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

type VBatchModule = BatchModule & {
	title: string;
};

type BatchRuntimeInfo = {
	batch_id: number;
	modules: number;
	tokens: string[];
	slot_mode: string;
	types: string;
	permutation: number;
	grouping: string;
	runtime: string;
	mod_self: VBatchModule | null;
	mod_case: VBatchModule | null;
	mod_face: VBatchModule | null;
	mod_disc: VBatchModule | null;
	mod_1: VBatchModule | null;
	mod_2: VBatchModule | null;
	mod_3: VBatchModule | null;
	mod_4: VBatchModule | null;
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

type Person = {
	id: string;
	org_id: number;
	batch_id: number;
	fullname: string;
	username: string;
	email: string | null;
	hash: string | null;
	created?: string | null;
	updated?: string | null;
};

type VPerson = Person & {
	org_name: string;
	group_id: string;
	group_name: string | null;
	disc_ass_id: number | null;
	disc_assessor_name: string | null;
	face_ass_id: number | null;
	face_assessor_name: string | null;
	case_ass_id: number | null;
	case_assessor_name: string | null;
	slot_id: number;
	slot1: string | null;
	slot2: string | null;
	slot3: string | null;
	slot4: string | null;
	self_pos: number | null;
	case_pos: number | null;
	face_pos: number | null;
	disc_pos: number | null;
};

type Group = {
	id: string;
	batch_id: number;
	ass_id: number;
	name: string;
	slot1: string | null;
	slot2: string | null;
	slot3: string | null;
	slot4: string | null;
	created?: string | null;
	updated?: string | null;
};

type VGroup = Group & {
	disc_assessor_name: string | null;
	members: number;
	slot1: string;
	slot2: string;
	slot3: string;
	slot4: string;
	self_pos: number;
	case_pos: number;
	face_pos: number;
	disc_pos: number;
};

type Grouping = {
	batch_id: number;
	group_id: string;
	person_id: string;
	face_ass_id: number | null;
	case_ass_id: number | null;
	created?: string | null;
	updated?: string | null;
};

type CustomSlot = {
	slot1: string | null;
	slot2: string | null;
	slot3: string | null;
	slot4: string | null;
};
