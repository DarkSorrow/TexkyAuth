import IconButton from '@mui/joy/IconButton';
import List from '@mui/joy/List';
import ListSubheader from '@mui/joy/ListSubheader';
import ListItem from '@mui/joy/ListItem';
import { useTranslation } from "react-i18next";

// Icons import
import DashboardIcon from '@mui/icons-material/Dashboard';
import SchemaIcon from '@mui/icons-material/Schema';
import StoreIcon from '@mui/icons-material/Store';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';

import { AppNavLink } from '../atoms/app-nav-link';
import { AppListButton } from '../atoms/app-list-button';
import { AppLangMenu } from '../atoms/app-lang-menu';
import { AppWalletConnect } from '../molecules/app-wallet-connect';
import { useAuth } from '../../providers/auth';
import { OIDC_URL, CLIENT_ID, LOGOUT_URL } from "../../utils/constants";


export const AppNavigation = () => {
  const { t } = useTranslation();
  const { idToken } = useAuth();
  return (
    <List size="sm" sx={{ '--List-item-radius': '8px', '--List-gap': '4px' }}>
      <ListItem nested>
        <ListSubheader>
          {t<string>('app')}
          <IconButton
            size="sm"
            variant="plain"
            color="primary"
            sx={{ '--IconButton-size': '24px', ml: 'auto' }}
          >
            <KeyboardArrowDownRoundedIcon fontSize="small" color="primary" />
          </IconButton>
        </ListSubheader>
        <List
          aria-labelledby="nav-list-browse"
          sx={{
            '& .JoyListItemButton-root': { p: '8px' },
          }}
        >
          <AppNavLink 
            icon={<DashboardIcon fontSize="small" />}
            text={t<string>('dashboard')}
            href="/"
          />
          <AppNavLink 
            icon={<SchemaIcon fontSize="small" />}
            text={t<string>('schema')}
            href="/schemas"
          />
          <AppNavLink 
            icon={<StoreIcon fontSize="small" />}
            text={t<string>('market')}
            href="/market"
          />
        </List>
      </ListItem>
      <ListItem nested sx={{ mt: 2 }}>
        <ListSubheader>
          {t<string>('settings')}
          <IconButton
            size="sm"
            variant="plain"
            color="primary"
            sx={{ '--IconButton-size': '24px', ml: 'auto' }}
          >
            <KeyboardArrowDownRoundedIcon fontSize="small" color="primary" />
          </IconButton>
        </ListSubheader>
        <List
          aria-labelledby="action-list"
          sx={{
            '& .JoyListItemButton-root': { p: '8px' },
          }}
        >
          <AppWalletConnect />
          <AppNavLink 
            icon={<AccountCircleIcon fontSize="small" />}
            text={t<string>('profile')}
            href="/profile"
          />
          <AppLangMenu />
          <AppListButton 
            icon={<LogoutIcon fontSize="small" />}
            text={t<string>('logout')}
            onClick={() => {
              if (idToken) {
                // Fix cors issue with cors check on session end
                /*const form = new FormData();
                form.append('client_id', CLIENT_ID);
                form.append('post_logout_redirect_uri', LOGOUT_URL);
                await fetch(`${OIDC_URL}/session/end`, {
                  method: 'POST',
                  body: form,
                });*/
                window.location.href = `${OIDC_URL}/session/end?client_id=${CLIENT_ID}&post_logout_redirect_uri=${encodeURIComponent(LOGOUT_URL)}`;
              } else {
                window.location.href = `${OIDC_URL}/session/end`;
              }
            }}
          />
        </List>
      </ListItem>
    </List>
  );
}
