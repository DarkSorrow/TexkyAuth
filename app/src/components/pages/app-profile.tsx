import axios, { Axios, AxiosResponse } from 'axios';
import { useCallback, useEffect, useMemo, useState } from "react";
import { DeleteButton } from "../atoms/delete-button";
import SendIcon from '@mui/icons-material/Send';

import { Container, Grid } from "@mui/material";
import { PrimaryButton } from "../atoms/primary-button";
import { ApplicationList } from "../molecules/application-list";
import { NoData } from "../molecules/no-data";
import { useAuth } from '../../providers/auth';
import * as fcl from "@onflow/fcl";
import { FETCH_PROFILE_APPLICATIONS, MOVE_CUSTODY_APPLICATIONS_URL } from '../../utils/constants';


export interface Application {
    id:   string;
    consent:     boolean;
    created_at:  Date;
    detail_json: string;
    updated_at:  Date;
  }

export interface DataApplication {
  data: {
    client_id: string;
    consent:     boolean;
    created_at:  Date;
    detail_json: string;
    updated_at:  Date;
  }[]
}

export const AppProfilePage = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const { userToken } = useAuth();
  const [user, setUser] = useState<FlowUser>();

  useEffect(() => fcl.currentUser.subscribe(setUser), []); 
  

  const client = useMemo(() => new Axios({
    headers: {
      Authorization: `Bearer ${userToken}`
    },
    transformResponse: (data) => JSON.parse(data),
    }), [userToken]);

  const onDelete = () => {
    console.log("deletion");
    return new Promise<boolean>(() => true);
  }

  const fetchAccounts = useCallback(async () => {
    const { data: { data } } = await client.get<DataApplication>(FETCH_PROFILE_APPLICATIONS, {
      data: {
        legal_id: '9e15c371-b5c3-11ed-858c-650c3fb1e72a'
      }
    });
    setApplications(data.map(el => ({...el, id: el.client_id, detail_json: JSON.parse(el.detail_json) })));
  }, [client])
  
  const onTransfer = useCallback(async () => {
    const promises: Promise<AxiosResponse>[] = [];

    try {
      applications.forEach((appClientId) => {
        promises.push(axios({
          url : MOVE_CUSTODY_APPLICATIONS_URL,
          method: 'post',
          data: { destAddress: user?.addr, client_id: appClientId },
          headers: { Authorization: `Bearer ${userToken}` }
        }))
      })
  
      await Promise.all(promises);
  
      return true;
    } catch (e) {
      return false;
    }
  }, [applications, user?.addr, userToken])

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts])

  return <>
    <Container>
      <h1>Hello user</h1>
    </Container>
    <Container>
      <h3> List of your applications: </h3>
      {applications.length > 0 ? <ApplicationList applications={applications} /> : <NoData />} 
    </Container>
    <Container>
      <h3>List of your actions:</h3> 
      <Grid container spacing={2}>
        <Grid item>
          <PrimaryButton disabled={!user?.loggedIn} text="Take over all Accounts" startIcon={<SendIcon />} onClick={onTransfer} />
        </Grid>
        <Grid item>
          <DeleteButton text="Delete Account" onDelete={onDelete} />
        </Grid>
      </Grid>
    </Container>
    </>
}
