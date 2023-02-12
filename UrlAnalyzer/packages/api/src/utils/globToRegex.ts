export function globToRegex(glob: string) {
	const specialChars = '\\^$.*+?()[]{}|';
	let regex = '^';

	for (const char of glob) {
		if (char === '*') {
			regex += '.*';
		} else if (char === '?') {
			regex += '.';
		} else if (specialChars.includes(char)) {
			regex += `\\${char}`;
		} else {
			regex += char;
		}
	}

	regex += '$';
	return new RegExp(regex);
}
