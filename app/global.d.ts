declare module '@onflow/fcl';

interface Service {
    f_type:    string;
    f_vsn:     string;
    type:      string;
    uid:       string;
    network:   string;
    endpoint:  string;
    id?:       string;
    identity?: Data;
    provider?: Provider;
    method?:   string;
    data?:     Data;
}

interface Data {
    address: string;
    keyId?:  number;
}

interface Provider {
    f_type:      string;
    f_vsn:       string;
    address:     string;
    name:        string;
    icon:        string;
    description: string;
}

interface FlowUser {
    f_type:   string;
    f_vsn:    string;
    addr:     string;
    cid:      string;
    loggedIn: boolean;
    services: Service[];
}

interface FlowContracts {

}

interface Application {
    id?: string;
    client_id:                 string;
    application_type:          string;
    client_application_type:   number;
    client_name:               string;
    client_secret:             string;
    client_uri:                string;
    consent_flow:              number;
    contacts:                  any[];
    cors_allowed:              any[];
    default_acr:               string[];
    flow_account_creation:     string;
    flow_contracts:            FlowContracts;
    flow_custody:              number;
    grant_types:               any[];
    legal_id:                  string;
    logo_uri:                  string;
    notif_params_json:         string;
    policy_uri:                string;
    post_logout_redirect_uris: any[];
    redirect_uris:             any[];
    response_types:            string[];
    sector_identifier_uri:     string;
    subject_type:              string;
    suspended:                 boolean;
    tos_uri:                   string;
    updated_at:                Date;
}
