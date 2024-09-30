const orgsType = {
	"0": "Swasta",
	"1": "BUMN",
	"2": "Kementerian/Lembaga",
}

export function orgsTypeArray() {
	return Object.entries(orgsType).map(([key, value]) => ({ id: key, name: value }));
}

export function getOrgsType(id: keyof typeof orgsType) {
	return orgsType[id];
}