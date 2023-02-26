import Account from '../services/account.js';

function containDetails(dbDetails, prompted) {
  if (!dbDetails) {
    return (false);
  }
  for (const scope of prompted.scopes) {
    if (!dbDetails.promptedScopes.includes(scope)) {
      return (false);
    }
  }
  for (const claim of prompted.claims) {
    if (!dbDetails.promptedClaims.includes(claim)) {
      return (false);
    }
  }
  return (true);
  /*return ((dbDetails) && (dbDetails.promptedScopes.join(' ') === prompted.scopes.join(' '))
  && (dbDetails.promptedClaims.join(' ') === prompted.claims.join(' ')));*/
}

export default async (ctx) => {
  const grantId = (ctx.oidc.result
    && ctx.oidc.result.consent
    && ctx.oidc.result.consent.grantId) || ctx.oidc.session.grantIdFor(ctx.oidc.client.clientId);
  if (grantId) {
    return ctx.oidc.provider.Grant.find(grantId);
  }
  const prompted = {
    scopes: [...ctx.oidc.requestParamScopes],
    claims: [...ctx.oidc.requestParamClaims],
  };
  const consentDetails = {
    prevConsent: null,
    changeConsentEntity: null,
    legalEntityId: ctx.oidc.client.legal_id,
  };
  
  consentDetails.prevConsent = await Account.findConsent(
    ctx, ctx.oidc.session.accountId,
    ctx.oidc.client.clientId,
  );
  if (ctx.oidc.client.application_category_id === 0) {
    const grant = new ctx.oidc.provider.Grant({
      clientId: ctx.oidc.client.clientId,
      accountId: ctx.oidc.session.accountId,
    });
    if (!containDetails(consentDetails.prevConsent?.details, prompted)) {
      await Account.CreateOrUpdateConsent(ctx, consentDetails, {
        subject: ctx.oidc.session.accountId,
        client_id: ctx.oidc.client.clientId,
        consent: true,
        details: {
          rejectedScopes: [],
          rejectedClaims: [],
          promptedScopes: prompted.scopes,
          promptedClaims: prompted.claims,
        },
      });
    }
    grant.addOIDCScope(prompted.scopes.join(' '));
    grant.addOIDCClaims(prompted.claims);
    await grant.save();
    return grant;
  }
  // No grant for this client_id we will check if its a legal or normal grant type
  const isGlobal = (ctx.oidc.entities.Client.application_category_id === 1)
      && (ctx.oidc.entities.Client.global_consent === true);
  if (consentDetails.prevConsent !== null) {
    // a consent already existed in the past
    if (consentDetails.prevConsent.consent === true) {
      const grant = new ctx.oidc.provider.Grant({
        clientId: ctx.oidc.client.clientId,
        accountId: ctx.oidc.session.accountId,
      });
      grant.addOIDCScope(consentDetails.prevConsent.details.promptedScopes.join(' '));
      grant.addOIDCClaims(consentDetails.prevConsent.details.promptedClaims);
      await grant.save();
      return grant;
    }
  } else if (isGlobal) {
    // We check in the global table because we are using a same consent for all this legal entity
    consentDetails.changeConsentEntity = 0;// will create the legal_entity consent
    const dbGlobalConsent = await Account.findConsentByEntity(
      ctx, ctx.oidc.session.accountId,
      ctx.oidc.entities.Client.legal_entity_id,
    );
    if (dbGlobalConsent !== null) {
      consentDetails.changeConsentEntity = 1;
      await Account.CreateOrUpdateConsent(ctx, { prevConsent: null }, {
        subject: ctx.oidc.session.accountId,
        client_id: ctx.oidc.client.clientId,
        consent: dbGlobalConsent.consent,
        details: dbGlobalConsent.details,
      });
      const grant = new ctx.oidc.provider.Grant({
        clientId: ctx.oidc.client.clientId,
        accountId: ctx.oidc.session.accountId,
      });
      grant.addOIDCScope(dbGlobalConsent.details.promptedScopes.join(' '));
      grant.addOIDCClaims(dbGlobalConsent.details.promptedClaims);
      await grant.save();
      return grant;
    }
  }
  // this bypass the first code clearing grant in the confirm page
  // get information from prompt_operation
  return undefined;
}
