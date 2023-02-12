import Imgur from '@functions/services/Imgur.js';
import { kImgur } from 'tokens.js';
import { container } from 'tsyringe';

export function createImgurClient() {
	const client = new Imgur();

	container.register(kImgur, { useValue: client });
}
