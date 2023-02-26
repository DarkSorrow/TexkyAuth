// Should be part of another server the api and not stay on the main api server
import { createRemoteJWKSet, jwtVerify } from 'jose';

import constant from '../configurations/constant.js';
const JWKS = createRemoteJWKSet(new URL(`${constant.issuer}/jwks`));



export const verify_token = async (ctx, next) => {
  let jwtToken = null;
  if (ctx.request.header.authorization && ctx.request.header.authorization.startsWith('Bearer ')) {
    jwtToken = ctx.request.header.authorization.substr(7);
  } else if (ctx.request.query.access_token) {
    jwtToken = ctx.request.query.access_token;
  }
  if (jwtToken) {
    try {
      const jwt = await jwtVerify(jwtToken, JWKS);
      if (jwt) {
        ctx.state.subject = ctx.cassandra.driver.types.TimeUuid.fromString(jwt.payload.sub);
        ctx.state.clientId = jwt.payload.client_id;
        // Hackathon purpose
        ctx.state.legal = ctx.cassandra.driver.types.TimeUuid.fromString(jwt.payload['urn:idp:legals'][0]);
        return next();
      }
    } catch (err) {
      ctx.status = 401;
      ctx.body = ctx.errors.getError('001');
    }
  }
  ctx.status = 403;
  ctx.body = ctx.errors.getError('012');
  return ctx.body;
}