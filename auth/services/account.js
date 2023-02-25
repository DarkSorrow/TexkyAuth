import { nanoid } from 'nanoid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { passwordManager } from '../configurations/password.js';
import { cql, driver } from './cassandra.js';
import listClaims from '../configurations/claims.js';
import { logger } from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Added validators here because of circular dependency for configuration
const validatorIso = JSON.parse(fs.readFileSync(path.join(__dirname, '../configurations/json/iso_validator.json')));

const LOGIN_RATE_LIMIT = 8;
/**
 * Check if the country is given, modify the database that will be used in that case
 * @param {string} country - Optional
 * @return string
 */
function lookupProfileRegion(country) {
  return (0)
}

const userDefinition = {
  list: {
    phone: 'phone',
    name: 'str', // End-User's full name in displayable form including all name parts, possibly including titles and suffixes, ordered according to the End-User's locale and preferences.
    given_name: 'str',
    family_name: 'str',
    middle_name: 'str',
    nickname: 'str',
    preferred_username: 'str',
    profile: 'str',
    picture: 'url', // this is a url
    website: 'url',
    gender: 'gender', // The End-User's gender: Values defined by this specification are female and male. Other values MAY be used when neither of the defined values are applicable.
    birthdate: 'date:type', // The End-User's birthday, represented as an ISO 8601:2004 [ISO8601‑2004] YYYY-MM-DD format. The year MAY be 9999, indicating that it is omitted. To represent only the year, YYYY format is allowed. Note that depending on the underlying platform's date related function, providing just year may result in varying month and day, so the implementers should take this factor into account to correctly process the dates.
    zoneinfo: 'timezone', // IANA time zone definition? String from zoneinfo [zoneinfo] time zone database. For example, Europe/Paris or America/Los_Angeles. console.log(Intl.DateTimeFormat().resolvedOptions().timeZone)
    locale: 'iso-639-1', // [iso-639-1] language code, optional a dash with a country code in uppercase
    country: 'iso-3166-1',// Country telling us which privacy law this user is suppose to depend on. It's linked to profile_location from login table
  },

};
userDefinition.keys = Object.keys(userDefinition.list);
const addressDefinition = {
  list: {
    country: 'iso-3166-1',
    formatted: 'str',
    locality: 'str',
    postal_code: 'country:postcode', // need to have the country set
    region: 'str',
    street_address: 'str',
    address_type: 'int',
  },
};
addressDefinition.keys = Object.keys(addressDefinition.list);

const isValideBirthday = new RegExp(/^\d{4}-[01]\d-[0-3]\d$/);
function isValidTimeZone(tz) {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch (ex) {
    return false;
  }
}

/**
 * Parsed user object for basic information or addresses
 * @typedef UserInfo
 * @type {object}
 * @property {boolean} canAdd - false by default, if a value can be added will be true
 * @property {object} info - list of sql field and their respective values
 * @property {Array} parseError - list of sql field that were found but not included
 */
/**
 * We loop in the definition list and create a clean object to insert in the database
 * @param {object} definition - containing a list of value with 'list' and the keys of this list in 'keys'
 * @param {object} parsingBody - body with the user values that will be parsed
 * @return {UserInfo}
 */
function verifyValue(definition, parsingBody) {
  const userObject = {
    canAdd: false,
    info: {},
    parseError: [],
  };
  for (let i = definition.keys.length - 1; i >= 0; i--) {
    if (parsingBody[definition.keys[i]]) {
      let parsedValue = null;
      let parsedError = '';
      switch (definition.list[definition.keys[i]]) {
        case 'str':
          parsedValue = ((typeof parsingBody[definition.keys[i]] === 'string') ? parsingBody[definition.keys[i]] : null);
          break;
        case 'int':
          parsedValue = (Number.isInteger(parsingBody[definition.keys[i]]) ? parsingBody[definition.keys[i]] : null);
          break;
        case 'phone':
          parsedValue = ((typeof parsingBody[definition.keys[i]] === 'string') ? parsingBody[definition.keys[i]] : null);
          break;
        case 'url':
          parsedValue = ((typeof parsingBody[definition.keys[i]] === 'string') ? parsingBody[definition.keys[i]] : null);
          break;
        case 'gender':
          parsedValue = ((typeof parsingBody[definition.keys[i]] === 'string') ? parsingBody[definition.keys[i]] : null);
          break;
        case 'date:type':// birthday
          if (isValideBirthday.test(parsingBody[definition.keys[i]])) {
            parsedValue = parsingBody[definition.keys[i]];
            // maybe get the actual day for the birthday
            // insert a char for the birthday type (a: all, y: year only, m: month only, d: day of month)
          } else {
            parsedError = 'Wrong birthday format';
          }
          parsedValue = ((typeof parsingBody[definition.keys[i]] === 'string') ? parsingBody[definition.keys[i]] : null);
          // we check if the type is given and format it accordingly
          // add the birthdaytype directly here if we find it
          break;
        case 'timezone':
          // config.validatorIso.zoneinfos[parsingBody[definition.keys[i]]] !== undefined
          if (isValidTimeZone(parsingBody[definition.keys[i]]) === true) {
            parsedValue = parsingBody[definition.keys[i]];
          } else {
            parsedError = 'TimeZone not recognised';
          }
          break;
        case 'iso-639-1':// language
          parsedValue = parsingBody[definition.keys[i]].toLowerCase();
          if (validatorIso.languages[parsedValue] === undefined) {
            parsedError = 'Language not recognised';
            parsedValue = null;
          }
          break;
        case 'iso-3166-1':// country
          parsedValue = parsingBody[definition.keys[i]].toUpperCase();
          if (validatorIso.countries[parsedValue] === undefined) {
            parsedError = 'Country not recognised';
            parsedValue = null;
          }
          break;
        case 'country:postcode': // postcode
          parsedValue = ((typeof parsingBody[definition.keys[i]] === 'string') ? parsingBody[definition.keys[i]] : null);
          break;
        case 'bool':
          parsedValue = ((typeof parsingBody[definition.keys[i]] === 'boolean') ? parsingBody[definition.keys[i]] : null);
          break;
        default:
          parsedValue = null;
      }
      if (parsedValue !== null) {
        userObject.canAdd = true;
        userObject.info[definition.keys[i]] = parsedValue;
      } else {
        userObject.parseError.push(`${definition.keys[i]}: ${parsedError}`);
      }
    }
  }
  return (userObject);
}

/**
 * Profile data coming from facebook
 * @param {Object} profileRawData
 * @return user object with the attribute name used in byme user object
 */
function facebookConvertUser(profileRawData) {
  const userInfo = {};
  if (profileRawData.name) {
    if (profileRawData.name.givenName) {
      userInfo.given_name = profileRawData.name.givenName;
      userInfo.name = profileRawData.name.givenName;
    }
    if (profileRawData.name.middleName) {
      userInfo.middle_name = profileRawData.name.middleName;
      userInfo.name += ((userInfo.name) ? ` ${profileRawData.name.middleName}` : profileRawData.name.middleName);
    }
    if (profileRawData.name.familyName) {
      userInfo.family_name = profileRawData.name.familyName;
      userInfo.name += ((userInfo.name) ? ` ${profileRawData.name.familyName}` : profileRawData.name.familyName);
    }
  }
  if (profileRawData.photos && profileRawData.photos.length > 0) {
    // "https://platform-lookaside.fbsbx.com/platform/profilepic/?asid=10156344529438803&height=50&width=50&ext=1563974675&hash=AeSBlHozbbFRk63w"
    // convert the heigh and width?
    userInfo.picture = profileRawData.photos[0].value;
  }
  if (Object.keys(userInfo).length > 0) {
    return (userInfo);
  }
  return (null);
}

/**
 * Convert a profile returned by a social provider to the byme identity provider format
 * @param {string} strategyName - Name of the social provider
 * @param {Object} profileRawData - Object containing the social provider returned informations
 * @return parsed user info for byme identity provider
 */
function verifySocialValue(strategyName, profileRawData) {
  let userParsed = null;
  if (strategyName === 'facebook') {
    userParsed = facebookConvertUser(profileRawData);
  }
  if (userParsed) {
    const userInfo = verifyValue(userDefinition, userParsed);
    if (userInfo.canAdd === true) {
      return (userInfo.info);
    }
  }
  return (null);
}

const store = new Map();
const logins = new Map();

class Account {
  constructor(id, profile) {
    this.accountId = id || nanoid();
    this.profile = profile;
    store.set(this.accountId, this);
  }
  /**
   * Return the login_social of the specified user if it exist
   * @param {string} userId - id given by the identity provider of the specified service (facebook, google...)
   * @param {string} providerId - client_id given by the identity provider of the specified service
   */
  static async findSocialLoginById(userId, providerId) {
    try {
      const loginSocial = await cql.execute(
        'SELECT email, suspended FROM account.login_social WHERE provider_subject = ? AND provider_client_id = ?',
        [userId, providerId],
        { prepare: true },
      );
      if (loginSocial.rowLength === 1) {
        if (loginSocial.rows[0].suspended !== false) {
          return ({ 
            suspended: true,
            code: '015',
          });
        }
        const login = await cql.execute(
          'SELECT subject, suspended, mfa_type, profile_location, profile_update FROM account.login_email WHERE email = ?',
          [loginSocial.rows[0].email],
          { prepare: true },
        );
        if (login.rowLength === 1) {
          if (login.rows[0].suspended !== false) {
            return ({ 
              suspended: true,
              code: '013',
            });
          }
          return ({
            email: loginSocial.rows[0].email,
            subject: login.rows[0].subject.toString(),
            suspended: false,
            mfa_type: login.rows[0].mfa_type,
            profile_location: login.rows[0].profile_location,
            profile_update: login.rows[0].profile_update,
          });
        }
      }
      return (null);
    } catch (err) {
      throw (err);
    }
  }

  /**
   * Find or create a login in our database according to the object received from the social network.
   * A function will parse the profileRawData according to the strategyName to make it fit our database
   * requirements.
   * @param {String} userId - userId given by the social network
   * @param {String} providerId - social network id we use
   * @param {String} email - email of the user
   * @param {Object} profileRawData - profile data sent by the social network
   * @param {String} strategyName - Name of the social network
   */
  static async findOrCreateSocialLogin(userId, providerId, email, profileRawData, strategyName) {
    const lowerEmail = email.toLowerCase();
    const currentDate = new Date();

    // Check with provider id and then email in case it changes later
    const login = await cql.execute(
      'SELECT subject, suspended, mfa_type, profile_location, profile_update FROM account.login_email WHERE email = ?',
      [lowerEmail],
      { prepare: true },
    );
    if (login.rowLength === 0) { // No user was found with this email so it's a new user
      try {
        const subject = driver.types.TimeUuid.now();
        const entity = driver.types.TimeUuid.now();
        // If the user doesn't exist and the email doesn't exist too we create a new
        // account and allow the login
        const algUsed = 0; // default password encryption used
        const pwdObject = await passwordManager.encrypt(nanoid(20), algUsed); // need to be encrypted
        const profileLocation = lookupProfileRegion();

        const batchQuery = [{
          query: 'INSERT INTO account.login_email (email,subject,email_verified,mfa_type,profile_location,profile_update,suspended,updated_at,enc_type,salt,password) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
          params: [
            lowerEmail, //email
            subject, //subject
            false, //email_verified
            false,//mfa_type
            profileLocation, //profile_location
            currentDate,//profile_update
            false,//suspended
            currentDate,//updated_at
            algUsed,//enc_type
            pwdObject.salt,//salt
            pwdObject.password,//password
          ]
        },{
          query: 'INSERT INTO account.legal_entity (id,creator) VALUES (?,?)',
          params: [
            entity, //subject
            subject, //email
          ]
        },{
          query: 'INSERT INTO account.subject_groups (subject,legal_id) VALUES (?,?)',
          params: [
            subject, //email
            entity, //subject
          ]
        }, {
          query: 'INSERT INTO account.login_social (provider_subject,provider_client_id,provider_name,email,suspended,provider_data_json,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)',
          params: [
            userId,//provider_subject text,
            providerId,//provider_client_id text,
            strategyName,//provider_name text,
            lowerEmail,//email text,
            false,//suspended boolean,
            JSON.stringify(profileRawData),//provider_data_json text,
            currentDate,//created_at timestamp,
            currentDate,//updated_at timestamp,
          ]
        }];

        /*const userInfo = verifySocialValue(strategyName, profileRawData);
        if (userInfo !== null) {
          batchQuery.push({
            query: 'INSERT INTO userdata.user_informations (subject,email,email_verified,updated_at,created_at,phone,phone_verified,name,given_name,family_name,middle_name,nickname,preferred_username,profile,picture,website,gender,birthdate,birthday_type,zoneinfo,locale) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
            params: [
              subject,//subject timeuuid,
              lowerEmail,
              false,
              currentDate,//updated_at timestamp,
              currentDate,//created_at timestamp,
              (userInfo.phone) ? userInfo.phone : '',//phone text,
              (userInfo.phone_verified) ? userInfo.phone_verified : false,//phone_verified boolean,
              (userInfo.name) ? userInfo.name : '',//name text,
              (userInfo.given_name) ? userInfo.given_name : '',//given_name text,
              (userInfo.family_name) ? userInfo.family_name : '',//family_name text,
              (userInfo.middle_name) ? userInfo.middle_name : '',//middle_name text,
              (userInfo.nickname) ? userInfo.nickname : '',//nickname text,
              (userInfo.preferred_username) ? userInfo.preferred_username : '',//preferred_username text,
              (userInfo.profile) ? userInfo.profile : '',//profile text,
              (userInfo.picture) ? userInfo.picture : '',//picture text,
              (userInfo.website) ? userInfo.website : '',//website text,
              (userInfo.gender) ? userInfo.gender : '',//gender text,
              (userInfo.birthdate) ? userInfo.birthdate : '',//birthdate text,
              (userInfo.birthday_type) ? userInfo.birthday_type : 0,//birthday_type tinyint,
              (userInfo.zoneinfo) ? userInfo.zoneinfo : '',//zoneinfo text,
              (userInfo.locale) ? userInfo.locale : '',//locale text,
            ]
          })
        }*/
        await cql.batch(batchQuery, { prepare: true });
        return ({
          subject: subject.toString(),
          email: lowerEmail,
          suspended: false,
          mfa_type: false,
          profile_location: profileLocation,
          profile_update: currentDate,
        });
      } catch (err) {
        throw (err);
      }
    } else if (login.rows[0].suspended) {
      // If account is suspended, he can't create a social account
      logger.warn({ byme_sub: login.rows[0].subject }, 'Suspended account trying to create social account');
      return ({
        suspended: login.rows[0].suspended,
        code: '013',
      });
    }
    await cql.execute(
      'INSERT INTO account.login_social (provider_subject,provider_client_id,provider_name,email,suspended,provider_data_json,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)',
      [
        userId,//subjectId of the social network
        providerId,//client_id of the social network
        strategyName,//strategy we use in our openId
        lowerEmail,
        true,
        JSON.stringify(profileRawData),
        currentDate,
        currentDate,
      ],
      { prepare: true },
    );
    return ({
      suspended: true,
      code: '014',
    });
    // If the user doesn't exist but the email exist we create a new login_social
    // but don't allow the login (redirect with error asking to log and approve)
  }

  /**
   * Update the last_login field of the login table with the current date
   * Return nothing as it's not needed in the login process
   * @param {Object} ctx - context of KOA
   * @param {String} subject - subject id of the user
   */
  static async updateLastLogin(ctx, email) {
    try {
      await cql.execute(
        'UPDATE account.login_email SET last_login=? WHERE email=?',
        [new Date(), email],
        { prepare: true },
      );
    } catch (err) {
      err.app_rid = ctx.request.app_rid;
      ctx.log.error(err, '[Account::updateLastLogin]');
    }
  }

  /**
   * Update the last_login field of the login table with the current date
   * Return nothing as it's not needed in the login process
   * @param {Object} ctx - context of KOA
   * @param {String} subject - subject id of the user
   */
  static async updateLastLogin(ctx, email) {
    try {
      await cql.execute(
        'UPDATE account.login_email SET last_login=? WHERE email=?',
        [new Date(), email],
        { prepare: true },
      );
    } catch (err) {
      err.app_rid = ctx.request.app_rid;
      ctx.log.error(err, '[Account::updateLastLogin]');
    }
  }

  /**
   * Change the user password, throw an error if the password can't be changed.
   * @param {Object} ctx - context of KOA
   * @param {String} subject - subject id of the user
   * @param {string} newPassword - user new password
   * @param {number} alg_idx Algorithm used to encrypt the password, default to 0
   */
  static async changePassword(ctx, email, newPassword, alg_idx = 0) {
    try {
      const pwdObject = passwordManager.encrypt(newPassword, alg_idx);
      await cql.execute(
        'UPDATE account.login_email SET updated_at=?,salt=?,password=?,enc_type=? WHERE email=?',
        [new Date(), pwdObject.salt, pwdObject.password, alg_idx, email],
        { prepare: true },
      );
    } catch (err) {
      throw err;
    }
  }

  /**
   * Update the last_login field of the login table with the current date
   * Return nothing as it's not needed in the login process
   * @param {Object} ctx - context of KOA
   * @param {String} email - email of the user
   */
  /*static async updateLastUseSocial(ctx, email) {
    try {
      await cql.execute(
        'UPDATE account.login_social SET last_login=? WHERE provider_subject=?',
        [new Date(), email],
        { prepare: true },
      );
    } catch (err) {
      err.app_rid = ctx.request.app_rid;
      ctx.log.error(err, '[Account::updateLastLogin]');
    }
  }*/

  /**
   * Find the consent object for the user and the app.
   * Return an object with consent and details or null if nothing is found.
   * @param {Object} ctx - context of KOA
   * @param {String} subject - subject id of the user
   * @param {String} clientID - client id of the application
   */
  static async findConsent(ctx, subject, clientID) {
    try {
      const consent = await cql.execute(
        'SELECT consent,detail_json,updated_at FROM account.consent_subject WHERE subject = ? AND client_id = ?;',
        [driver.types.TimeUuid.fromString(subject), clientID],
        { prepare: true },
      );
      if (consent.rowLength === 1) {
        return ({
          consent: consent.rows[0].consent,
          details: (consent.rows[0].detail_json) ? JSON.stringify(consent.rows[0].detail_json) : null,
        })
      }
      return (null);
    } catch (err) {
      err.app_rid = ctx.request.app_rid;
      ctx.log.error(err, '[Account::findConsent]');
      return (null);
    }
  }

  /**
   * Create a new consent for the user and application
   * It will return null if it fails and an error log will be produced
   * Will throw an error if the inserts doesn't work
   * @param {Object} ctx - context of KOA
   * @param {Object} details - details from oidc consent prompt
   * @param {Object} appConsent - object that will be updated
  */
  static async CreateOrUpdateConsent(ctx, details, appConsent) {
    try {
      const currentDate = new Date();
      let queryConsent = {
        params: [
          driver.types.TimeUuid.fromString(appConsent.subject),//subject timeuuid,
          appConsent.client_id,//client_id text,
          appConsent.consent,//consent boolean
          (appConsent.details) ? JSON.stringify(appConsent.details) : null,
          currentDate,//updated_at timestamp,
        ]
      };
      if (details.prevConsent === null) {
        queryConsent.query = 'INSERT INTO account.consent_subject (subject,client_id,consent,detail_json,updated_at,created_at) VALUES (?,?,?,?,?,?)';
        queryConsent.params.push(currentDate);
      } else {
        queryConsent.query = 'INSERT INTO account.consent_subject (subject,client_id,consent,detail_json,updated_at) VALUES (?,?,?,?,?)';
      }
      await cql.execute(
        queryConsent.query,
        queryConsent.params,
        { prepare: true },
      );
      return (true);
    } catch (err) {
      throw (err);
    }
  }

  /**
   * Create a new user account
   * This function will parse the context received from oidc provider
   * @param {Object} ctx - koa request context
   */
  static async registerAccount(ctx) {
    try {
      const email = ctx.request.body.email.toLowerCase();

      const exist = await cql.execute(
        'SELECT email FROM account.login_email WHERE email = ?;',
        [email],
        { prepare: true },
      );
      if (exist.rowLength > 0) {
        throw new Error('ERR_UNIQUE');
      }

      const algUsed = 0; // default password encryption used
      const pwdObject = await passwordManager.encrypt(ctx.request.body.pwd, algUsed); // need to be encrypted
      const currentDate = new Date();
      const subject = driver.types.TimeUuid.now();
      const entity = driver.types.TimeUuid.now();
      const profileLocation = lookupProfileRegion();//TODO: check the country maybe

      // Move the parsing of the user here so that we can check the country just after
      // If no user is being created (no name or country) we don't allow the creation of the account
      //const userInfo = (ctx.request.body.user_info !== undefined) ? verifyValue(userDefinition, ctx.request.body.user_info) : {};
      const batchQuery = [{
        query: 'INSERT INTO account.login_email (email,subject,email_verified,mfa_type,profile_location,profile_update,suspended,updated_at,enc_type,salt,password) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
        params: [
          email, //email
          subject, //subject
          false, //email_verified
          false,//mfa_type
          profileLocation, //profile_location
          currentDate,//profile_update
          false,//suspended
          currentDate,//updated_at
          algUsed,//enc_type
          pwdObject.salt,//salt
          pwdObject.password,//password
        ]
      },{
        query: 'INSERT INTO account.legal_entity (id,creator) VALUES (?,?)',
        params: [
          entity, //subject
          subject, //email
        ]
      },{
        query: 'INSERT INTO account.subject_groups (subject,legal_id) VALUES (?,?)',
        params: [
          subject, //email
          entity, //subject
        ]
      },/*{
        query: 'INSERT INTO userdata.user_informations (subject,email,email_verified,updated_at,created_at,phone,phone_verified,name,given_name,family_name,middle_name,nickname,preferred_username,profile,picture,website,gender,birthdate,birthday_type,zoneinfo,locale) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
        params: [
          subject,//subject timeuuid,
          email,
          false,
          currentDate,//updated_at timestamp,
          currentDate,//created_at timestamp,
          (userInfo.phone) ? userInfo.phone : '',//phone text,
          (userInfo.phone_verified) ? userInfo.phone_verified : false,//phone_verified boolean,
          (userInfo.name) ? userInfo.name : '',//name text,
          (userInfo.given_name) ? userInfo.given_name : '',//given_name text,
          (userInfo.family_name) ? userInfo.family_name : '',//family_name text,
          (userInfo.middle_name) ? userInfo.middle_name : '',//middle_name text,
          (userInfo.nickname) ? userInfo.nickname : '',//nickname text,
          (userInfo.preferred_username) ? userInfo.preferred_username : '',//preferred_username text,
          (userInfo.profile) ? userInfo.profile : '',//profile text,
          (userInfo.picture) ? userInfo.picture : '',//picture text,
          (userInfo.website) ? userInfo.website : '',//website text,
          (userInfo.gender) ? userInfo.gender : '',//gender text,
          (userInfo.birthdate) ? userInfo.birthdate : '',//birthdate text,
          (userInfo.birthday_type) ? userInfo.birthday_type : 0,//birthday_type tinyint,
          (userInfo.zoneinfo) ? userInfo.zoneinfo : '',//zoneinfo text,
          (userInfo.locale) ? userInfo.locale : '',//locale text,
        ]
      }*/];
      await cql.batch(batchQuery, { prepare: true });
      // login structure
      return ({
        email,
        subject: subject.toString(),
        mfa_type: false,
        profile_location: profileLocation,
        profile_update: currentDate,
      });
    } catch (err) {
      logger.error(err, '[Account:Register]');
      throw err;
    }
  }

  /**
   * Function that lookup in the database if the email as a login exist
   * @param {*} ctx Koa context
   * @param {*} params OIDC params, containing client informations
   * @return null if login error, false if rate limit error, the login object otherwise
  */
  static async findByLogin(ctx, params) {
    try {
      if (!params.client_id) {
        ctx.log.error(params, '[Account::findByLogin]');
        return (null);
      }
      const email = ctx.request.body.email.toLowerCase();
      const rtLimit = `rtl:${email}`;
      // Check rate limit key
      const rtLogin = await ctx.redis.get(rtLimit);
      if ((rtLogin !== null) && (parseInt(rtLogin, 10) > LOGIN_RATE_LIMIT)) {
        ctx.log.error(params, '[Account::findByLogin]');
        return (false);
      }

      const login = await cql.execute(
        'SELECT subject,email,email_verified,mfa_type,enc_type,salt,password,suspended,profile_location,profile_update FROM account.login_email WHERE email=?;',
        [email],
        { prepare: true },
      );
      if (
        (login.rowLength === 1)
        && (login.rows[0].suspended !== true)
        && (await passwordManager.verify(ctx.request.body.password, login.rows[0].salt, login.rows[0].password, login.rows[0].enc_type))
      ) {
        return ({
          subject: login.rows[0].subject.toString(),
          email: login.rows[0].email,
          email_verified: login.rows[0].email_verified,
          suspended: login.rows[0].suspended,
          profile_location: login.rows[0].profile_location,
          profile_update: login.rows[0].profile_update,
        });
      }
      // Increate rate limit for wrong password
      const multi = await ctx.redis.multi();
      multi.incr(rtLimit);
      multi.expire(rtLimit, 120);
      await multi.exec();
      return (null);
    } catch (err) {
      err.app_rid = ctx.request.app_rid;
      ctx.log.error(err, '[Account::findByLogin]');
      return (null);
    }
  }
  
  /**
   * @param use - can either be "id_token" or "userinfo", depending on
   *   where the specific claims are intended to be put in.
   * @param scope - the intended scope, while oidc-provider will mask
   *   claims depending on the scope automatically you might want to skip
   *   loading some claims from external resources etc. based on this detail
   *   or not return them in id tokens but only userinfo and so on.
   */
  /*async claims(use, scope) { // eslint-disable-line no-unused-vars
    if (this.profile) {
      return {
        sub: this.accountId, // it is essential to always return a sub claim
        email: this.profile.email,
        email_verified: this.profile.email_verified,
        family_name: this.profile.family_name,
        given_name: this.profile.given_name,
        locale: this.profile.locale,
        name: this.profile.name,
      };
    }

    return {
      sub: this.accountId, // it is essential to always return a sub claim

      address: {
        country: '000',
        formatted: '000',
        locality: '000',
        postal_code: '000',
        region: '000',
        street_address: '000',
      },
      birthdate: '1987-10-16',
      email: 'johndoe@example.com',
      email_verified: false,
      family_name: 'Doe',
      gender: 'male',
      given_name: 'John',
      locale: 'en-US',
      middle_name: 'Middle',
      name: 'John Doe',
      nickname: 'Johny',
      phone_number: '+49 000 000000',
      phone_number_verified: false,
      picture: 'http://lorempixel.com/400/200/',
      preferred_username: 'johnny',
      profile: 'https://johnswebsite.com',
      updated_at: 1454704946,
      website: 'http://example.com',
      zoneinfo: 'Europe/Berlin',
    };
  }*/

  static async findByFederated(provider, claims) {
    const id = `${provider}.${claims.sub}`;
    if (!logins.get(id)) {
      logins.set(id, new Account(id, claims));
    }
    return logins.get(id);
  }

  /**
   * Find account implementation of the oidc-provider
   * @param {Object} ctx - koa request context
   * @param {String} sub - account identifier (subject)
   * @param {*} token - is a reference to the token used for which a given account is being loaded
   * is undefined in scenarios where claims are returned from authorization endpoint
   */
  static async findAccount(ctx, sub, token) {
    return {
      accountId: sub,
      // @param use {string} - can either be "id_token" or "userinfo", depending on
      //   where the specific claims are intended to be put in
      // @param scope {string} - the intended scope, while oidc-provider will mask
      //   claims depending on the scope automatically you might want to skip
      //   loading some claims from external resources or through db projection etc. based on this
      //   detail or not return them in ID Tokens but only UserInfo and so on
      // @param claims {object} - the part of the claims authorization parameter for either
      //   "id_token" or "userinfo" (depends on the "use" param)
      // @param rejected {Array[String]} - claim names that were rejected by the end-user, you might
      //   want to skip loading some claims from external resources or through db projection
      async claims(use, scope, claims, rejected) { // eslint-disable-line no-unused-vars
        try {
          // We parse the claims received, adding rejected to a hash table and then adding filtering
          const scopes = scope.split(' ');
          let filterClaims = {}; // used to filter if claims is present or adding the rejected
          for (let i = 0; i < rejected.length; i++) {
            filterClaims[rejected[i]] = null;
          }
          let userAttr = [];
          let addrAttr = [];
          for (let i = 0; i < scopes.length; i++) {
            switch (scopes[i]) {
              case "addresses":
                addrAttr = addrAttr.concat(addressDefinition.keys.filter((item) => {
                  if (filterClaims[item] === null) {
                    return false;
                  }
                  filterClaims[item] = null;
                  return true;
                }));
                break;
              default:
                if (listClaims[scopes[i]]) {// we don't put them in id_token
                  userAttr = userAttr.concat(listClaims[scopes[i]].filter((item) => {
                    if (filterClaims[item] === null) {
                      return false;
                    }
                    filterClaims[item] = null;
                    return true;
                  }));
                }
                break;
            }
          }
          const userClaims = {};
          /*if (userAttr.length > 0) {
            const user = await cql.execute(
              'SELECT email,email_verified,phone,phone_verified,name,given_name,family_name,middle_name,nickname,preferred_username,profile,picture,website,gender,birthdate,birthday_type,zoneinfo,locale,updated_at,address FROM userdata.user_informations WHERE subject=?;',
              [sub],
              { prepare: true },
            );
            if (user.rowLength === 1) {
              for (let i = 0; i < userAttr.length; i++) {
                userClaims[userAttr[i]] = user.rows[0][userAttr[i]];
              }
            }
          }*/

          /*if (addrAttr.length > 0) {
            const addresses = await cql.execute(
              'SELECT address_type,position,formatted,country,locality,postal_code,region,street_address,updated_at FROM userdata.user_addresses WHERE subject=?;',
              [sub],
              { prepare: true },
            );
            if (addresses.rowLength > 0) {
              userClaims.addresses = Array(addresses.rowLength);
              for (let i = 0; i < addresses.rowLength; i++) {
                userClaims.addresses[i] = {
                  address_type: addresses.row[i].address_type,
                  formatted: addresses.row[i].formatted,
                  country: addresses.row[i].country,
                  locality: addresses.row[i].locality,
                  postal_code: addresses.row[i].postal_code,
                  region: addresses.row[i].region,
                  street_address: addresses.row[i].street_address,
                  updated_at: addresses.row[i].updated_at,
                }
              }
            }
          }*/

          return (userClaims);
        } catch (err) {
          ctx.log.error(err, '[Account::findAccount::catch]');
          throw new Error('Error while searching the account');
        }
      },
    };
  }

}

export default Account;
