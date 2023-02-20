import { useEffect, useState } from 'react';
import Base64 from "crypto-js/enc-base64";
import sha256 from "crypto-js/sha256";
import { nanoid } from "nanoid";
import { CLIENT_ID, REDIRECT_URL, OIDC_URL, STORAGE_CCHALLENGE } from './constants';

export const useScrollUp = () => {
  useEffect(() => {
    window.scrollTo({
      top: 0,
    });
  }, []);
}

export const base64EncodeURL = (encode: string) =>
  btoa(encode).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

/**
 * Decode a base 64 url encoded string
 * @param decode string
 * @returns string
 */
export const base64DecodeURL = (decode: string) =>
  atob(decode.replace(/-/g, "+").replace(/_/g, "/"));

/**
 * Get a code verifier and encrypt it using sha256 and send back the result in base64 encode.
 * Might create a second parameter later and pass another hash if needed
 * @param codeVerifier string
 * @return base64UrlEncoded code challenge
 */
export const getCodeChallenge = async (codeVerifier: string) => {
  const hashDigest = sha256(codeVerifier);
  return Base64.stringify(hashDigest)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
};

/**
 * Get the header used in the different queries
 * Accept is set to json by default, you can replace
 * them if needed by using the set method
 * @param token platform token
 * @param AccountID current account being used
 * @returns Headers to use
 */
export const getAuthHeader = (
  token: string,
  AccountID: string
): Headers => {
  return new Headers({
    token,
    "X-Texky-Account-ID": AccountID,
    "X-Byme-Req-ID": nanoid(16),
    "X-Byme-Client-ID": CLIENT_ID,
    Accept: "application/json",
  });
};

/**
 * Get the header used in the different queries
 * Accept is set to json by default, you can replace
 * them if needed by using the set method
 * @param token platform token
 * @param AccountID current account being used
 * @returns Headers to use
 */
export const postJsonAuthHeader = (
  token: string,
  AccountID: string,
  bodyLength: number
): Headers => {
  return new Headers({
    token,
    "X-Texky-Account-ID": AccountID,
    "X-Byme-Req-ID": nanoid(16),
    "X-Byme-Client-ID": CLIENT_ID,
    "Content-Length": `${bodyLength}`,
    "Content-Type": "application/json",
  });
};

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
//await new Promise(resolve => setTimeout(resolve, 2000));
/*const registerSchema = object({
  email: string().email('Email is invalid'),
  password: string()
    .min(8, 'Password must be more than 8 characters')
    .max(32, 'Password must be less than 32 characters'),
  passwordConfirm: string().nonempty('Please confirm your password'),
  terms: literal(true, {
    invalid_type_error: 'Accept Terms is required',
  }),
}).refine((data) => data.password === data.passwordConfirm, {
  path: ['passwordConfirm'],
  message: 'Passwords do not match',
});*/
export const onError = (error: any) => {
  console.error(error);
}

export const useDebounce = (value: any, delay: number) => {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(
    () => {
      // Update debounced value after delay
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
      // Cancel the timeout if value changes (also on delay change or unmount)
      // This is how we prevent debounced value from updating if value is changed ...
      // .. within the delay period. Timeout gets cleared and restarted.
      return () => {
        clearTimeout(handler);
      };
    },
    [value, delay] // Only re-call effect if value or delay changes
  );
  return debouncedValue;
}

export const generateUrl = async (search: string, pathname: string, hash: string) => {
  const redirectURL = encodeURIComponent(REDIRECT_URL);
  const scope = encodeURIComponent("openid email");
  const state = base64EncodeURL([pathname, search, hash].filter(Boolean).join(''));
  const codeVerifier = nanoid(64);
  sessionStorage.setItem(STORAGE_CCHALLENGE, codeVerifier);
  const codeChallenge = await getCodeChallenge(codeVerifier);
  return `${OIDC_URL}/auth?client_id=${CLIENT_ID}&scope=${scope}&response_type=code&code_challenge=${codeChallenge}&code_challenge_method=S256&state=${state}&redirect_uri=${redirectURL}`;
};
