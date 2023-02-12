import { collectDefaultMetrics, register } from 'prom-client';
import { container } from 'tsyringe';
import { kPrometheus } from '../tokens.js';

export function createPromRegistry() {
	container.register(kPrometheus, { useValue: register });

	collectDefaultMetrics({
		prefix: 'url_analyzer_api_',
	});
}
