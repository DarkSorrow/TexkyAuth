/**
 * Supported scopes with their respective claims
 * list of addresses values = addressDefinition.keys in account.js line 71
 */
export default {
  amr: null,
  address: ['address'], // check the claim function in account.js to get the full list
  addresses: ['addresses'], // check the claim function in account.js to get the full list
  email: ['email', 'email_verified'],
  phone: ['phone_number', 'phone_number_verified'],
  profile: ['family_name', 'gender', 'given_name', 'locale', 'middle_name',
    'picture', 'preferred_username', 'profile', 'nickname'],
};
