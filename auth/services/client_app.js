/* eslint-disable camelcase */
/* eslint-disable no-param-reassign */
/* eslint-disable max-len */
/**
 * Class that helps manage client applications
 * This class is used in the test as well so we can share the code for test purposes
 */
import { cql, driver } from './cassandra.js';
import { logger } from './logger.js';

export const AccountCustodyEnum = {
  USER_CUSTODY: 0, // the user own the account
  APP_CUSTODY: 1, // the application own the account
  HYBRID_CUSTODY: 2, // both own the account
}

export const AccountChoiceCustodyEnum = {
  USER_CHOICE: 0, // use can choose to create or use his own account
  APP_ONLY: 1, // only the application can own the account
  USER_ONLY: 2, // only the user can own the account
  HYBRID_ONLY: 3, // both app and user must own the account
}

/**
 * Clean the properties of the client attribute for an update or an insert
 * @param {TimeUUID} id - client id
 * @param {*} payload - properties that were passed
 * @param {Boolean} allow - allow the insertion of client_application_type = 0 which are consent free, DO NOT allow this on http servers, internal use only
 * @return client object parsed
 */
const formatCassandraApplication = (id, payload, allow = false) => {
  let client_application_type = 2;
  if (payload.client_application_type !== undefined) {
    if (allow === true) {
      client_application_type = payload.client_application_type;
    } else {
      client_application_type = (payload.client_application_type >= 2) ? payload.client_application_type : 2;
    }
  }
  const legal_id = (payload.legal_id) ? payload.legal_id : null;
  if (legal_id === null) {
    throw new Error('No legal entity for the application')
  }
  let consent_flow = parseInt(payload.consent_flow, 10);
  let flow_custody = parseInt(payload.flow_custody, 10);
  if (isNaN(consent_flow)) {
    consent_flow = 0;
  }
  if (isNaN(flow_custody)) {
    flow_custody = 0;
  }
  return ([
    id,//client_id 0
    payload.client_secret,//client_secret 1
    false,//suspended 2
    (['web', 'native'].includes(payload.application_type)) ? payload.application_type : 'web',//application_type 3
    (payload.logo_uri) ? payload.logo_uri : '',//logo_uri 4
    (['public', 'pairwise'].includes(payload.subject_type)) ? payload.subject_type : 'pairwise',//subject_type 5
    (payload.client_name) ? payload.client_name : '',//client_name 6
    (payload.client_uri) ? payload.client_uri : '',//client_uri 7
    (payload.policy_uri) ? payload.policy_uri : '',//policy_uri 8
    (payload.tos_uri) ? payload.tos_uri : '',//tos_uri 9
    new Date(),//updated_at 10
    (payload.contacts) ? payload.contacts : [],//contacts 11
    client_application_type,//client_application_type 12
    (payload.sector_identifier_uri) ? payload.sector_identifier_uri : '',//sector_identifier_uri 13
    (payload.response_types) ? payload.response_types : ['code'],//response_types 14
    (payload.redirect_uris) ? payload.redirect_uris : [],//redirect_uris 15
    (payload.grant_types) ? payload.grant_types : [],//grant_types 16
    (payload.default_acr) ? payload.default_acr : ['urn:mace:incommon:iap:bronze'],//default_acr 17
    (payload.post_logout_redirect_uris) ? payload.post_logout_redirect_uris : [],//post_logout_redirect_uris 18
    (payload.notif_params_json) ? payload.notif_params_json : '',//notif_params_json 19
    (payload.cors_allowed) ? payload.cors_allowed : [], // 20
    consent_flow, // 21
    flow_custody,// 22
    (payload.flow_account_creation) ? payload.flow_account_creation : '', // 23
    (payload.flow_contracts) ? payload.flow_contracts : [], // 24
    legal_id,//legal entity 25
  ]);
}

/**
 * Parse the client object found https://openid.net/specs/openid-connect-registration-1_0.html#ClientMetadata
 * Note: client_name, tos_uri, policy_uri, logo_uri, and client_uri might have multiple locale-specific
 * @param {*} client
 * @return parsed client value in order to keep the client information correct
*/
const parseClients = (client) => {
  Object.keys(client).forEach((keys) => {
    if (client[keys] === '' || client[keys] === null) {
      delete client[keys];
    }
  });
  client.client_id = client.client_id.toString();
  if (client.application_type === 'native') {
    client.token_endpoint_auth_method = 'none';
  }
  return (client);
}
class ClientApplication {
  /**
   * Clean the properties of the client attribute for an update or an insert
   * @param {TimeUUID} id - client id
   * @param {*} payload - properties that were passed
   * @param {Boolean} allow - allow the insertion of client_application_type = 0 which are consent free, DO NOT allow this on http servers, internal use only
   * @return client object parsed
   */
  async upsertClient(id, payload, allow = false) {
    const client_id = id;
    payload.legal_id = (typeof payload.legal_id === 'string') ? driver.types.TimeUuid.fromString(payload.legal_id) : payload.legal_id;
    const clientValues = formatCassandraApplication(client_id, payload);
    const legalApplication = [
      clientValues[25],
      clientValues[0],
      clientValues[2],
      clientValues[3],
      clientValues[4],
      clientValues[6],
      clientValues[12],
      clientValues[21],
      clientValues[22],
      clientValues[23],
      clientValues[10]
    ]
    const res = await Promise.all([
      cql.execute(
        'INSERT INTO account.application (client_id,client_secret,suspended,application_type,logo_uri,subject_type,client_name,client_uri,policy_uri,tos_uri,updated_at,contacts,client_application_type,sector_identifier_uri,response_types,redirect_uris,grant_types,default_acr,post_logout_redirect_uris,notif_params_json,cors_allowed,consent_flow,flow_custody,flow_account_creation,flow_contracts,legal_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
        clientValues,
        { prepare: true },
      ),
      cql.execute(
        'INSERT INTO account.legal_application (legal_id,client_id,suspended,application_type,logo_uri,client_name,client_application_type,consent_flow,flow_custody,flow_account_creation,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
        legalApplication,
        { prepare: true },
      )
    ]);
    return (res);
  }

  /**
   * Return the legal_id of the current client
   * @param {*} id 
   * @returns 
   */
  async checkClient(id) {
    const application = await cql.execute(
      'SELECT client_id,legal_id FROM account.application WHERE client_id = ?;',
      [id],
      { prepare: true },
    );
    if (application.rowLength === 1) {
      return application.rows[0].legal_id;
    }
    return null;
  }
  // test@flowpenid.com
  // testtest1234
  async getClient(id) {
    const application = await cql.execute(
      'SELECT client_id,client_secret,suspended,software_id,application_type,logo_uri,subject_type,client_name,client_uri,policy_uri,tos_uri,updated_at,contacts,client_application_type,sector_identifier_uri,response_types,redirect_uris,grant_types,default_acr,post_logout_redirect_uris,notif_params_json,cors_allowed,consent_flow,flow_custody,flow_account_creation,flow_contracts,legal_id FROM account.application WHERE client_id = ?;',
      [id],
      { prepare: true },
    );
    if ((application.rowLength === 1) && (application.rows[0].suspended !== true)) {
      client = parseClients(application.rows[0]);
      return client;
    }
    return null;
  }
  async deleteClient(id) {
    await cql.execute(
      'DELETE FROM account.application WHERE client_id = ?;',
      [id], { prepare: true },
    );
    return null;
  }

  async getClients(pagination) {

  }
}

export const clientApplication = new ClientApplication();
