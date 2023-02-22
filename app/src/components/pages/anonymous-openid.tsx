import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CircularProgress from '@mui/joy/CircularProgress';
import Alert from '@mui/joy/Alert';
import Stack from '@mui/joy/Stack';
import Button from '@mui/joy/Button';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import { useTranslation } from "react-i18next";

import { generateUrl } from "../../utils/functions";
import { CLIENT_ID, REDIRECT_URL, STORAGE_CCHALLENGE, OIDC_URL } from "../../utils/constants";
import { AnonymousOpenIDTemplate } from "../templates/anonymous-openid";
import { useAuth } from "../../providers/auth";

interface OIDCPayload {
  access_token: string;
  expires_in: number;
  id_token: string;
  refresh_token?: string;
  scope: string;
  token_type: string;
}

export const RedirectOIDC = () => {
  const { pathname, search, hash } = useLocation();
  useEffect(() => {
    const initState = async () => {
      const oidcURL = await generateUrl(search, pathname, hash);
      window.location.replace(oidcURL);
    };
    initState();
  }, [pathname, search, hash]);

  // return <div>Redirecting...</div>;
  return (
    <AnonymousOpenIDTemplate
      display={
      <CircularProgress aria-busy={true} color="info" sx={{ '--CircularProgress-size': '80px' }}>
        <LoginIcon color="info" />
      </CircularProgress>
      }
    />
  );
};

export const RedirectSignupOIDC = () => {
  const { pathname, search, hash } = useLocation();
  useEffect(() => {
    const initState = async () => {
      const oidcURL = await generateUrl(search, pathname, hash);
      window.location.replace(`${oidcURL}&screen_tmpl=register`);
    };
    initState();
  }, [pathname, search, hash]);

  return (
    <AnonymousOpenIDTemplate
      display={
      <CircularProgress aria-busy={true} color="info" sx={{ '--CircularProgress-size': '80px' }}>
        <LoginIcon color="info" />
      </CircularProgress>
      }
    />
  );
};

export const CallbackOIDC = () => {
  const { t } = useTranslation();
  const { search } = useLocation();
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const abortController  = new AbortController();
    const initState = async () => {
      const redirectURL = encodeURIComponent(REDIRECT_URL);
      try {
        const codeVerifier = await sessionStorage.getItem(
          STORAGE_CCHALLENGE
        );
        const params = new URLSearchParams(search);
        // Query code from oidc endpoint
        let respFetch = await fetch(`${OIDC_URL}/token`, {
          method: "POST",
          signal: abortController.signal,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            Accept: "application/json",
          },
          body: `client_id=${
            CLIENT_ID
          }&grant_type=authorization_code&code=${params.get(
            "code"
          )}&code_verifier=${codeVerifier}&redirect_uri=${redirectURL}`,
        });
        const oidcPayload: OIDCPayload = await respFetch.json();
        await signIn(
          oidcPayload.access_token, oidcPayload.id_token,
          null, new Date(new Date().getTime() + oidcPayload.expires_in),
        );
        await navigate('/');
      } catch (err) {
        setLoading(false);
        console.log(err);
        // redirect to error page with a new login button? and maybe force prompt login?
      }
    };
    initState();
    return () => {
      console.log("unmounting auth provider");
      abortController.abort();
    };
    // get code and perform query to get child with code challenge etc...
  }, [search, signIn, navigate]);

  // return <div>Signing you in...</div>;
  if (!loading)
    return (
      <AnonymousOpenIDTemplate
      display={
        <Stack spacing={2} sx={{ width: '100%' }}>
          <Alert color="danger">{t<string>('error.api.Unknown')}</Alert>
          <Button onClick={
            () => window.location.replace(`${OIDC_URL}/session/end`)
          }>{t<string>('logout')}</Button>
        </Stack>
      }
      />
    );
  return (
    <AnonymousOpenIDTemplate
      display={
      <CircularProgress aria-busy={true} color="info" sx={{ '--CircularProgress-size': '80px' }}>
        <LoginIcon color="info" />
      </CircularProgress>
      }
    />
  );
};

export const CallbackLogout = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    signOut();
    navigate('/');
  }, [signOut, navigate]);

  // return <div>Logout completed...</div>;
  return (
    <AnonymousOpenIDTemplate
      display={
      <CircularProgress aria-busy={true} color="danger" sx={{ '--CircularProgress-size': '80px' }}>
        <LogoutIcon color="warning" />
      </CircularProgress>
      }
    />
  );
};
