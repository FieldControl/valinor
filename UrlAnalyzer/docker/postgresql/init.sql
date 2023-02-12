create EXTENSION pgcrypto;
create function "set_current_timestamp_updated_at"() RETURNS trigger
    language plpgsql
    as $$
declare
  _new record;
begin
  _new := NEW;
  _new."updated_at" = NOW();
  return _new;
end;
$$;

create table "users" (
	"id" varchar(255) primary key,
	"email" varchar(255) not null unique,
	"password" varchar(255),
	"type" integer not null,
	"name" varchar(255) not null,
	"active" boolean not null default true,
	"known_ips_hashes" text[] not null default '{}'::text[],
	"two_factor_config_id" varchar(255) default null,
	"last_login_at" timestamp default null,
	"reset_password_token" varchar(255) default null,
	"terms_accepted_at" timestamp default null,
	"created_at" timestamp not null default now(),
	"updated_at" timestamp not null default now()
);

create index "users_email_index" on "users" ("email");

create table "oauth_connections" (
	"id" varchar(255) primary key,
	"user_id" varchar(255) not null references "users"("id") on delete cascade,
	"provider" varchar(255) not null,
	"provider_user_id" varchar(255) not null,
	"access_token" varchar(255) not null,
	"refresh_token" varchar(255) not null,
	"expires_at" timestamp default null,
	"scopes" text[] not null default '{}'::text[],
	"created_at" timestamp not null default now(),
	"updated_at" timestamp not null default now()
);

create index "oauth_connections_user_id_index" on "oauth_connections" ("user_id");
alter table "oauth_connections" add constraint "oauth_connections_user_id_provider_unique" unique ("user_id", "provider");

create table "two_factor_configs" (
	"id" varchar(255) primary key references "users"("id") on delete cascade, 
	"enabled" boolean not null default false,
	"type" integer not null default 0,
	"secret" varchar(255),
	"recovery_codes" text[] not null default '{}'::text[],
	"created_at" timestamp not null default now(),
	"updated_at" timestamp not null default now()
);

alter table "users" add constraint "fk_two_factor_config_id" foreign key ("two_factor_config_id") references "two_factor_configs"("id") on delete set null;

create table "sessions" (
	"id" varchar(255) primary key,
	"user_id" varchar(255) not null references "users"("id") on delete cascade,
	"session_token" varchar(255) not null,
	"created_at" timestamp not null default now(),
	"updated_at" timestamp not null default now()
);

create index "sessions_user_id_index" on "sessions" ("user_id");