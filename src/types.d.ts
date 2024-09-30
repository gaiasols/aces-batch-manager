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
	id: string;
	// token: string;
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
	time1_end?: string | null;
	time2_end?: string | null;
	time3_end?: string | null;
	time4_end?: string | null;
	batch_timestamp_start?: number | null;
	batch_timestamp_end?: number | null;
};

type VBatch = Batch & {
	org_name: string;
	modules: number;
	persons: number;
	prev_id: number | null;
	next_id: number | null;
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
	batch_id: string;
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
	created?: string | null;
	updated?: string | null;
	address: string | null;
	city: string | null;
	province: string | null;
	postal_code: number | null;
	phone: string | null;
	email: string | null;
	website: string | null;
	organization_type: number | null;
	business_sector: number | null;
	company_logo: string | null;
	npwp_number: string | null;
	npwp_name: string | null;
	npwp_nik: string | null;
	npwp_address: string | null;
	npwp_village: string | null;
	npwp_district: string | null;
	npwp_city: string | null;
	npwp_province: string | null;
	contact_name: string | null;
	contact_phone: string | null;
	contact_email: string | null;

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
	nip: string;
	fullname: string;
	jenis_kelamin: 'perempuan' | 'pr' | 'laki-laki' | 'lk';
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
	batch_id: string;
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

type AssessorAllocation = {
	batch_id: string;
	disc_slot1: number;
	disc_slot2: number;
	disc_slot3: number;
	disc_slot4: number;
	face_slot1: number;
	face_slot2: number;
	face_slot3: number;
	face_slot4: number;
	face_slot1_size: number | null;
	face_slot2_size: number | null;
	face_slot3_size: number | null;
	face_slot4_size: number | null;
	permutation: number;
};

type TParticipant = {
	name: string;
	nip: string;
	jenis_kelamin: 'perempuan' | 'pr' | 'laki-laki' | 'lk';
	hash?: string;
	username?: string;
};

type TParticipants = TParticipant[];

// ===============================================================================
// ===============================================================================
type Assessor = {
	id: number;
	hash: string;
	fullname: string;
	username: string;
	email: string | null;
	ranking?: number | null;       
    university?: string | null;    
    date_of_birth?: string | null; 
    graduation_year?: number | null
    phone_number?: string | null;  
    home_address?: string | null;  
    ktp_number?: number | null;    
    npwp_number?: string | null;   
    npwp_name?: string | null;    
};

type SlotsAlloc = {
	// SlotsAlloc
	batch_id: number;
	permutation: number;
	disc_slot1: number;
	disc_slot2: number;
	disc_slot3: number;
	disc_slot4: number;
	face_slot1: number;
	face_slot2: number;
	face_slot3: number;
	face_slot4: number;
	face_slot1_size: number | null;
	face_slot2_size: number | null;
	face_slot3_size: number | null;
	face_slot4_size: number | null;
};

type BatchAssessor = {
	batch_id: number;
	ass_id: number;
	type: string;
	slot1: number;
	slot2: number;
	slot3: number;
	slot4: number;
};

type VBatchAssessor = BatchAssessor & {
	fullname: string;
	username: string;
	email: string | null;
};

type Minmax = {
	mindisc: number;
	maxdisc: number;
	minface: number;
	maxface: number;
};

type GroupFacePosition = Record<string, 1 | 2 | 3 | 4>;

type TDeploymentRequestContract = {
	date_start: string,
	time_start: string,
	date_end: string,
	time_end: string,
	type: "batch" | "slot_1" | "slot_2" | "slot_3" | "slot_4",
}

type TFormOrgType = "general" | "business" | "npwp" | "contact"