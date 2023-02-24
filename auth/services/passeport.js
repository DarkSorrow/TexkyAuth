/* eslint-disable max-len */
/* eslint-disable no-else-return */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import passport from 'koa-passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as AppleStrategy } from '@nicokaiser/passport-apple';

import constant from '../configurations/constant.js';
import Account from './account.js';
import { logger } from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/**
 * Check if the email is valid
 * @param {string} email - Email to check
 * @return boolean - true or false if the email is valid or not
 */
function verifyEmail(email) {
  if (!email) {
    return (false);
  }
  const structureEmail = email.split('@');
  let error = false;
  if (structureEmail.length !== 2) {
    error = true;
  }
  if (structureEmail[1].indexOf(' ') !== -1) {
    error = true;
  }
  const domainEmail = structureEmail[1].split('.');
  if ((domainEmail.length < 2)
            || (domainEmail[0].length === 0)
            || (domainEmail[1].length === 0)
            || (structureEmail[0].length === 0)) {
    error = true;
  }
  return (error);
}

/**
 * Strategy that allows you to register or log a user coming from the login/register page of ByMe
 */
passport.use('facebook', new FacebookStrategy({
  graphAPIVersion: 'v9.0',
  clientID: constant.social.facebook.id,
  clientSecret: constant.social.facebook.secret,
  callbackURL: `${constant.issuer}/social/callback/facebook/flowpenid`,
  profileFields: ['id', 'name', 'displayName', 'photos', 'email'],
}, async (accessToken, refreshToken, profile, done) => {
  // Based on profile return from facebook, find existing user
  // logger.debug({ accessToken, refreshToken }, '[FaceBookStrategy]');
  // logger.debug({ profile }, '[FaceBookStrategy]');
  if (!profile.emails) {
    return done('009', false);
  }
  // verify email
  try {
    // If answer don't provide an email we don't allow the request
    // Check if the profile.id and the the clientId already exist in our database,
    // with the email in the login database
    let loginSocial = await Account.findSocialLoginById(profile.id, constant.social.facebook.id);
    // logger.trace({ loginSocial }, '[FaceBookStrategy]');
    if (loginSocial) { // If the login exist
      if (loginSocial.suspended === true) {
        return done('010', false);
      }
      return done(null, {
        subject: loginSocial.subject,
        mfa_type: loginSocial.mfa_type,
        profile_location: loginSocial.profile_location,
        profile_update: loginSocial.profile_update,
      });
    }
    if (verifyEmail(profile.emails[0].value)) { // true if error
      return done('010', false);
    }
    // If the login does not exist
    // We check if the email exist in the database
    loginSocial = await Account.findOrCreateSocialLogin(
      profile.id,
      constant.social.facebook.id,
      profile.emails[0].value,
      profile,
      'facebook',
    );
    // logger.trace({ loginSocial }, '[FaceBookStrategy] after find or create');
    if (loginSocial.suspended === true) {
      return done(loginSocial.code, false);
    }
    return done(null, {
      subject: loginSocial.subject,
      mfa_type: loginSocial.mfa_type,
      profile_location: loginSocial.profile_location,
      profile_update: loginSocial.profile_update,
    });
  } catch (err) {
    logger.error({ err }, '[FaceBookStrategy]');
    return done(err, false);
  }
}));

passport.use('google', new GoogleStrategy({
  clientID: constant.social.google.id,
  clientSecret: constant.social.google.secret,
  callbackURL: `${constant.issuer}/social/callback/google/flowpenid`,
  profileFields: ['name', 'profile', 'picture', 'email'],
}, async (accessToken, refreshToken, profile, done) => {
  // logger.debug({ accessToken, refreshToken, profile }, '[GoogleStrategy]');
  if (!profile.emails) {
    return done('010', false);
  }
  try {
    let loginSocial = await Account.findSocialLoginById(profile.id, constant.social.google.id);
    if (loginSocial) { // If the login exist
      if (loginSocial.suspended === true) {
        return done('001', false);
      }
      return done(null, {
        subject: loginSocial.subject,
        mfa_type: loginSocial.mfa_type,
        profile_location: loginSocial.profile_location,
        profile_update: loginSocial.profile_update,
      });
    }
    if (verifyEmail(profile.emails[0].value)) { // true if error
      return done('010', false);
    }
    // If the login does not exist
    // We check if the email exist in the database
    loginSocial = await Account.findOrCreateSocialLogin(
      profile.id,
      constant.social.google.id,
      profile.emails[0].value,
      profile,
      'google',
    );
    // logger.trace({ loginSocial }, '[GoogleStrategy] after find or create');
    if (loginSocial.suspended === true) {
      return done('001', false);
    }
    return done(null, {
      subject: loginSocial.subject,
      mfa_type: loginSocial.mfa_type,
      profile_location: loginSocial.profile_location,
      profile_update: loginSocial.profile_update,
    });
  } catch (err) {
    logger.error({ err }, '[GoogleStrategy]');
    return done(err, false);
  }
}));

const appleKey = fs.readFileSync(path.join(__dirname, `../configurations/AuthKey_${constant.social.apple.id.key_id}.p8`));
passport.use('apple', new AppleStrategy({
  clientID: constant.social.apple.id.client_id,
  teamID: constant.social.apple.id.team_id,
  callbackURL: `${constant.issuer}/social/callback/apple/flowpenid`,
  keyID: constant.social.apple.id.key_id,
  key: appleKey,
  passReqToCallback: true,
}, async (req, accessToken, refreshToken, profile, done) => {
  try {
    // If answer don't provide an email we don't allow the request
    // Check if the profile.id and the the clientId already exist in our database,
    // with the email in the login database
    let loginSocial = await Account.findSocialLoginById(profile.id, constant.social.apple.id.client_id);
    if (loginSocial) { // If the login exist
      if (loginSocial.suspended === true) {
        const oldEmail = (profile.email) ? profile.email : loginSocial.provider_raw_data.email;
        if (oldEmail) {
          return done('010', false);
        } else {
          return done('010', false);
        }
      } else if (loginSocial.login.suspended === true) {
        return done('001', false);
      }
      return done(null, {
        subject: loginSocial.subject,
        mfa_type: loginSocial.mfa_type,
        profile_location: loginSocial.profile_location,
        profile_update: loginSocial.profile_update,
      });
    }
    if (!profile.email) {
      return done('010', false);
    }
    if (verifyEmail(profile.email)) { // true if error
      return done('010', false);
    }
    // If the login does not exist
    // We check if the email exist in the database
    loginSocial = await Account.findOrCreateSocialLogin(
      profile.id,
      constant.social.apple.id.client_id,
      profile.email,
      profile,
      'apple',
    );
    if (loginSocial.suspended === true) {
      return done('001', false);
    } else if (loginSocial.login.suspended === true) {
      return done('001', false);
    }
    return done(null, {
      subject: loginSocial.subject,
      mfa_type: loginSocial.mfa_type,
      profile_location: loginSocial.profile_location,
      profile_update: loginSocial.profile_update,
    });
  } catch (err) {
    logger.error({ err }, '[AppleStrategy]');
    return done(err, false);
  }
}));

/**
 * Strategy that check if the provider_id user exist and if not link it to the correct subject id but if not will return an error
 * Thos strategies use a different call back to perform different test and redirect to the application page
 */

passport.serializeUser((user, done) => {
  logger.debug(user, '[passport:serializeUser]');
  done(null, user);
});

passport.deserializeUser((user, done) => {
  logger.debug(user, '[passport:deserializeUser]');
  done(null, user);
});

export default passport;
