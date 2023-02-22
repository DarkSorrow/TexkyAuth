/**
 * This adapter was taken out of the common one to be able to perform
 * different actions on the client
 */
import logger from '../services/logger.js';
import { redisClient } from '../services/redis.js';
import { cql } from '../services/cassandra.js';
import { clientApplication } from '../services/client_app.js';

function grantKeyFor(id) {
    return `oidc:grant:${id}`;
}

function userCodeKeyFor(userCode) {
    return `oidc:userCode:${userCode}`;
}

function uidKeyFor(uid) {
    return `oidc:uid:${uid}`;
}

/**
 * Object holding a client for one minute after it's fetched from the database
 * ClientId { 'time', 'clientData' }
 */
const ttlTest = 30000;//30 seconds
const ttlNotExist = 3*60000;//3 minutes
const ttlLogin = 5*60000;//modify before the * minutes*60000
const MAX_CLIENT_CACHED = 800;
let cacheManager = {
  set: function(obj, prop, value) {
    //Null means the client doesn't exist, and since its randomly generated it can't be a typo
    //the degree of collision being extremely low we can cache wrong data right away
    if (value === null) {
      obj[prop] = {
        ts: new Date().getTime() + ttlNotExist,
        val: -1
      }
    } else {
      obj[prop] = {
        ts: new Date().getTime() + ((value.client_application_type === 3) ? ttlTest : ttlLogin),
        val: value
      }
    }
    obj.lru.push(prop);
    if (obj.lru.length > MAX_CLIENT_CACHED) {
      delete obj[obj.lru.shift()];
    }
    return (true);
  },
  get: function(obj, prop) {
    if ((obj[prop]) && (obj[prop].ts - new Date().getTime() >= 0)) {
      return (obj[prop].val);
    }
    return (null);
  }
}
let proxyCacheClient = new Proxy({lru: []}, cacheManager);

class ClientAdapter {
    constructor(name) {
      this.name = name;
    }

    async upsert(id, payload, expiresIn) {
      logger.trace('[ClientAdapter::upsert]', { id, client: payload });
      try {
        //add other object if they exist
        const client_id = (typeof id === 'string') ? client.cassandraDriver.types.TimeUuid.fromString(id) : id;
        const clientValues = await clientApplication.formatCassandraApplication(client_id, payload);
        await cql.execute(
          'INSERT INTO openid.application (client_id,client_secret,suspended,software_id,application_type,logo_uri,subject_type,client_name,client_uri,policy_uri,tos_uri,updated_at,contacts,client_application_type,sector_identifier_uri,response_types,redirect_uris,grant_types,default_acr,post_logout_redirect_uris,notif_params_json,cors_allowed,consent_flow,flow_custody,flow_account_creation,flow_contracts) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
          clientValues,
          { prepare: true },
        );
      } catch (Err) {
        logger.error(err, '[ClientAdapter::upsert]');
        throw new Error('Could not insert the client');
      }
    }
  
    async find(id) {
      logger.trace('[ClientAdapter::find]', { clientId: id })
      try {
        let client = proxyCacheClient[id];
        if (client === null) {
          const application = await cql.execute(
            'SELECT client_id,client_secret,suspended,software_id,application_type,logo_uri,subject_type,client_name,client_uri,policy_uri,tos_uri,updated_at,contacts,client_application_type,sector_identifier_uri,response_types,redirect_uris,grant_types,default_acr,post_logout_redirect_uris,notif_params_json,cors_allowed,consent_flow,flow_custody,flow_account_creation,flow_contracts FROM openid.application WHERE client_id = ?;',
            [id],
            { prepare: true },
          );
          if ((application.rowLength === 1) && (application.rows[0].suspended !== true)) {
            client = await clientApplication.parseClients(application.rows[0]);
            proxyCacheClient[id] = client;
          } else {
            proxyCacheClient[id] = null;
          }
        }
        if (client === -1) {
          logger.warn('[ClientAdapter::find] client not found or suspended', { clientId: id });
          return (null);
        }
        logger.debug({ client }, '[ClientAdapter::find]')
        return (client);
      } catch (err) {
        logger.error(err, '[ClientAdapter::find]', { clientId: id })
        return (null);
      }
    }
  
  
    async findByUid(uid) {
      logger.trace('[ClientAdapter::findByUid]', uid);
      const id = await redisClient.get(uidKeyFor(uid));
      return this.find(id);
    }
  
    async findByUserCode(userCode) {
      logger.trace('[ClientAdapter::findByUserCode]', userCode);
      const id = await redisClient.get(userCodeKeyFor(userCode));
      return this.find(id);
    }
  
    async destroy(id) {
      logger.trace('[ClientAdapter::destroy]', id);
      const key = this.key(id);
      await redisClient.del(key);
    }
  
    async revokeByGrantId(grantId) { // eslint-disable-line class-methods-use-this
      logger.trace('[ClientAdapter::revokeByGrantId] grantId', grantId);
      const tokens = await redisClient.lrange(grantKeyFor(grantId), 0, -1);
      tokens.forEach(async (token) => await redisClient.del(token));
      await redisClient.del(grantKeyFor(grantId));
    }
  
    async consume(id) {
      logger.trace('[ClientAdapter::consume]', id);
      await redisClient.hset(this.key(id), 'consumed', Math.floor(Date.now() / 1000));
    }
  
    key(id) {
      return `oidc:${this.name}:${id}`;
    }
  }
  
  export default ClientAdapter;
