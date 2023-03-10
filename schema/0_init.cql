CREATE KEYSPACE IF NOT EXISTS account WITH replication = {'class':'SimpleStrategy', 'replication_factor': 1 };

// DROP TABLE IF EXISTS account.subject_account;
CREATE TABLE IF NOT EXISTS account.subject_account ( 
    subject timeuuid,
	login_type set<text>,
    suspended boolean,
    profile_location int,
    profile_update timestamp,
    flow_account text,
    flow_key text,
    flow_rules blob,
    updated_at timestamp,
    PRIMARY KEY (subject) 
);

CREATE TABLE IF NOT EXISTS account.login_email (
    email text,
    subject timeuuid, 
    email_verified boolean, 
    mfa_type tinyint,
    profile_location int,
    profile_update timestamp,
    suspended boolean,
    updated_at timestamp,
    last_login timestamp,
    enc_type int,
    salt blob,
    password blob,
    PRIMARY KEY (email) 
);

CREATE TABLE IF NOT EXISTS account.login_social (
    provider_subject text,
    provider_client_id text,
    provider_name text,
    email text,
    subject timeuuid,
    suspended boolean,
    provider_data_json text,
    created_at timestamp,
    updated_at timestamp,
    last_login timestamp,
    PRIMARY KEY (provider_subject, provider_client_id, email)
);

CREATE TABLE IF NOT EXISTS account.login_chain_id (
    address text,
    chain_id int,
    chain_name text,
    subject timeuuid,
    suspended boolean,
    provider_data_json text,
    created_at timestamp,
    updated_at timestamp,
    last_login timestamp,
    PRIMARY KEY (chain_id, address)
);

CREATE TABLE IF NOT EXISTS account.login_flow (
    address text,
    network text,
    subject timeuuid,
    suspended boolean,
    provider_data_json text,
    created_at timestamp,
    updated_at timestamp,
    last_login timestamp,
    PRIMARY KEY (network, address)
);

CREATE TABLE IF NOT EXISTS account.application ( 
    client_id text,
    client_secret text,
    suspended boolean,
    application_type text,
    logo_uri text,
    subject_type text,
    client_name text,
    client_uri text,
    policy_uri text,
    tos_uri text,
    contacts set<text>,
    client_application_type int,
    sector_identifier_uri text,
    response_types set<text>,
    redirect_uris set<text>,
    grant_types set<text>,
    default_acr set<text>,
    post_logout_redirect_uris set<text>,
    cors_allowed set<text>,
    notif_params_json text,
    consent_flow tinyint,
    flow_custody tinyint,
    flow_account_creation text,
    flow_contracts map<text, text>,
    legal_id timeuuid,
    updated_at timestamp,
    PRIMARY KEY (client_id)
);

CREATE TABLE IF NOT EXISTS account.consent_application ( 
    client_id text,
    subject timeuuid,
    consent boolean,
    detail_json text,
    created_at timestamp,
    updated_at timestamp,
    PRIMARY KEY (client_id, subject) 
);

CREATE TABLE IF NOT EXISTS account.consent_subject (
    subject timeuuid,
    client_id text,
    consent boolean,
    detail_json text,
    created_at timestamp,
    updated_at timestamp,
    PRIMARY KEY (subject, client_id) 
);

CREATE TABLE IF NOT EXISTS account.legal_entity (
    id timeuuid PRIMARY KEY,
    additional_address text,
    city text,
    country text,
    creator timeuuid,
    email text,
    legal frozen<map<text, text>>,
    logojson blob,
    name text,
    phone text,
    phone_country text,
    postal_code text,
    region text,
    shards text,
    street_address text,
    updated_at timestamp,
    updated_by timeuuid,
    extra map<text, text>,
    paid_options map<text, text>,
    shards_history set<text>
);

CREATE TABLE IF NOT EXISTS account.legal_application (
    legal_id timeuuid,
    client_id text,
    suspended boolean,
    application_type text,
    logo_uri text,
    client_name text,
    client_application_type int,
    consent_flow tinyint,
    flow_custody tinyint,
    flow_account_creation text,
    updated_at timestamp,
    PRIMARY KEY (legal_id, client_id)
);

CREATE TABLE IF NOT EXISTS account.legal_groups (
    legal_id timeuuid,
    subject timeuuid,
    groups text,
    display_name text,
    updated_at timestamp,
    updated_by timeuuid,
    PRIMARY KEY (legal_id, subject, groups)
) WITH CLUSTERING ORDER BY (subject ASC, groups ASC);

CREATE TABLE IF NOT EXISTS account.legal_pending (
    subject timeuuid,
    legal_id timeuuid,
    groups text,
    display_name text,
    updated_at timestamp,
    updated_by timeuuid,
    PRIMARY KEY (subject, legal_id, groups)
) WITH CLUSTERING ORDER BY (legal_id ASC, groups ASC);

CREATE TABLE IF NOT EXISTS account.subject_groups (
    subject timeuuid,
    legal_id timeuuid,
    display_name text,
    pref frozen<map<text, text>>,
    groups set<text>,
    PRIMARY KEY (subject, legal_id)
);

// writing in {private|public}:{category}
CREATE TABLE IF NOT EXISTS account.legal_flow_templates (
	section tinyint,
    legal_id timeuuid,
	auditors set<text>,
    id text,
    PRIMARY KEY (section, legal_id, id)
);

CREATE TABLE IF NOT EXISTS account.flow_templates (
    id text,
    cadence text,
    PRIMARY KEY (id)
);
