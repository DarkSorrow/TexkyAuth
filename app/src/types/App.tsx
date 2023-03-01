import { GrantType, ApplicationType } from './Zod';

export interface OptionType {
  id: string;
  l: string;
}

export interface LegalFormsProps {
  suffix: string;
}

export class NVError extends Error {
  i18nLabel?: string;
}

export enum RequestStatus {
  Init = 0,
  Loading,
  Error,
  Fetched
}
export interface LoadStatus {
  status: RequestStatus.Init | RequestStatus.Loading;
  error: null;
  data: null;
}
export interface SuccessStatus<T> {
  status: RequestStatus.Fetched;
  error: null;
  data: T;
  options?: NVRequestOption | null;
}
export interface ErrorStatus {
  status: RequestStatus.Error;
  error: Error | NVError;
  data: null;
}

export type RequestType<T> = LoadStatus | SuccessStatus<T> | ErrorStatus;

export interface NVRequestOption {
  num?: number;
  pageID?: string | null;
  lastID?: string;
  shards?: string;
  error?: string;
}

export interface NVRequestItems<T> {
  status: number; // Allow to give information about the query 0: does not exist 1: exist 2: deleted
  data: T;
  options: NVRequestOption | null;
}

export interface RequestArray<T> {
  status: number; // Allow to give information about the query 0: does not exist 1: exist 2: deleted
  data: T;
  options: NVRequestOption | null;
}

export interface DataLoad<T> {
  loading: boolean;
  data: Array<T>;
}

export interface EditDataLoad<T> {
  loading: boolean;
  data: T;
}
// union([string().regex(/^https/, 'URLSecure').url('URLFormat'), string().max(0)])
// 
export interface Application {
  id?: string;
  client_id?:                 string;
  application_type:           ApplicationType;
  client_application_type?:   number;
  client_name?:               string;
  client_secret?:             string;
  client_uri?:                string;
  consent_flow?:              number;
  contacts?:                  string[];
  cors_origins?:              string[];
  default_acr?:               string[];
  flow_account_creation?:     string;
  flow_contracts?:            FlowContracts;
  flow_custody?:              number;
  grant_types:                GrantType[];
  legal_id?:                  string;
  logo_uri?:                  string;
  notif_params_json?:         string;
  policy_uri?:                string;
  post_logout_redirect_uris?: string[];
  redirect_uris?:             string[];
  response_types?:            string[];
  sector_identifier_uri?:     string;
  subject_type?:              string;
  suspended?:                 boolean;
  tos_uri?:                   string;
  updated_at?:                Date;
}
