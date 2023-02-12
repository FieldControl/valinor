import { parseKeySpaces, parseRedisInfo } from '@utils/parseRedisInfo.js';
import type { Redis } from 'ioredis';
import { Gauge } from 'prom-client';
import { container } from 'tsyringe';
import { kRedis } from '../../tokens.js';

export function createRedisMetrics() {
	const redis = container.resolve<Redis>(kRedis);

	const keyCountMetrics = new Gauge({
		help: 'Number of keys in Redis',
		name: 'url_analyzer_api_redis_key_count',
		labelNames: ['db_name', 'status'],
	});

	const keySizeMetrics = new Gauge({
		help: 'Size of keys in Redis',
		name: 'url_analyzer_api_redis_key_size',
		labelNames: ['db_name', 'status'],
	});

	const cpuUsageMetrics = new Gauge({
		help: 'CPU usage of Redis',
		name: 'url_analyzer_api_redis_cpu_usage',
		labelNames: ['db_name', 'key'],
	});

	const memoryUsageMetrics = new Gauge({
		help: 'Memory usage of Redis',
		name: 'url_analyzer_api_redis_memory_usage',
		labelNames: ['db_name'],
	});

	const rssUsageMetrics = new Gauge({
		help: 'RSS usage of Redis',
		name: 'url_analyzer_api_redis_rss_usage',
		labelNames: ['db_name', 'key'],
	});

	const allocatedMemoryMetrics = new Gauge({
		help: 'Allocated memory usage of Redis',
		name: 'url_analyzer_api_redis_allocated_memory_usage',
		labelNames: ['db_name', 'key'],
	});

	const usedMemoryMetrics = new Gauge({
		help: 'Used memory usage of Redis',
		name: 'url_analyzer_api_redis_used_memory_usage',
		labelNames: ['db_name', 'key'],
	});

	const generalMemoryMetrics = new Gauge({
		help: 'General memory usage of Redis',
		name: 'url_analyzer_api_redis_general_memory_usage',
		labelNames: ['db_name', 'key'],
	});

	return async () => {
		const [[, keyCount], [, rawRedisInfo]] = (await redis.multi().dbsize().info().exec()) as [
			[unknown, number],
			[unknown, string],
		];

		const redisInfo = parseRedisInfo(rawRedisInfo);

		const db_name = 'url_analyzer_api';
		const keySpaces = parseKeySpaces(redisInfo.keyspace);

		keyCountMetrics.set({ db_name, status: 'total' }, keyCount);

		for (const [key, value] of Object.entries(keySpaces)) {
			keyCountMetrics.set({ db_name, status: key }, value);
		}

		keySizeMetrics.set({ db_name, status: 'total' }, redisInfo.memory.used_memory_dataset);

		for (const [key, value] of Object.entries(redisInfo.cpu)) {
			cpuUsageMetrics.set({ db_name, key: key.replace('used_cpu_', '') }, Number(value));
		}

		memoryUsageMetrics.set({ db_name }, redisInfo.memory.used_memory);

		rssUsageMetrics.set({ db_name, key: 'used' }, redisInfo.memory.used_memory_rss);

		for (const [key, value] of Object.entries(redisInfo.memory)) {
			if (
				['used_memory', 'used_memory_rss', 'total_system_memory'].includes(key) ||
				key.includes('_human') ||
				Number.isNaN(Number(value))
			)
				continue;

			if (key.startsWith('allocator_')) {
				allocatedMemoryMetrics.set({ db_name, key: key.replace('allocator_', '') }, Number(value));
				continue;
			}

			if (key.startsWith('rss_')) {
				rssUsageMetrics.set({ db_name, key: key.replace('rss_', '') }, Number(value));
				continue;
			}

			if (key.startsWith('used_memory_')) {
				usedMemoryMetrics.set({ db_name, key: key.replace('used_memory_', '') }, Number(value));
				continue;
			}

			generalMemoryMetrics.set({ db_name, key: key.replace('mem_', '') }, Number(value));
		}
	};
}
