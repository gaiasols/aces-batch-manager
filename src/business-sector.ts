const businessSector = {
	'0': "Mining",
	'1': "Oil & Gas",
	'2': "Information Technology",
	'3': "Healthcare",
	'4': "Education",
	'5': "Finance",
	'6': "Manufacturing",
	'7': "Property and Real Estate",
	'8': "Transportation",
	'9': "Logistics",
	'10': "Tourism and Hospitality",
	'11': "Construction",
	'12': "Pharmaceuticals",
	'13': "Telecommunications",
	'14': "Agriculture",
	'15': "Chemicals",
	'16': "Automotive",
	'17': "Aviation",
	'18': "Food and Beverages",
}

export function businessSectorArray() {
	return Object.entries(businessSector).map(([key, value]) => ({ id: key, name: value }));
}

export function getBusinessSector(id: keyof typeof businessSector) {
	return businessSector[id];
}