import { createContext, useMemo, useContext, useReducer } from "react";
import { useTranslation } from 'react-i18next';
//import { nanoid } from 'nanoid';

import { onError } from '../utils/functions';
import { STORAGE_TOKEN, PREF_TOKEN } from "../utils/constants";
import { Openi18nOption, AcountsGroup, LegalEntity } from '../types/Schemas';
//import { nvFetch } from '../services/fetch';

const emptyLegal: LegalEntity = {
	shards: '',
	shardsList: [],
  name: '',
  logoJSON: {
    i: [],
    ll: {},
    dl: {},
    v: '0',
  },
	email: '',
	phone: '',
	phoneCountry: '',
	country: '',
	city: '',
	postalCode: '',
	region: '',
	streetAddress: '',
	additionalAddress: '',
  legal: {},
	extras: {},
  updatedAt: new Date(),
  updatedBy: '',
}

type direction = "ltr" | "rtl";
interface AuthState {
  userToken: string | null;
  idToken: string | null;
  exp: Date | null;
  accounts: AcountsGroup | null;
  homeURL: string;
  status: "idle" | "signOut" | "signIn";
  langDir: direction;
  openMenu: boolean;
  legalEntity: LegalEntity;
  snackbar: Openi18nOption;
}

type AuthAction =
  | {
      type: "SIGN_IN";
      token: string | null;
      idToken: string | null;
      accounts: any;
      exp: Date;
      homeURL: string;
    }
  | {
      type: "SWITCH_MENU";
      openMenu: boolean;
    }
  | {
      type: "SWITCH_LANGUAGE";
      langDir: direction;
    }
  | {
      type: "SWITCH_LEGAL";
      token: string | null;
    }
  | {
      type: "SET_LEGAL";
      legalEntity: LegalEntity;
    }
  | { type: "SIGN_OUT" }
  | {
      type: "SET_MUTATION";
      snackbar: Openi18nOption;
    };

interface AuthContextActions {
  signIn: (
    token: string,
    idToken: string,
    accounts: any,
    expire: Date,
  ) => void;
  signOut: () => void;
  changeMenu: (openMenu: boolean) => void;
  changeLanguage: (language: string) => void;
  setLegalEntity: (legalEntity: LegalEntity) => void;
  setOpenSnackbar: (open: boolean, i18nMessage: string, i18nObject?: any) => void
}

interface AuthContextType extends AuthState, AuthContextActions {}
const AuthContext = createContext<AuthContextType>({
  status: "idle",
  userToken: null,
  idToken: null,
  exp: null,
  accounts: null,
  homeURL: "",
  langDir: "ltr",
  openMenu: true,
  snackbar: { open: false, i18nMessage: '' },
  legalEntity: emptyLegal,
  signIn: () => {},
  signOut: () => {},
  changeMenu: () => {},
  changeLanguage: () => {},
  setLegalEntity: () => {},
  setOpenSnackbar: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { i18n } = useTranslation();
  const initProvider = (arg: AuthState) => {
    document.dir = i18n.dir();
    document.documentElement.setAttribute("lang", i18n.language);
    try {
      const info = localStorage.getItem(STORAGE_TOKEN);
      if (info) {
        const parsedInfo = JSON.parse(info);
        //if (parsedInfo.exp <= new Date()) {
          arg.userToken = parsedInfo.token || null;
          arg.idToken = parsedInfo.idToken || null;
          arg.exp = parsedInfo.exp;
          arg.accounts = parsedInfo.accounts;  
        //}
      }
    } catch (err) {
      onError('token error')
    }
    return arg;
  }
  const [state, dispatch] = useReducer(AuthReducer, {
    status: "idle",
    userToken: null,
    idToken: null,
    accounts: null,
    exp: null,
    homeURL: "",
    langDir: i18n.dir(),
    openMenu: true,
    legalEntity: emptyLegal,
    snackbar: { open: false, i18nMessage: '' },
  }, initProvider);

  const authActions: AuthContextActions = useMemo(
    () => ({
      signIn: async (
        token: string,
        idToken: string,
        accounts: any,
        expire: Date,
      ) => {
        const oldToken = localStorage.getItem(PREF_TOKEN);
        /*let token = null;
        if (oldToken && accounts[oldToken]) {
          token = oldToken;
        } else {
          let legalIDs = Object.keys(accounts);
          for (let i = 0; i < legalIDs.length; ++i) {
            token = legalIDs[i];
            if (accounts[legalIDs[i]].Groups.indexOf('creator')) {
              break;
            }
          }
        }*/
        console.log(idToken);
        console.log(token);
        localStorage.setItem(STORAGE_TOKEN, JSON.stringify({
          token,
          idToken,
          exp: expire,
          accounts,
        }));
        //WhenDone: Check preferences of the user?
        dispatch({
          type: "SIGN_IN",
          token,
          idToken,
          accounts,
          exp: expire,
          homeURL: "",
        });
      },
      signOut: async () => {
        localStorage.clear();
        dispatch({ type: "SIGN_OUT" });
        //form.append('state', )
      },
      changeMenu: async (openMenu: boolean) => {
        dispatch({ type: "SWITCH_MENU", openMenu });
      },
      changeLanguage: async (language: string) => {
        await i18n.changeLanguage(language);
        const langDir = i18n.dir()
        document.documentElement.setAttribute("lang", i18n.language);
        document.dir = langDir;
        dispatch({ type: "SWITCH_LANGUAGE", langDir });
      },
      changeLegal: async (token: string) => {
        localStorage.setItem(PREF_TOKEN, token);
        dispatch({ type: "SWITCH_LEGAL", token });
      },
      setLegalEntity: async (legalEntity: LegalEntity) => {
        dispatch({ type: "SET_LEGAL", legalEntity });
      },
      setOpenSnackbar: async (open: boolean, i18nMessage: string, i18nObject?: any) => {
        dispatch({ type: "SET_MUTATION", snackbar: {
          open,
          i18nMessage,
          i18nObject,
        } });
      },
      //ADD REFRESH FUNCTION
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <AuthContext.Provider value={{ ...state, ...authActions }}>
      {children}
    </AuthContext.Provider>
  );
};

const AuthReducer = (prevState: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "SIGN_IN":
      return {
        ...prevState,
        status: "signIn",
        userToken: action.token,
        idToken: action.idToken,
        accounts: action.accounts,
        exp: action.exp,
        homeURL: action.homeURL,
      };
    case "SIGN_OUT":
      return {
        ...prevState,
        status: "signOut",
        userToken: null,
        idToken: null,
        accounts: null,
      };
    case "SWITCH_MENU":
      return {
        ...prevState,
        openMenu: action.openMenu,
      };
    case "SWITCH_LANGUAGE":
      return {
        ...prevState,
        langDir: action.langDir,
      };
    case "SWITCH_LEGAL":
      return {
        ...prevState,
        userToken: action.token,
      };
    case "SET_LEGAL":
      return {
        ...prevState,
        legalEntity: action.legalEntity,
      };
    case "SET_MUTATION":
      return {
        ...prevState,
        snackbar: action.snackbar,
      };
  }
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be inside an AuthProvider with a value");
  }
  /*
    you can add more drived state here
    const isLoggedIn  = context.status ==== 'signIn'
    return ({ ...context, isloggedIn})
  */
  return context;
};
