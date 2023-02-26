import { errors } from 'oidc-provider'
import { errorMiddleware } from '../pages/error/index.js';
import { logoutMiddleware, logoutSuccessMiddleware } from '../pages/logout/index.js';
import Account from '../services/account.js';
import loadExistingGrant from './loadExistingGrant.js';
// Should be taken from a Vault
import cookies from './json/cookies.json' assert { type: 'json' };
import claims from './claims.js';

// Scope for ressources could be useful for asking contracts abilities before FAPI
// https://github.com/panva/node-oidc-provider/blob/main/recipes/dynamic_op_scope.md

const isOrigin = (value) => {
  if (typeof value !== 'string') {
    return false;
  }
  try {
    const { origin } = new URL(value);
    // Origin: <scheme> "://" <hostname> [ ":" <port> ]
    return value === origin;
  } catch (err) {
    return false;
  }
}

const configuration = {
  // refer to the documentation for other available configuration
  findAccount: Account.findAccount,
  clients: [{
    client_id: 'ABCgWwsfyRQ0XRAE',
    client_secret: 'ABCTTM28ulASJAqoS9PkHVMh73fnx7sX',
    client_name: 'Admin flowpenid',
    logo_uri: 'https://novastera.texky.com/texky-192.png',
    application_type: "native",
    cors_origins: ['http://localhost:4000', 'http://localhost:3000'], // no trailing slash authorized
    redirect_uris: ['http://localhost:4000/authentified', 'http://localhost:3000/connect/login'],
    post_logout_redirect_uris: ['http://localhost:3000/connect/logout'],
    grant_types: ["refresh_token", "authorization_code"],
    token_endpoint_auth_method: 'none', // if application_type native -> mettre a none pour avoir juste le client_id
    consent_flow : 0, // 21
    flow_custody : 0,// 22
    flow_account_creation : '', // 23
    flow_contracts : [], // 24

    // ... other client properties
  }],
  extraParams: ['tmpl', 'lng'],
  extraClientMetadata: {
    properties: ['client_application_type', 'cors_origins', 'consent_flow',
    'flow_custody', 'flow_account_creation', 'flow_contracts', 'notif_params_json', 'legal_id'],
    validator(ctx, key, value, metadata) {
      if (key === 'cors_origins') {
        // set default (no CORS)
        if (value === undefined) {
          metadata['cors_origins'] = [];
          return;
        }
        // validate an array of Origin strings
        if (!Array.isArray(value) || !value.every(isOrigin)) {
          throw new errors.InvalidClientMetadata(`cors_origin must be an array of origins`);
        }
      }
    },
  },
  clientBasedCORS(ctx, origin, client) {
    // ctx.oidc.route can be used to exclude endpoints from this behaviour, in that case just return
    // true to always allow CORS on them, false to deny
    // you may also allow some known internal origins if you want to
    return client['cors_origins'].includes(origin);
  },
  loadExistingGrant,
  cookies,
  claims,
  features: {
    devInteractions: { enabled: false }, // defaults to true
    backchannelLogout: { enabled: true }, // defaults to false
    deviceFlow: { enabled: true }, // defaults to false
    //jwtIntrospection: { enabled: true, ack: 'draft-09' }, // defaults to false
    //jwtResponseModes: { enabled: true }, // defaults to false
    revocation: { enabled: true }, // defaults to false
    claimsParameter: { enabled: false }, // defaults to false
    encryption: { enabled: true }, // defaults to false
    // introspection: { enabled: true }, // defaults to false
    // disable and use opaque token later or FAPI
    resourceIndicators: {
      // eslint-disable-next-line no-unused-vars
      defaultResource: async (ctx, client, oneOf) => 'https://app.texky.com',
      useGrantedResource: async () => true,
      getResourceServerInfo: (ctx, resourceIndicator, client) => ({
        scope: '',
        audience: client.clientId,
        accessTokenTTL: 7200, // 2 hours
        accessTokenFormat: 'jwt',
      }),
    },
    rpInitiatedLogout: {
      enable: true, // https://github.com/panva/node-oidc-provider/blob/v6.29.5/docs/README.md#featuresrpinitiatedlogout
      async postLogoutSuccessSource(ctx) {
        logoutSuccessMiddleware(ctx);
      },
      async logoutSource(ctx, form) {
        logoutMiddleware(ctx, form);
      },
    },
  },
  async extraTokenClaims(ctx, token) {
    const legalList = [];
    try {
      const subjectGroups = await ctx.cassandra.cql.execute(
        'SELECT subject,legal_id FROM account.subject_groups WHERE subject=?;',
        [ctx.cassandra.driver.types.TimeUuid.fromString(token.accountId)],
        { prepare: true },
      );
      if (subjectGroups.rowLength > 0) {
        for (let i = 0; i < subjectGroups.rows.length; i++) {
          if (subjectGroups.rows[0].legal_id) {
            legalList.push(subjectGroups.rows[0].legal_id.toString());
          }
        }
      }  
    } catch (err) {
      ctx.log.error({ err }, '[extraTokenClaims]');
    }
    return {
      'urn:idp:legals': legalList,
    };
  },
  jwks: {
    keys: [
      {
        d: 'VEZOsY07JTFzGTqv6cC2Y32vsfChind2I_TTuvV225_-0zrSej3XLRg8iE_u0-3GSgiGi4WImmTwmEgLo4Qp3uEcxCYbt4NMJC7fwT2i3dfRZjtZ4yJwFl0SIj8TgfQ8ptwZbFZUlcHGXZIr4nL8GXyQT0CK8wy4COfmymHrrUoyfZA154ql_OsoiupSUCRcKVvZj2JHL2KILsq_sh_l7g2dqAN8D7jYfJ58MkqlknBMa2-zi5I0-1JUOwztVNml_zGrp27UbEU60RqV3GHjoqwI6m01U7K0a8Q_SQAKYGqgepbAYOA-P4_TLl5KC4-WWBZu_rVfwgSENwWNEhw8oQ',
        dp: 'E1Y-SN4bQqX7kP-bNgZ_gEv-pixJ5F_EGocHKfS56jtzRqQdTurrk4jIVpI-ZITA88lWAHxjD-OaoJUh9Jupd_lwD5Si80PyVxOMI2xaGQiF0lbKJfD38Sh8frRpgelZVaK_gm834B6SLfxKdNsP04DsJqGKktODF_fZeaGFPH0',
        dq: 'F90JPxevQYOlAgEH0TUt1-3_hyxY6cfPRU2HQBaahyWrtCWpaOzenKZnvGFZdg-BuLVKjCchq3G_70OLE-XDP_ol0UTJmDTT-WyuJQdEMpt_WFF9yJGoeIu8yohfeLatU-67ukjghJ0s9CBzNE_LrGEV6Cup3FXywpSYZAV3iqc',
        e: 'AQAB',
        kty: 'RSA',
        n: 'xwQ72P9z9OYshiQ-ntDYaPnnfwG6u9JAdLMZ5o0dmjlcyrvwQRdoFIKPnO65Q8mh6F_LDSxjxa2Yzo_wdjhbPZLjfUJXgCzm54cClXzT5twzo7lzoAfaJlkTsoZc2HFWqmcri0BuzmTFLZx2Q7wYBm0pXHmQKF0V-C1O6NWfd4mfBhbM-I1tHYSpAMgarSm22WDMDx-WWI7TEzy2QhaBVaENW9BKaKkJklocAZCxk18WhR0fckIGiWiSM5FcU1PY2jfGsTmX505Ub7P5Dz75Ygqrutd5tFrcqyPAtPTFDk8X1InxkkUwpP3nFU5o50DGhwQolGYKPGtQ-ZtmbOfcWQ',
        p: '5wC6nY6Ev5FqcLPCqn9fC6R9KUuBej6NaAVOKW7GXiOJAq2WrileGKfMc9kIny20zW3uWkRLm-O-3Yzze1zFpxmqvsvCxZ5ERVZ6leiNXSu3tez71ZZwp0O9gys4knjrI-9w46l_vFuRtjL6XEeFfHEZFaNJpz-lcnb3w0okrbM',
        q: '3I1qeEDslZFB8iNfpKAdWtz_Wzm6-jayT_V6aIvhvMj5mnU-Xpj75zLPQSGa9wunMlOoZW9w1wDO1FVuDhwzeOJaTm-Ds0MezeC4U6nVGyyDHb4CUA3ml2tzt4yLrqGYMT7XbADSvuWYADHw79OFjEi4T3s3tJymhaBvy1ulv8M',
        qi: 'wSbXte9PcPtr788e713KHQ4waE26CzoXx-JNOgN0iqJMN6C4_XJEX-cSvCZDf4rh7xpXN6SGLVd5ibIyDJi7bbi5EQ5AXjazPbLBjRthcGXsIuZ3AtQyR0CEWNSdM7EyM5TRdyZQ9kftfz9nI03guW3iKKASETqX2vh0Z8XRjyU',
        use: 'sig',
      }, {
        crv: 'P-256',
        d: 'K9xfPv773dZR22TVUB80xouzdF7qCg5cWjPjkHyv7Ws',
        kty: 'EC',
        use: 'sig',
        x: 'FWZ9rSkLt6Dx9E3pxLybhdM6xgR5obGsj5_pqmnz5J4',
        y: '_n8G69C-A2Xl4xUW2lF0i8ZGZnk_KPYrhv4GbTGu5G4',
      },
    ],
  },
  async renderError (ctx, out, error) {
    errorMiddleware(ctx, out, error);
  },
};

export default configuration;