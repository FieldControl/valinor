import { readFileSync } from 'node:fs';
import http from 'node:http';
import https from 'node:https';
import { parse } from 'node:url';
import next from 'next';

const cert = readFileSync('../../url_analyzer_selfsigned.crt');
const key = readFileSync('../../url_analyzer_selfsigned.key');

const port = Number.parseInt(process.env.PORT ?? '3000', 10);
const httpsPort = Number.parseInt(process.env.HTTPS_PORT ?? '3001', 10);
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

console.log(process.env);

void app.prepare().then(() => {
	if (dev) {
		http
			.createServer((req, res) => {
				const parsedUrl = parse(req.url ?? '', true);
				void handle(req, res, parsedUrl);
			})
			.listen(port, () => {
				console.log(`> Ready on http://localhost:${port}`);
			});
	}

	https
		.createServer(
			{
				key,
				cert,
			},
			(req, res) => {
				const parsedUrl = parse(req.url ?? '', true);
				void handle(req, res, parsedUrl);
			},
		)
		.listen(httpsPort, () => {
			console.log(`> Ready on https://localhost:${httpsPort}`);
		});
});
