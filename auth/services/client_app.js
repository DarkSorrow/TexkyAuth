/* eslint-disable camelcase */
/* eslint-disable no-param-reassign */
/* eslint-disable max-len */
/**
 * Class that helps manage client applications
 * This class is used in the test as well so we can share the code for test purposes
 */

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

class ClientApplication {
  /**
     * Clean the properties of the client attribute for an update or an insert
     * @param {TimeUUID} id - client id
     * @param {*} payload - properties that were passed
     * @param {Boolean} allow - allow the insertion of client_application_type = 0 which are consent free, DO NOT allow this on http servers, internal use only
     * @return client object parsed
     */
  async formatCassandraApplication(id, payload, allow = false) {
    // begin verification? maybe check how the update would work or the insert
    try {
      //Client type application can only be 0 or 1 if it's inserted with scripts, but the application should never be allowed to insert them
      let client_application_type = 2;
      if (payload.client_application_type !== undefined) {
        if (allow === true) {
          client_application_type = payload.client_application_type;
        } else {
          client_application_type = (payload.client_application_type >= 2) ? payload.client_application_type : 2;
        }
      }
      return ([
        id,//client_id
        payload.client_secret,//client_secret
        false,//suspended
        (payload.software_id) ?  payload.software_id : '',//software_id
        (['web', 'native'].includes(payload.application_type)) ? payload.application_type : 'web',//application_type
        (payload.logo_uri) ? payload.logo_uri : '',//logo_uri
        (['public', 'pairwise'].includes(payload.subject_type)) ? payload.subject_type : 'pairwise',//subject_type
        (payload.client_name) ? payload.client_name : '',//client_name
        (payload.client_uri) ? payload.client_uri : '',//client_uri
        (payload.policy_uri) ? payload.policy_uri : '',//policy_uri
        (payload.tos_uri) ? payload.tos_uri : '',//tos_uri
        new Date(),//updated_at
        (payload.contacts) ? payload.contacts : [],//contacts
        client_application_type,//client_application_type
        (payload.sector_identifier_uri) ? payload.sector_identifier_uri : '',//sector_identifier_uri
        (payload.response_types) ? payload.response_types : ['code'],//response_types
        (payload.redirect_uris) ? payload.redirect_uris : [],//redirect_uris
        (payload.grant_types) ? payload.grant_types : [],//grant_types
        (payload.default_acr) ? payload.default_acr : ['urn:mace:incommon:iap:bronze'],//default_acr
        (payload.post_logout_redirect_uris) ? payload.post_logout_redirect_uris : [],//post_logout_redirect_uris
        (payload.notif_params_json) ? payload.notif_params_json : '',//notif_params_json
      ]);
    } catch (err) {
      throw err;
    }
  }

  /**
   * Parse the client object found https://openid.net/specs/openid-connect-registration-1_0.html#ClientMetadata
   * Note: client_name, tos_uri, policy_uri, logo_uri, and client_uri might have multiple locale-specific
   * @param {*} client
   * @return parsed client value in order to keep the client information correct
  */
  async parseClients(client) {
    Object.keys(client).forEach((keys) => {
      if (client[keys] === '' || client[keys] === null) {
        delete client[keys];
      }
    });
    client.client_id = client.client_id.toString();
    if (client.application_type === 'native') {
      client.token_endpoint_auth_method = 'none';
    }
    delete client.salt;
    return (client);
  }
}

export const clientApplication = new ClientApplication();
