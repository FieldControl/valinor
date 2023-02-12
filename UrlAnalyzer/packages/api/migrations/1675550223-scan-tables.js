/* eslint-disable tsdoc/syntax */
/**
 * @param  {import('postgres').Sql<any>} sql - postgres client
 */
export async function up(sql) {
	await sql.unsafe(`
		create trigger "users_updated_at" before update on "users" for each row execute procedure "set_current_timestamp_updated_at"();
		create trigger "oauth_connections_updated_at" before update on "oauth_connections" for each row execute procedure "set_current_timestamp_updated_at"();
		create trigger "two_factor_configs_updated_at" before update on "two_factor_configs" for each row execute procedure "set_current_timestamp_updated_at"();
		create trigger "sessions_updated_at" before update on "sessions" for each row execute procedure "set_current_timestamp_updated_at"();


		create table url_analysis (
			id varchar(255) primary key,
			url text not null,
			contacted_domains text[] not null,
			dns jsonb not null,
			metadata jsonb not null,
			screenshot jsonb,
			body text,
			effective_url text not null,
			security_details jsonb not null,
			urls_found text[] not null,
			cookies jsonb not null,
			console_output jsonb not null,
			requests_ids text[] not null,
			certificate_id text not null,
			created_at timestamp not null default now(),
			updated_at timestamp not null default now()
		);

		create trigger "url_analysis_updated_at" before update on "url_analysis" for each row execute procedure "set_current_timestamp_updated_at"();

		create table certificate_details (
			id varchar(255) primary key,
			parent_id varchar(255) not null,
			certificates jsonb not null,
			issuer text not null,
			protocol text not null,
			subject_name text not null,
			valid_from bigint not null,
			valid_to bigint not null,
			created_at timestamp not null default now(),
			updated_at timestamp not null default now()
		);

		create trigger "certificate_details_updated_at" before update on "certificate_details" for each row execute procedure "set_current_timestamp_updated_at"();

		create table requests (
			id varchar(255) primary key,
			parent_id varchar(255) not null,
			headers jsonb not null,
			initiator jsonb not null,
			method text not null,
			nonce text,
			post_data text,
			redirect_chain jsonb not null,
			resource_type text not null,
			response_id text not null,
			url text not null,
			created_at timestamp not null default now(),
			updated_at timestamp not null default now()
		);

		create trigger "requests_updated_at" before update on "requests" for each row execute procedure "set_current_timestamp_updated_at"();
		  
		create table responses (
			id varchar(255) primary key,
			parent_id varchar(255) not null,
			body text,
			headers jsonb not null,
			status integer not null,
			url text not null,
			created_at timestamp not null default now(),
			updated_at timestamp not null default now()
		);

		create trigger "responses_updated_at" before update on "responses" for each row execute procedure "set_current_timestamp_updated_at"();
		  
	`);
}
