import puppeteer from 'puppeteer';
import { kPuppeteer } from 'tokens.js';
import { container } from 'tsyringe';

export async function createPuppeteerBrowser() {
	const browser = await puppeteer.launch({
		args: ['--no-sandbox', '--disable-setuid-sandbox'],
		defaultViewport: {
			height: 1_080,
			width: 1_920,
		},
	});

	container.register(kPuppeteer, { useValue: browser });
}
