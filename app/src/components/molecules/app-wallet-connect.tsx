import Box from '@mui/joy/Box';
import ListItem from '@mui/joy/ListItem';
import ListItemButton from '@mui/joy/ListItemButton';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import ListItemContent from '@mui/joy/ListItemContent';
import Typography from '@mui/joy/Typography';
import { useTranslation } from "react-i18next";

import { useState, useEffect } from "react"
import * as fcl from "@onflow/fcl";

const DISCOVERY_WALLET = 'https://fcl-discovery.onflow.org/testnet/authn';
const API = 'https://rest-testnet.onflow.org';

// <ListItemButton variant="soft" color="primary">
export const AppWalletConnect = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState<FlowUser>();
  useEffect(() => fcl.currentUser.subscribe(setUser), []); // sets the callback for FCL to use

  const connectWallet = async () => {
    const res = await fcl.authenticate();
  }

  useEffect(() => {
    console.log(user);
  }, [user])

  fcl.config()
  .put('app.detail.icon','https://placekitten.com/g/200/200')
  .put('app.detail.title','Kitten Dapp')
  .put('accessNode.api', API)
  .put('discovery.wallet', DISCOVERY_WALLET);

  return (
    <ListItem>
      {(user?.loggedIn) ?
        <ListItemButton onClick={fcl.unauthenticate}>
          <ListItemDecorator>
            <Box
              sx={{
                width: '10px',
                height: '10px',
                borderRadius: '99px',
                bgcolor: 'success.400',
              }}
            />
          </ListItemDecorator>
          <ListItemContent>
            <Typography level="body2" noWrap>
              {t<string>('dWallet', {address: user.addr})}
            </Typography>
          </ListItemContent>
        </ListItemButton>
        :
        <ListItemButton onClick={connectWallet}>
          <ListItemDecorator>
            <Box
              sx={{
                width: '10px',
                height: '10px',
                borderRadius: '99px',
                bgcolor: 'danger.400',
              }}
            />
          </ListItemDecorator>
          <ListItemContent>{t<string>('cWallet')}</ListItemContent>
        </ListItemButton>
      }
      
    </ListItem>
  );
};
