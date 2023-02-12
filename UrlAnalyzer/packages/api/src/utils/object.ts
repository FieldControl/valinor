export function removeUndefinedKeys<T extends object>(object: T): T {
	return Object.fromEntries(Object.entries(object).filter(([, value]) => value !== undefined)) as T;
}

export function returnObjectOrNull<T>(object: T | null, clean = true): T | null {
	if (!object) return null;

	const cleanedObject = clean ? removeUndefinedKeys(object) : object;

	if (Object.keys(cleanedObject).length > 0) {
		return cleanedObject;
	}

	return null;
}
