import {Axios} from 'axios';
import { useEffect, useState } from "react";
import { DeleteButton } from "../atoms/delete-button";
import SendIcon from '@mui/icons-material/Send';

import { Container, Grid } from "@mui/material";
import { PrimaryButton } from "../atoms/primary-button";
import { ApplicationList } from "../molecules/application-list";
import { NoData } from "../molecules/no-data";
import { useAuth } from '../../providers/auth';



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

  const client = new Axios({
    baseURL: 'http://localhost:8080',
    headers: {
      Authorization: `Bearer ${userToken}`
    },
    transformResponse: (data) => JSON.parse(data),
    });

  const onDelete = () => {
    console.log("deletion");
    return true;
  }

  const fetchAccounts = async () => {
    const { data: { data } } = await client.get<DataApplication>('/api/profile/applications', {
      data: {
        legal_id: '9e15c371-b5c3-11ed-858c-650c3fb1e72a'
      }
    });
    setApplications(data.map(el => ({...el, id: el.client_id, detail_json: JSON.parse(el.detail_json) })));
  }
  
  const onTransfer = () => {
    alert('custody transfer in progress');
    return true;
  }

  useEffect(() => {
    fetchAccounts();
  }, [])

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
          <PrimaryButton text="Take over all Accounts" startIcon={<SendIcon />} onClick={onTransfer} />
        </Grid>
        <Grid item>
          <DeleteButton text="Delete Account" onDelete={onDelete} />
        </Grid>
      </Grid>
    </Container>
    </>
}
