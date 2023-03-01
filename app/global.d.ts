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
