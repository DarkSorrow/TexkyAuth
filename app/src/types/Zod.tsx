import { object, string, number, TypeOf, array, enum as enums, record } from 'zod';

export const SignInSchema = object({
  email: string().email(),
  pwd: string().min(8),
});

export const SignUpSchema = object({
  email: string().email(),
  pwd: string().min(8),
  country: string().optional(),
});

const AddressSchema = object({
  id: string().optional(),
  country: string().min(2, 'Country'),
  postalCode: string(),
  streetAddress: string(),
  additionalAddress: string(),
  region: string(),
  city: string(),
  type: string().optional(),
  name: string().optional(),
});

export const TemplateSchema = object({
  topic:      string(),
  subject:    string(),
  version:    number(),
  schemaBody: object({}).passthrough(),
  format:     string(),
});
/*
  clients: [{
    client_id: 'ABCgWwsfyRQ0XRAE',
    client_secret: 'ABCTTM28ulASJAqoS9PkHVMh73fnx7sX',
    client_name: 'Admin flowpenid',
    logo_uri: 'https://novastera.texky.com/texky-192.png',
    application_type: "native",
    cors_origins: ['http://localhost:4000', 'http://localhost:3000', 'https://app.texky.com'], // no trailing slash authorized
    redirect_uris: ['http://localhost:4000/authentified', 'http://localhost:3000/connect/login', 'https://app.texky.com/connect/login'],
    post_logout_redirect_uris: ['http://localhost:3000/connect/logout', 'https://app.texky.com/connect/logout'],
    grant_types: ["refresh_token", "authorization_code"],
    token_endpoint_auth_method: 'none', // if application_type native -> mettre a none pour avoir juste le client_id
    consent_flow : 0, // 21
    flow_custody : 0,// 22
    flow_account_creation : '', // 23
    flow_contracts : [], // 24
  }],
*/

const APPLICATION_TYPE = ["web", "native"] as const;
export type ApplicationType = typeof APPLICATION_TYPE[number]
const GRANT_TYPES = ["refresh_token", "authorization_code"] as const;
export type GrantType = typeof GRANT_TYPES[number];

export const ApplicationSchema = object({
  client_id:       string().optional(),
  client_secret:   string(),
  client_name:     string(),
  logo_uri:        string(),
  application_type: enums(APPLICATION_TYPE),
  cors_origins: array(string()), // cors_origins: ['http://localhost:4000', 'http://localhost:3000', 'https://app.texky.com'], // no trailing slash authorized
  redirect_uris: array(string()), // ['http://localhost:4000/authentified', 'http://localhost:3000/connect/login'],
  post_logout_redirect_uris: array(string()), // ['http://localhost:3000/connect/logout', 'https://app.texky.com/connect/logout'],
  grant_types: array(enums(GRANT_TYPES)),
  consent_flow: number().min(0).max(4),
  flow_custody: number().min(0).max(3),
  flow_account_creation: string(),
  flow_contracts: record(string(), string()),
});

export type IFormAddress = TypeOf<typeof AddressSchema>;
export type IFormSignup = TypeOf<typeof SignUpSchema>;
export type IFormSignin = TypeOf<typeof SignInSchema>;
export type IFormTemplate = TypeOf<typeof TemplateSchema>;
export type IFormAppliation = TypeOf<typeof ApplicationSchema>;