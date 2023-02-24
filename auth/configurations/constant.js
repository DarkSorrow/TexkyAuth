import * as dotenv from 'dotenv';

dotenv.config();
/**
 * Allow us to create a state variable containing the client_id and uid used
 * @param {*} ctx
 */
function createState(ctx) {
  const rawState = {
    uid: null,
    params: null,
  };
  if (ctx.params && ctx.params.uid) {
    rawState.uid = ctx.params.uid.replace('#', '');
  }
  rawState.params = ctx.query;
  return Buffer.from(JSON.stringify(rawState)).toString('base64')
    .replace('+', '-')
    .replace('/', '_')
    .replace(/=+$/, '');
}

const constant = {
  isProduction: process.env.NODE_ENV === 'production',
  issuer: process.env.ISSUER || 'http://localhost:8080',
  port: process.env.PORT ? parseInt(process.env.PORT) : 8080,
  social: {
    facebook: {
      id: (process.env.FACEBOOK_ID) ? process.env.FACEBOOK_ID.trim() : '',
      secret: (process.env.FACEBOOK_SECRET) ? process.env.FACEBOOK_SECRET.trim() : '',
      config: (ctx) => {
        return ({
          scope: [
            'email',
          ],
          session: false,
          state: createState(ctx),
        });
      },
    },
    google: {
      id: (process.env.GOOGLE_ID) ? process.env.GOOGLE_ID.trim() : '',
      secret: (process.env.GOOGLE_SECRET) ? process.env.GOOGLE_SECRET.trim() : '',
      config: (ctx) => ({
        scope: [
          'openid',
          'profile',
          'email',
        ],
        session: false,
        state: createState(ctx), // state: ctx.params.uid,
      }),
    },
    apple: {
      id: {
        client_id: (process.env.APPLE_ID) ? process.env.APPLE_ID.trim() : 'com.texky.flowpenid',
        team_id: (process.env.APPLE_TEAM_ID) ? process.env.APPLE_TEAM_ID.trim() : 'test',
        key_id: (process.env.APPLE_KEY_ID) ? process.env.APPLE_KEY_ID.trim() : 'test',
      },
      config: (ctx) => ({
        scope: [
          'name',
          'email',
        ],
        session: false,
        state: createState(ctx), // state: ctx.params.uid,
      }),
    }
  },
  database: {
    contactPoints: [
      (process.env.CASSANDRA_ENDPOINT_SEED) ? process.env.CASSANDRA_ENDPOINT_SEED.trim() : 'localhost:9042',
    ],
    localDataCenter: (process.env.CASSANDRA_LOCAL_DC) ? process.env.CASSANDRA_LOCAL_DC.trim() : 'datacenter1',
    credentials: {
      username: (process.env.CASSANDRA_USER) ? process.env.CASSANDRA_USER.trim() : 'cassandra',
      password: (process.env.CASSANDRA_PASSWORD) ? process.env.CASSANDRA_PASSWORD.trim() : 'cassandra',
    },
  },
  redis_cluster: {
    port: (process.env.REDIS_PORT) ? parseInt(process.env.REDIS_PORT, 10) : 6379,
    host: (process.env.REDIS_HOST) ? process.env.REDIS_HOST.trim() : 'localhost',
    password: (process.env.REDIS_PASSWORD) ? process.env.REDIS_PASSWORD.trim() : 'eYVX7EwVmmxKPCDmwMtyKVge8oLd2t81',
    db: 0,
  },
  flow: {
    API: (process.env.FLOW_API) ? process.env.FLOW_API.trim() : 'https://rest-testnet.onflow.org',
    DISCOVERY_WALLET: (process.env.FLOW_DISCOVERY_WALLET) ? process.env.FLOW_DISCOVERY_WALLET.trim() : 'https://fcl-discovery.onflow.org/testnet/authn',
    NETWORK: (process.env.FLOW_NETWORK) ? process.env.FLOW_NETWORK.trim() : 'testnet',
  },
  account: {
    flowMain: {
      public: (process.env.FLOW_MAIN_PUBLIC) ? process.env.FLOW_MAIN_PUBLIC.trim() : '',
      private: (process.env.FLOW_MAIN_PRIVATE) ? process.env.FLOW_MAIN_PRIVATE.trim() : '',
      address: (process.env.FLOW_MAIN_ADDRESS) ? process.env.FLOW_MAIN_ADDRESS.trim() : '',
    } 
  }
};

export default constant;