import * as dotenv from 'dotenv';

dotenv.config();

const constant = {
  isProduction: process.env.NODE_ENV === 'production',
  issuer: process.env.ISSUER || 'http://localhost:8080',
  port: process.env.PORT ? parseInt(process.env.PORT) : 8080,
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