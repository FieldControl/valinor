interface Server {
	arch_bits: number;
	atomicvar_api: string;
	config_file: number;
	configured_hz: number;
	executable: string;
	gcc_version: string;
	hz: number;
	io_threads_active: number;
	lru_clock: number;
	monotonic_clock: string;
	multiplexing_api: string;
	os: string;
	process_id: number;
	process_supervised: string;
	redis_build_id: string;
	redis_git_dirty: number;
	redis_git_sha1: number;
	redis_mode: string;
	redis_version: string;
	run_id: string;
	server_time_usec: number;
	tcp_port: number;
	uptime_in_days: number;
	uptime_in_seconds: number;
}

interface Clients {
	blocked_clients: number;
	client_recent_max_input_buffer: number;
	client_recent_max_output_buffer: number;
	clients_in_timeout_table: number;
	cluster_connections: number;
	connected_clients: number;
	maxclients: number;
	tracking_clients: number;
}

interface Memory {
	active_defrag_running: number;
	allocator_active: number;
	allocator_allocated: number;
	allocator_frag_bytes: number;
	allocator_frag_ratio: number;
	allocator_resident: number;
	allocator_rss_bytes: number;
	allocator_rss_ratio: number;
	lazyfree_pending_objects: number;
	lazyfreed_objects: number;
	maxmemory: number;
	maxmemory_human: string;
	maxmemory_policy: string;
	mem_allocator: string;
	mem_aof_buffer: number;
	mem_clients_normal: number;
	mem_clients_slaves: number;
	mem_fragmentation_bytes: number;
	mem_fragmentation_ratio: number;
	mem_not_counted_for_evict: number;
	mem_replication_backlog: number;
	number_of_cached_scripts: number;
	rss_overhead_bytes: number;
	rss_overhead_ratio: number;
	total_system_memory: number;
	total_system_memory_human: string;
	used_memory: number;
	used_memory_dataset: number;
	used_memory_dataset_perc: string;
	used_memory_human: string;
	used_memory_lua: number;
	used_memory_lua_human: string;
	used_memory_overhead: number;
	used_memory_peak: number;
	used_memory_peak_human: string;
	used_memory_peak_perc: string;
	used_memory_rss: number;
	used_memory_rss_human: string;
	used_memory_scripts: number;
	used_memory_scripts_human: string;
	used_memory_startup: number;
}

interface Persistence {
	aof_base_size: number;
	aof_buffer_length: number;
	aof_current_rewrite_time_sec: number;
	aof_current_size: number;
	aof_delayed_fsync: number;
	aof_enabled: number;
	aof_last_bgrewrite_status: string;
	aof_last_cow_size: number;
	aof_last_rewrite_time_sec: number;
	aof_last_write_status: string;
	aof_pending_bio_fsync: number;
	aof_pending_rewrite: number;
	aof_rewrite_buffer_length: number;
	aof_rewrite_in_progress: number;
	aof_rewrite_scheduled: number;
	current_cow_size: number;
	current_cow_size_age: number;
	current_fork_perc: number;
	current_save_keys_processed: number;
	current_save_keys_total: number;
	loading: number;
	module_fork_in_progress: number;
	module_fork_last_cow_size: number;
	rdb_bgsave_in_progress: number;
	rdb_changes_since_last_save: number;
	rdb_current_bgsave_time_sec: number;
	rdb_last_bgsave_status: string;
	rdb_last_bgsave_time_sec: number;
	rdb_last_cow_size: number;
	rdb_last_save_time: number;
}

interface Stats {
	active_defrag_hits: number;
	active_defrag_key_hits: number;
	active_defrag_key_misses: number;
	active_defrag_misses: number;
	dump_payload_sanitizations: number;
	evicted_keys: number;
	expire_cycle_cpu_milliseconds: number;
	expired_keys: number;
	expired_stale_perc: number;
	expired_time_cap_reached_count: number;
	instantaneous_input_kbps: number;
	instantaneous_ops_per_sec: number;
	instantaneous_output_kbps: number;
	io_threaded_reads_processed: number;
	io_threaded_writes_processed: number;
	keyspace_hits: number;
	keyspace_misses: number;
	latest_fork_usec: number;
	migrate_cached_sockets: number;
	pubsub_channels: number;
	pubsub_patterns: number;
	rejected_connections: number;
	slave_expires_tracked_keys: number;
	sync_full: number;
	sync_partial_err: number;
	sync_partial_ok: number;
	total_commands_processed: number;
	total_connections_received: number;
	total_error_replies: number;
	total_forks: number;
	total_net_input_bytes: number;
	total_net_output_bytes: number;
	total_reads_processed: number;
	total_writes_processed: number;
	tracking_total_items: number;
	tracking_total_keys: number;
	tracking_total_prefixes: number;
	unexpected_error_replies: number;
}

interface Replication {
	connected_slaves: number;
	master_failover_state: string;
	master_repl_offset: number;
	master_replid: string;
	master_replid2: number;
	repl_backlog_active: number;
	repl_backlog_first_byte_offset: number;
	repl_backlog_histlen: number;
	repl_backlog_size: number;
	role: string;
	second_repl_offset: number;
}

interface Cpu {
	used_cpu_sys: number;
	used_cpu_sys_children: number;
	used_cpu_sys_main_thread: number;
	used_cpu_user: number;
	used_cpu_user_children: number;
	used_cpu_user_main_thread: number;
}

interface Modules {
	module: string[];
}

interface Errorstats {
	errorstat_NOAUTH: string;
}

interface Cluster {
	cluster_enabled: number;
}

interface KeySpace {
	db0?: string;
}

interface ParsedRedisInfo {
	clients: Clients;
	cluster: Cluster;
	cpu: Cpu;
	errorstats: Errorstats;
	keyspace: KeySpace;
	memory: Memory;
	modules: Modules;
	persistence: Persistence;
	replication: Replication;
	server: Server;
	stats: Stats;
}

type DeepPartial<T> = Partial<{
	[P in keyof T]: DeepPartial<T[P]>;
}>;

function checkNumber(value: string) {
	return Number.isNaN(Number(value)) ? value : Number(value);
}

export function parseKeySpaces(keySpaces: KeySpace): {
	avg_ttl: number;
	expires: number;
	keys: number;
} {
	const [keys, expires, avg_ttl] = keySpaces.db0?.split(`,`).map((key) => Number(key.split(`=`)[1])) ?? [];

	return {
		keys: keys ?? 0,
		expires: expires ?? 0,
		avg_ttl: avg_ttl ?? 0,
	};
}

export function parseRedisInfo(info: string): ParsedRedisInfo {
	const lines = info.split(`\r\n`).filter((line) => line.length > 0);

	const rootObj: DeepPartial<ParsedRedisInfo> = {};
	let outerKey: keyof ParsedRedisInfo | null = null;

	for (const line of lines) {
		if (line.startsWith(`#`)) {
			outerKey = line.replace(`#`, ``).trim().toLowerCase() as keyof ParsedRedisInfo;

			rootObj[outerKey as keyof ParsedRedisInfo] = {};
			continue;
		}

		const [key, rawValue] = line.split(`:`);

		const value = checkNumber(rawValue!);

		// @ts-expect-error: This is a hack to get around the fact that TS doesn't support dynamic keys
		const objValue = rootObj[outerKey as keyof ParsedRedisInfo][key] as string[] | number | string;

		if (objValue) {
			// @ts-expect-error: This is a hack to get around the fact that TS doesn't support dynamic keys
			rootObj[outerKey as keyof ParsedRedisInfo][key] = [...(Array.isArray(objValue) ? objValue : [objValue]), value];
			continue;
		}

		// @ts-expect-error: This is a hack to get around the fact that TS doesn't support dynamic keys
		rootObj[outerKey as keyof ParsedRedisInfo][key] = value;
	}

	return rootObj as ParsedRedisInfo;
}
