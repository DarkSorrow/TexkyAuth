CREATE KEYSPACE IF NOT EXISTS account WITH replication = {'class':'SimpleStrategy', 'replication_factor': 1 };

// DROP TABLE IF EXISTS account.subject_account;
CREATE TABLE account.subject_account ( 
    subject timeuuid,
    email text,
    flow_account text,
    flow_key text,
    flow_rules blob,
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

CREATE TABLE IF NOT EXISTS account.application ( 
    client_id timeuuid,
    client_secret text,
    salt blob,
    suspended boolean,
    application_type text,
    logo_uri text,
    subject_type text,
    client_name text,
    client_uri text,
    policy_uri text,
    tos_uri text,
    updated_at timestamp,
    contacts set<text>,
    client_application_type int,
    sector_identifier_uri text,
    response_types set<text>,
    redirect_uris set<text>,
    grant_types set<text>,
    default_acr set<text>,
    post_logout_redirect_uris set<text>,
    notif_params_json text,
    flow_key text,
    flow_account text,
    flow_internal tinyint,
    PRIMARY KEY (client_id)
);

CREATE TABLE IF NOT EXISTS account.consent_application ( 
    client_id timeuuid,
    subject timeuuid,
    flow_account text,
    flow_internal tinyint,
    PRIMARY KEY (client_id, subject) 
);